#!/usr/bin/env bash
set -euo pipefail

# The Vercel Postgres/Neon integration's "DATABASE" prefix doesn't sync DATABASE_URL itself
# (a known quirk), only its DATABASE_POSTGRES_* siblings. Fall back so `prisma migrate deploy`
# (a direct DDL connection, not pooled) has something to connect with.
export DATABASE_URL="${DATABASE_URL:-${DATABASE_POSTGRES_URL_NON_POOLING:-${DATABASE_POSTGRES_URL:-}}}"

npm run build -w packages/shared
npm run build -w apps/web
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

# Idempotent (upserts by natural key) — safe to run on every deploy. Sample candidates are
# included so Browse Candidates isn't empty; their photos are written during this build step
# (STORAGE_DRIVER=local) and won't survive into the runtime function, so the frontend's
# missing-photo fallback is expected to show for them until real S3/R2 storage is configured.
# NODE_ENV is scoped to this command only — setting it project-wide makes `npm install`
# skip devDependencies (vite, typescript), breaking the web build above.
NODE_ENV=production npx tsx apps/api/prisma/seed.ts || echo "seed step failed, continuing deploy"
