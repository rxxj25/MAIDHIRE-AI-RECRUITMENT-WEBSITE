import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../apps/api/src/app.js";

/**
 * Vercel serverless entry point. buildApp() never calls .listen() — it just constructs the Fastify
 * instance — so it's safe to build once per warm container and reuse across invocations. Requests are
 * forwarded via app.server.emit("request", ...) rather than a Fastify-specific adapter package: Fastify's
 * `server` is a real node:http server, and emitting "request" on it runs the exact same routing/plugin
 * pipeline as app.listen() would, without actually binding a port (which Vercel wouldn't let us keep open
 * between invocations anyway).
 */
let appPromise: ReturnType<typeof buildApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!appPromise) appPromise = buildApp();
  const app = await appPromise;
  await app.ready();
  app.server.emit("request", req, res);
}
