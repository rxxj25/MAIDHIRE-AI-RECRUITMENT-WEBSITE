import type { FastifyPluginAsync } from "fastify";
import { guestLoginSchema, guestSignupSchema } from "@maidhire/shared";
import { prisma } from "../lib/prisma.js";
import { DUMMY_HASH, GUEST_COOKIE_NAME, guestCookieOptions, hashPassword, signGuestToken, verifyPassword } from "../lib/auth.js";
import { badRequest, unauthorized } from "../lib/errors.js";

const guestRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/signup", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const { confirmPassword: _c, ...data } = guestSignupSchema.parse(req.body);
    const existing = await prisma.guestUser.findUnique({ where: { email: data.email } });
    if (existing) throw badRequest("An account with this email already exists", { email: "Already registered" });
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.guestUser.create({ data: { email: data.email, name: data.name, passwordHash } });
    const token = await signGuestToken({ sub: user.id, email: user.email, name: user.name });
    reply.setCookie(GUEST_COOKIE_NAME, token, guestCookieOptions);
    return reply.status(201).send({ user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const { email, password } = guestLoginSchema.parse(req.body);
    const user = await prisma.guestUser.findUnique({ where: { email } });
    const ok = user ? await verifyPassword(user.passwordHash, password) : (await verifyPassword(DUMMY_HASH, password), false);
    if (!user || !ok) throw unauthorized("Invalid email or password");
    await prisma.guestUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = await signGuestToken({ sub: user.id, email: user.email, name: user.name });
    reply.setCookie(GUEST_COOKIE_NAME, token, guestCookieOptions);
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post("/auth/logout", async (_req, reply) => {
    reply.clearCookie(GUEST_COOKIE_NAME, { path: "/" });
    return { ok: true };
  });

  // Everything below requires a signed-in guest.
  app.register(async (priv) => {
    priv.addHook("preHandler", priv.requireGuest);

    priv.get("/auth/me", async (req) => ({ user: req.guest }));

    /** Hire requests / messages this guest has submitted, matched by the email on their account. */
    priv.get("/my-activity", async (req) => {
      const email = req.guest!.email;
      const [requests, messages] = await prisma.$transaction([
        prisma.hireRequest.findMany({ where: { email }, orderBy: { createdAt: "desc" }, select: { id: true, service: true, city: true, country: true, status: true, createdAt: true } }),
        prisma.contactMessage.findMany({ where: { email }, orderBy: { createdAt: "desc" }, select: { id: true, message: true, status: true, createdAt: true } }),
      ]);
      return { requests, messages };
    });
  });
};

export default guestRoutes;
