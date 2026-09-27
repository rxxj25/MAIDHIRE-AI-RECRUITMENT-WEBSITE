import type { FastifyPluginAsync } from "fastify";
import { candidateLoginSchema } from "@maidhire/shared";
import { prisma } from "../lib/prisma.js";
import { CANDIDATE_COOKIE_NAME, DUMMY_HASH, candidateCookieOptions, signCandidateToken, verifyPassword } from "../lib/auth.js";
import { notFound, unauthorized } from "../lib/errors.js";
import { storage } from "../services/storage.js";

/** Candidate-facing auth + "my application" status. Signup happens via /api/candidates/apply. */
const candidateRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const { email, password } = candidateLoginSchema.parse(req.body);
    const user = await prisma.candidate.findUnique({ where: { email } });
    const ok = user?.passwordHash ? await verifyPassword(user.passwordHash, password) : (await verifyPassword(DUMMY_HASH, password), false);
    if (!user || !ok) throw unauthorized("Invalid email or password");
    const token = await signCandidateToken({ sub: user.id, email: user.email!, name: user.displayName });
    reply.setCookie(CANDIDATE_COOKIE_NAME, token, candidateCookieOptions);
    return { user: { id: user.id, email: user.email, name: user.displayName } };
  });

  app.post("/auth/logout", async (_req, reply) => {
    reply.clearCookie(CANDIDATE_COOKIE_NAME, { path: "/" });
    return { ok: true };
  });

  // Everything below requires a signed-in candidate.
  app.register(async (priv) => {
    priv.addHook("preHandler", priv.requireCandidate);

    priv.get("/auth/me", async (req) => ({ user: req.candidateAuth }));

    /** The candidate's own full record — visible to them regardless of public/verification status. */
    priv.get("/me", async (req) => {
      const c = await prisma.candidate.findUnique({ where: { id: req.candidateAuth!.sub }, include: { documents: true, statusLogs: { orderBy: { createdAt: "desc" } } } });
      if (!c) throw notFound("Candidate");
      const store = await storage();
      const { passwordHash: _ph, ...rest } = c;
      return { ...rest, documents: rest.documents.map((d) => ({ ...d, url: store.publicUrl(d.storageKey) })) };
    });
  });
};

export default candidateRoutes;
