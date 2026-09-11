import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  COOKIE_DOMAIN: z.string().optional(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().default("./uploads"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("MaidHire <no-reply@maidhire.com>"),
  NOTIFY_EMAIL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast with a readable message; never boot with a broken config.
  console.error("❌ Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};
