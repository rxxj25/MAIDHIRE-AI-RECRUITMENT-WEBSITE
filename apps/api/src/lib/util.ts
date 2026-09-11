import { createHash, randomBytes } from "node:crypto";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Unique, non-enumerable public slug: "priya-s-7f3a2c". */
export const candidateSlug = (first: string, last: string) =>
  `${slugify(`${first} ${last.charAt(0)}`)}-${randomBytes(3).toString("hex")}`;

export const displayName = (first: string, last: string) => `${first.trim()} ${last.trim().charAt(0).toUpperCase()}.`;

/** Privacy-preserving IP fingerprint for abuse analysis (never stores raw IPs). */
export const hashIp = (ip: string | undefined) => (ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null);

export const paginate = (page: number, pageSize: number) => ({ skip: (page - 1) * pageSize, take: pageSize });
