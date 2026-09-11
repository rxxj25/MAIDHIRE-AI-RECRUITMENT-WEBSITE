import type { FastifyPluginAsync } from "fastify";
import {
  adminLoginSchema,
  candidateAdminUpdateSchema,
  candidateStatus,
  candidateStatusUpdateSchema,
  messageStatusUpdateSchema,
  paginationSchema,
  planUpsertSchema,
  requestStatus,
  requestStatusUpdateSchema,
  type AdminStats,
} from "@maidhire/shared";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { COOKIE_NAME, cookieOptions, signAdminToken, verifyPassword } from "../lib/auth.js";
import { notFound, unauthorized } from "../lib/errors.js";
import { paginate } from "../lib/util.js";
import { storage } from "../services/storage.js";

const adminRoutes: FastifyPluginAsync = async (app) => {
  /* ---- session ---- */
  app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const { email, password } = adminLoginSchema.parse(req.body);
    const user = await prisma.adminUser.findUnique({ where: { email } });
    // Constant-ish time: always run a verify even when the user is missing.
    const ok = user ? await verifyPassword(user.passwordHash, password) : (await verifyPassword("$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", password), false);
    if (!user || !ok) throw unauthorized("Invalid email or password");
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = await signAdminToken({ sub: user.id, email: user.email, name: user.name });
    reply.setCookie(COOKIE_NAME, token, cookieOptions);
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post("/auth/logout", async (_req, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return { ok: true };
  });

  // Everything below requires an authenticated admin.
  app.register(async (priv) => {
    priv.addHook("preHandler", priv.requireAdmin);

    priv.get("/auth/me", async (req) => ({ user: req.admin }));

    /* ---- dashboard ---- */
    priv.get("/stats", async (): Promise<AdminStats> => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      const byStatus = await prisma.candidate.groupBy({ by: ["status"], _count: { _all: true } });
      const [candTotal, reqTotal, reqNew, req30, msgTotal, msgUnread] = await prisma.$transaction([
        prisma.candidate.count(),
        prisma.hireRequest.count(),
        prisma.hireRequest.count({ where: { status: "NEW" } }),
        prisma.hireRequest.count({ where: { createdAt: { gte: since } } }),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      ]);
      return {
        candidates: { total: candTotal, byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])) },
        requests: { total: reqTotal, new: reqNew, last30Days: req30 },
        messages: { total: msgTotal, unread: msgUnread },
      };
    });

    /* ---- candidates ---- */
    priv.get("/candidates", async (req) => {
      const q = paginationSchema.extend({ status: candidateStatus.optional(), q: z.string().trim().max(60).optional() }).parse(req.query);
      const where = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.q
          ? { OR: [{ firstName: { contains: q.q, mode: "insensitive" as const } }, { lastName: { contains: q.q, mode: "insensitive" as const } }, { phone: { contains: q.q } }] }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.candidate.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(q.page, q.pageSize), include: { _count: { select: { documents: true } } } }),
        prisma.candidate.count({ where }),
      ]);
      return { items, page: q.page, pageSize: q.pageSize, total, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
    });

    priv.get<{ Params: { id: string } }>("/candidates/:id", async (req) => {
      const c = await prisma.candidate.findUnique({
        where: { id: req.params.id },
        include: { documents: true, references: true, statusLogs: { orderBy: { createdAt: "desc" }, include: { changedBy: { select: { name: true } } } }, requests: { orderBy: { createdAt: "desc" }, take: 10 } },
      });
      if (!c) throw notFound("Candidate");
      const store = await storage();
      return { ...c, documents: c.documents.map((d) => ({ ...d, url: store.publicUrl(d.storageKey) })) };
    });

    priv.patch<{ Params: { id: string } }>("/candidates/:id", async (req) => {
      const data = candidateAdminUpdateSchema.parse(req.body);
      const c = await prisma.candidate.update({ where: { id: req.params.id }, data }).catch(() => null);
      if (!c) throw notFound("Candidate");
      return c;
    });

    priv.post<{ Params: { id: string } }>("/candidates/:id/status", async (req) => {
      const { status, note } = candidateStatusUpdateSchema.parse(req.body);
      const current = await prisma.candidate.findUnique({ where: { id: req.params.id }, select: { status: true } });
      if (!current) throw notFound("Candidate");
      const [updated] = await prisma.$transaction([
        prisma.candidate.update({ where: { id: req.params.id }, data: { status } }),
        prisma.candidateStatusLog.create({ data: { candidateId: req.params.id, fromStatus: current.status, toStatus: status, note, changedById: req.admin!.sub } }),
      ]);
      return updated;
    });

    priv.delete<{ Params: { id: string } }>("/candidates/:id", async (req) => {
      const c = await prisma.candidate.findUnique({ where: { id: req.params.id }, include: { documents: true } });
      if (!c) throw notFound("Candidate");
      const store = await storage();
      await Promise.all(c.documents.map((d) => store.remove(d.storageKey)));
      await prisma.candidate.delete({ where: { id: c.id } });
      return { ok: true };
    });

    /* ---- hire requests ---- */
    priv.get("/requests", async (req) => {
      const q = paginationSchema.extend({ status: requestStatus.optional() }).parse(req.query);
      const where = q.status ? { status: q.status } : {};
      const [items, total] = await prisma.$transaction([
        prisma.hireRequest.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(q.page, q.pageSize), include: { candidate: { select: { displayName: true, slug: true } } } }),
        prisma.hireRequest.count({ where }),
      ]);
      return { items, page: q.page, pageSize: q.pageSize, total, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
    });

    priv.patch<{ Params: { id: string } }>("/requests/:id", async (req) => {
      const data = requestStatusUpdateSchema.parse(req.body);
      const r = await prisma.hireRequest.update({ where: { id: req.params.id }, data }).catch(() => null);
      if (!r) throw notFound("Request");
      return r;
    });

    /* ---- contact messages ---- */
    priv.get("/messages", async (req) => {
      const q = paginationSchema.parse(req.query);
      const [items, total] = await prisma.$transaction([
        prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, ...paginate(q.page, q.pageSize) }),
        prisma.contactMessage.count(),
      ]);
      return { items, page: q.page, pageSize: q.pageSize, total, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
    });

    priv.patch<{ Params: { id: string } }>("/messages/:id", async (req) => {
      const data = messageStatusUpdateSchema.parse(req.body);
      const m = await prisma.contactMessage.update({ where: { id: req.params.id }, data }).catch(() => null);
      if (!m) throw notFound("Message");
      return m;
    });

    /* ---- plans ---- */
    priv.get("/plans", async () => prisma.plan.findMany({ orderBy: { sortOrder: "asc" } }));
    priv.put("/plans", async (req) => {
      const data = planUpsertSchema.parse(req.body);
      return prisma.plan.upsert({ where: { slug: data.slug }, create: data, update: data });
    });
  });
};

export default adminRoutes;
