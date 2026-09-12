import type { FastifyPluginAsync } from "fastify";
import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  candidateApplicationSchema,
  candidateQuerySchema,
  contactMessageSchema,
  hireRequestSchema,
  type PublicPlan,
  type PublicTestimonial,
} from "@maidhire/shared";
import sharp from "sharp";
import { prisma } from "../lib/prisma.js";
import { badRequest, notFound } from "../lib/errors.js";
import { candidateSlug, displayName, hashIp } from "../lib/util.js";
import { searchPublic, toPublic, toPublicDetail } from "../services/candidates.js";
import { sendMail, templates } from "../services/email.js";
import { storage } from "../services/storage.js";
import { env } from "../lib/env.js";
import { PUBLIC_CANDIDATE_STATUSES } from "@maidhire/shared";

const formLimit = { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } };

const publicRoutes: FastifyPluginAsync = async (app) => {
  /* ---- candidates ---- */
  app.get("/candidates", async (req) => {
    const q = candidateQuerySchema.parse(req.query);
    return searchPublic(q);
  });

  app.get("/candidates/featured", async () => {
    const items = await prisma.candidate.findMany({
      where: { status: { in: [...PUBLIC_CANDIDATE_STATUSES] } },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
      take: 8,
    });
    return items.map(toPublic);
  });

  app.get<{ Params: { slug: string } }>("/candidates/:slug", async (req) => {
    const c = await prisma.candidate.findFirst({
      where: { slug: req.params.slug, status: { in: [...PUBLIC_CANDIDATE_STATUSES] } },
    });
    if (!c) throw notFound("Candidate");
    return toPublicDetail(c);
  });

  /* ---- plans & testimonials ---- */
  app.get("/plans", async (): Promise<PublicPlan[]> => {
    const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return plans.map(({ slug, name, tagline, priceAed, priceSar, features, footnote, isPopular }) => ({
      slug, name, tagline, priceAed, priceSar, features, footnote, isPopular,
    }));
  });

  app.get("/testimonials", async (): Promise<PublicTestimonial[]> => {
    const rows = await prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 12 });
    return rows.map(({ id, authorName, authorLocation, quote, rating }) => ({ id, authorName, authorLocation, quote, rating }));
  });

  /* ---- forms ---- */
  app.post("/contact", formLimit, async (req, reply) => {
    const data = contactMessageSchema.parse(req.body);
    const row = await prisma.contactMessage.create({
      data: { name: data.name, email: data.email, phone: data.phone, service: data.service, message: data.message, ipHash: hashIp(req.ip) },
    });
    if (env.NOTIFY_EMAIL) {
      void sendMail({ to: env.NOTIFY_EMAIL, subject: `New message from ${data.name}`, html: templates.newContact(data), replyTo: data.email }, req.log);
    }
    return reply.status(201).send({ id: row.id });
  });

  app.post("/hire-requests", formLimit, async (req, reply) => {
    const data = hireRequestSchema.parse(req.body);
    if (data.candidateId) {
      const exists = await prisma.candidate.findFirst({ where: { id: data.candidateId, status: { in: [...PUBLIC_CANDIDATE_STATUSES] } }, select: { id: true } });
      if (!exists) throw badRequest("Selected candidate is no longer available", { candidateId: "Candidate unavailable" });
    }
    if (data.planSlug) {
      const plan = await prisma.plan.findFirst({ where: { slug: data.planSlug, isActive: true }, select: { slug: true } });
      if (!plan) throw badRequest("Unknown plan", { planSlug: "Unknown plan" });
    }
    const { consent: _c, website: _w, ...rest } = data;
    const row = await prisma.hireRequest.create({ data: { ...rest, ipHash: hashIp(req.ip) } });
    if (env.NOTIFY_EMAIL) {
      void sendMail({ to: env.NOTIFY_EMAIL, subject: `New hire request — ${data.city}`, html: templates.newHireRequest(rest), replyTo: data.email }, req.log);
    }
    void sendMail({ to: data.email, subject: "We've received your request — MaidHire", html: templates.customerAck(data.fullName) }, req.log);
    return reply.status(201).send({ id: row.id });
  });

  /**
   * Candidate application: multipart/form-data with a `payload` JSON field plus optional files:
   * `photo` (image) and `documents` (image/pdf, up to 4).
   */
  app.post("/candidates/apply", { config: { rateLimit: { max: 3, timeWindow: "30 minutes" } } }, async (req, reply) => {
    if (!req.isMultipart()) throw badRequest("Expected multipart form data");

    let payloadRaw: string | null = null;
    let payloadParsed: unknown;
    let photo: { buffer: Buffer; mime: string } | null = null;
    const docs: { buffer: Buffer; mime: string; name: string }[] = [];

    for await (const part of req.parts({ limits: { files: 5, fileSize: MAX_DOCUMENT_BYTES, fields: 5 } })) {
      if (part.type === "field" && part.fieldname === "payload") {
        // @fastify/multipart auto-parses a field whose part carries Content-Type: application/json,
        // handing back an object instead of a string — accept either shape.
        if (typeof part.value === "string") payloadRaw = part.value;
        else payloadParsed = part.value;
      } else if (part.type === "file") {
        const buffer = await part.toBuffer();
        if (part.file.truncated) throw badRequest("A file exceeds the size limit");
        if (part.fieldname === "photo") {
          if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(part.mimetype) || buffer.length > MAX_IMAGE_BYTES)
            throw badRequest("Photo must be a JPG, PNG or WebP under 5 MB", { photo: "Invalid photo" });
          photo = { buffer, mime: part.mimetype };
        } else if (part.fieldname === "documents") {
          if (!(ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(part.mimetype))
            throw badRequest("Documents must be JPG, PNG, WebP or PDF", { documents: "Invalid document type" });
          if (docs.length >= 4) throw badRequest("Maximum 4 documents");
          docs.push({ buffer, mime: part.mimetype, name: part.filename });
        }
      }
    }
    if (!payloadRaw && payloadParsed === undefined) throw badRequest("Missing form payload");
    let parsedJson: unknown = payloadParsed;
    if (payloadRaw) {
      try {
        parsedJson = JSON.parse(payloadRaw);
      } catch {
        throw badRequest("Malformed form payload");
      }
    }
    const data = candidateApplicationSchema.parse(parsedJson);

    const store = await storage();
    let photoUrl: string | null = null;
    if (photo) {
      // Re-encode through sharp: strips metadata, normalises size, and neutralises malicious image payloads.
      const p = photo as { buffer: Buffer; mime: string };
      const webp = await sharp(p.buffer).rotate().resize(800, 1000, { fit: "cover", position: "attention" }).webp({ quality: 82 }).toBuffer();
      photoUrl = (await store.put(webp, { folder: "photos", ext: "webp", contentType: "image/webp", isPublic: true })).url;
    }

    const { consent: _c, website: _w, references, email, whatsapp, ...rest } = data;
    const candidate = await prisma.candidate.create({
      data: {
        ...rest,
        email: email || null,
        whatsapp: whatsapp || null,
        dateOfBirth: new Date(data.dateOfBirth),
        slug: candidateSlug(data.firstName, data.lastName),
        displayName: displayName(data.firstName, data.lastName),
        photoUrl,
        status: "APPLIED",
        references: { create: references },
        statusLogs: { create: { toStatus: "APPLIED", note: "Self-registered via website" } },
      },
    });

    for (const d of docs) {
      const ext = d.mime === "application/pdf" ? "pdf" : d.mime.split("/")[1];
      const stored = await store.put(d.buffer, { folder: `documents/${candidate.id}`, ext, contentType: d.mime, isPublic: false });
      await prisma.candidateDocument.create({
        data: { candidateId: candidate.id, type: "OTHER", fileName: d.name.slice(0, 120), storageKey: stored.key, mimeType: d.mime, sizeBytes: d.buffer.length },
      });
    }

    if (env.NOTIFY_EMAIL) {
      void sendMail({ to: env.NOTIFY_EMAIL, subject: `New candidate application — ${data.firstName} ${data.lastName}`, html: templates.newApplication(data) }, req.log);
    }
    return reply.status(201).send({ id: candidate.id });
  });
};

export default publicRoutes;
