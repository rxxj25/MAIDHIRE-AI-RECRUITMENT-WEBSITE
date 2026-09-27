import fp from "fastify-plugin";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CANDIDATE_COOKIE_NAME,
  COOKIE_NAME,
  GUEST_COOKIE_NAME,
  verifyAdminToken,
  verifyCandidateToken,
  verifyGuestToken,
  type AdminClaims,
  type CandidateClaims,
  type GuestClaims,
} from "../lib/auth.js";
import { unauthorized } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    admin?: AdminClaims;
    guest?: GuestClaims;
    candidateAuth?: CandidateClaims;
  }
  interface FastifyInstance {
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireGuest: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireCandidate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.decorateRequest("admin", undefined);
  app.decorateRequest("guest", undefined);
  app.decorateRequest("candidateAuth", undefined);

  app.decorate("requireAdmin", async (request: FastifyRequest) => {
    const token = request.cookies[COOKIE_NAME];
    const claims = token ? await verifyAdminToken(token) : null;
    if (!claims) throw unauthorized();
    // CSRF defence-in-depth: state-changing admin calls must carry the custom header set by our SPA.
    if (request.method !== "GET" && request.headers["x-requested-with"] !== "maidhire-admin") {
      throw unauthorized("Missing request header");
    }
    request.admin = claims;
  });

  app.decorate("requireGuest", async (request: FastifyRequest) => {
    const token = request.cookies[GUEST_COOKIE_NAME];
    const claims = token ? await verifyGuestToken(token) : null;
    if (!claims) throw unauthorized();
    if (request.method !== "GET" && request.headers["x-requested-with"] !== "maidhire-guest") {
      throw unauthorized("Missing request header");
    }
    request.guest = claims;
  });

  app.decorate("requireCandidate", async (request: FastifyRequest) => {
    const token = request.cookies[CANDIDATE_COOKIE_NAME];
    const claims = token ? await verifyCandidateToken(token) : null;
    if (!claims) throw unauthorized();
    if (request.method !== "GET" && request.headers["x-requested-with"] !== "maidhire-candidate") {
      throw unauthorized("Missing request header");
    }
    request.candidateAuth = claims;
  });
});
