# MaidHire

Premium domestic-staff recruitment platform for families in the UAE and Saudi Arabia.
Monorepo: React/Vite frontend, Fastify API, PostgreSQL via Prisma, shared Zod schemas.

```
apps/web        React 18 · Vite · TypeScript · Tailwind v4 · Framer Motion · TanStack Query · React Hook Form
apps/api        Fastify 5 · TypeScript · Prisma · PostgreSQL · argon2 · jose (JWT) · sharp · Resend
packages/shared Zod schemas, enums and API types used by BOTH client and server
```

## Quick start

Prerequisites: Node 22+, PostgreSQL 15+.

```bash
npm install
cp apps/api/.env.example apps/api/.env     # edit DATABASE_URL + JWT_SECRET (openssl rand -base64 48)
cp apps/web/.env.example apps/web/.env     # optional in dev (Vite proxies /api → :4000)
createdb maidhire
npm run db:migrate                          # prisma migrate dev
npm run db:seed                             # admin user, plans, testimonials, sample candidates
npm run dev                                 # web on :5173, api on :4000
```

Admin: `http://localhost:5173/admin/login` — credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `apps/api/.env` at seed time. **Change them before going live.**

## What's included

**Public site** — Home, About, Services, How It Works, Browse Candidates (filters, pagination, sort), Candidate Profile, Pricing (AED/SAR toggle), Contact (message + hire request), Join as a Candidate (multipart application with photo/documents), Privacy, Terms, 404.

**Backend** — `POST /api/contact`, `POST /api/hire-requests` (customer details stored, no account), `POST /api/candidates/apply` (multipart; photos re-encoded to WebP via sharp, documents stored privately), `GET /api/candidates` (+ `/featured`, `/:slug`), `GET /api/plans`, `GET /api/testimonials`.

**Admin** (`/admin`, cookie-JWT, argon2 passwords, CSRF header check) — overview stats, candidate list/detail with pipeline `APPLIED → SCREENING → INTERVIEW → VERIFIED → AVAILABLE → HIRED` and audit log, hire requests with status/notes drawer, contact messages, plan editor.

**Security** — Zod validation on both sides, helmet, CORS allow-list, global + per-route rate limiting, honeypot fields, hashed IPs (never raw), strict file type/size checks, private document storage, non-enumerable candidate slugs, secrets only in env.

## Environment

See `apps/api/.env.example` (all keys documented) and `apps/web/.env.example`.

| Key | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | ≥32 chars; signs admin sessions |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `API_PUBLIC_URL` | Public URL of the API (used for local file URLs) |
| `STORAGE_DRIVER` | `local` (dev) or `s3` (Cloudflare R2 / AWS S3) + `S3_*` keys |
| `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL` | Enquiry notifications; empty key = log to console |
| `VITE_API_URL` | (web) API base URL in production, e.g. `https://api.maidhire.com` |
| `VITE_WHATSAPP_NUMBER` | (web) WhatsApp click-to-chat number, digits only |

## Deployment

- **Web** → Vercel/Netlify/Cloudflare Pages: build `npm run build -w apps/web`, output `apps/web/dist`. `apps/web/vercel.json` handles SPA rewrites + cache headers. Set `VITE_API_URL`.
- **API** → Railway/Render/Fly (Docker): `apps/api/Dockerfile` builds from the repo root and runs `prisma migrate deploy` on boot. Set `COOKIE_SECURE=true`, `CORS_ORIGINS=https://maidhire.com`, `STORAGE_DRIVER=s3`.
- **Database** → Neon / Supabase Postgres / RDS.
- **Files** → Cloudflare R2 (S3-compatible). For private documents, front the bucket with signed URLs (the storage adapter is the single place to change).

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run db:migrate` · `npm run db:seed` · `npm run db:studio -w apps/api`

## Replacing imagery

All marketing images live in `apps/web/public/images` (hero, section headers, `services/*.webp`). Seed candidate photos live in `apps/api/prisma/seed-assets`. Swap the files, keep the names.

## Roadmap hooks (architected, not built)

Employer accounts & favourites · online payments (Razorpay/Stripe/Tap) · WhatsApp Business API notifications · Arabic/RTL locale (design tokens use logical props; `dir` attribute is on `<html>`) · blog CMS · signed-URL document viewer.
