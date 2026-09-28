import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { buildApp as BuildAppFn } from "../apps/api/src/app.js";

// The Vercel Postgres/Neon marketplace integration on this project is configured with the
// "DATABASE" env var prefix, which should populate DATABASE_URL directly — but that specific
// key doesn't get synced (a known quirk of the integration), while DATABASE_POSTGRES_URL /
// DATABASE_POSTGRES_URL_NON_POOLING do. Backfill before anything imports app.ts, since its
// import chain validates DATABASE_URL at module-load time. Done via a lazy dynamic import
// (rather than a top-level await) since this file is compiled as CommonJS.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_POSTGRES_URL_NON_POOLING;
}

/**
 * Vercel serverless entry point. buildApp() never calls .listen() — it just constructs the Fastify
 * instance — so it's safe to build once per warm container and reuse across invocations. Requests are
 * forwarded via app.server.emit("request", ...) rather than a Fastify-specific adapter package: Fastify's
 * `server` is a real node:http server, and emitting "request" on it runs the exact same routing/plugin
 * pipeline as app.listen() would, without actually binding a port (which Vercel wouldn't let us keep open
 * between invocations anyway).
 */
let appPromise: ReturnType<typeof BuildAppFn> | undefined;

async function getApp() {
  if (!appPromise) {
    appPromise = import("../apps/api/src/app.js").then((m) => m.buildApp());
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
