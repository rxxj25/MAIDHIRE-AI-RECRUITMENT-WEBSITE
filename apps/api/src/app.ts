import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { env } from "./lib/env.js";
import { errorHandler } from "./lib/errors.js";
import authPlugin from "./plugins/auth.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import guestRoutes from "./routes/guest.js";
import candidateRoutes from "./routes/candidate.js";
import voiceRoutes from "./routes/voice.js";
import vapiRoutes from "./routes/vapi.js";
import { localRoot } from "./services/storage.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.isProd
      ? { level: "info", redact: ["req.headers.authorization", "req.headers.cookie"] }
      : { level: "debug", transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } } },
    trustProxy: true,
    bodyLimit: 1024 * 64, // JSON bodies; multipart has its own limits
  });

  await app.register(helmet, { crossOriginResourcePolicy: { policy: "cross-origin" } });
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow same-origin/no-origin (curl, server-to-server) and configured browser origins.
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
  });
  await app.register(cookie);
  await app.register(multipart);
  await app.register(formbody); // Twilio webhooks post application/x-www-form-urlencoded
  await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });
  await app.register(authPlugin);

  if (env.STORAGE_DRIVER === "local") {
    // Only public photos are served; private documents live under /documents and are not exposed.
    await app.register(fastifyStatic, { root: localRoot, prefix: "/files/", serve: true, decorateReply: false, allowedPath: (p) => p.startsWith("/photos/") });
  }

  app.setErrorHandler(errorHandler);
  app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));
  await app.register(publicRoutes, { prefix: "/api" });
  await app.register(guestRoutes, { prefix: "/api" });
  await app.register(candidateRoutes, { prefix: "/api/candidate" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(voiceRoutes, { prefix: "/api/voice" });
  await app.register(vapiRoutes, { prefix: "/api/vapi" });

  return app;
}
