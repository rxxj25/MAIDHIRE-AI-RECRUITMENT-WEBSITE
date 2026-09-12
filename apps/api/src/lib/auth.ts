import { SignJWT, jwtVerify } from "jose";
import argon2 from "argon2";
import { env } from "./env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "maidhire-api";
const AUDIENCE = "maidhire-admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
export const COOKIE_NAME = "mh_admin";

const GUEST_AUDIENCE = "maidhire-guest";
export const GUEST_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — "remember me" by default
export const GUEST_COOKIE_NAME = "mh_guest";

export interface AdminClaims {
  sub: string;
  email: string;
  name: string;
}

export type GuestClaims = AdminClaims;

export async function signAdminToken(claims: AdminClaims) {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, audience: AUDIENCE });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

export async function signGuestToken(claims: GuestClaims) {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(GUEST_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${GUEST_SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyGuestToken(token: string): Promise<GuestClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, audience: GUEST_AUDIENCE });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

export const hashPassword = (plain: string) => argon2.hash(plain, { type: argon2.argon2id });
export const verifyPassword = (hash: string, plain: string) => argon2.verify(hash, plain).catch(() => false);

/** Fixed argon2 hash used to burn CPU time on a miss, so login timing doesn't reveal whether an email is registered. */
export const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.COOKIE_SECURE,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export const guestCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.COOKIE_SECURE,
  path: "/",
  maxAge: GUEST_SESSION_TTL_SECONDS,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};
