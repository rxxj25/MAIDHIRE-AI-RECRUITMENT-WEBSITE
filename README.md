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

All marketing images live in `apps/web/public/images` (hero poster, section headers, `services/*.webp`); the ambient hero loop lives in `apps/web/public/video` (`hero.webm` + `hero.mp4`, muted, ~9 s, ≤1.3 MB — re-encode replacements with `ffmpeg -an -movflags +faststart`). Seed candidate photos live in `apps/api/prisma/seed-assets`. Swap the files, keep the names.

## AI phone receptionist (Twilio → Langflow → Groq)

When someone dials your MaidHire number, Twilio answers, transcribes their speech, and posts it to the API. The API calls a Langflow flow ("MaidHire Voice Receptionist": Chat Input → Memory → Prompt → Groq → Chat Output), which replies grounded in a condensed summary of the site content, and Twilio speaks the reply back — a live, spoken back-and-forth, separate from the text chat widget (which still runs on Gemini, untouched).

**Requires Langflow running** (the desktop app, or a hosted instance) — the API calls out to it on every turn, so calls will fail if it's not running.

1. In Langflow, open the **"MaidHire Voice Receptionist"** flow. Get an API key: Settings → Langflow API Keys → Add New.
2. Set in `apps/api/.env`: `LANGFLOW_API_URL` (default `http://localhost:7860`), `LANGFLOW_API_KEY`, and `LANGFLOW_FLOW_ID` (the flow's id, from its URL in the app or `GET /api/v1/flows/`).
3. Create a [Twilio](https://www.twilio.com) account and buy a phone number with Voice capability (or use the free trial number).
4. In the Twilio Console → your number → **Voice Configuration**, set "A call comes in" to **Webhook**, `POST`, pointing at `https://<your-public-api-url>/api/voice/incoming`. Set the call status callback (optional) to `.../api/voice/status`.
5. Set `TWILIO_AUTH_TOKEN` in `apps/api/.env` (Console → Account → API keys & tokens) — this verifies webhooks really came from Twilio. Required before going live; safe to leave empty only for local testing.
6. For local dev, tunnel the API (e.g. `ngrok http 4000`) and point the Twilio webhook at the tunnel URL — also update `API_PUBLIC_URL` in `.env` to match, since it's used to verify the Twilio signature.
7. Set `VITE_VOICE_NUMBER` in `apps/web/.env` (digits only, e.g. `971501234567`) to show a click-to-call button on the site (bottom-right, above the WhatsApp and chat buttons). Hidden automatically until this is set.

Routes live in `apps/api/src/routes/voice.ts`; the request to Langflow (condensed knowledge, since this account's Groq tier caps at 8000 tokens/minute) is in `apps/api/src/services/voice.ts`. Conversation history is kept by Langflow itself (its Memory component, keyed by Twilio's CallSid as the session id) — the API doesn't track it.

**Don't edit the flow in Langflow's canvas** — opening it has previously auto-saved a broken cleanup of the node connections. If you need to change the flow, ask before touching the canvas, or edit it via Langflow's API.

## Roadmap hooks (architected, not built)

Employer accounts & favourites · online payments (Razorpay/Stripe/Tap) · WhatsApp Business API notifications · Arabic/RTL locale (design tokens use logical props; `dir` attribute is on `<html>`) · blog CMS · signed-URL document viewer.
