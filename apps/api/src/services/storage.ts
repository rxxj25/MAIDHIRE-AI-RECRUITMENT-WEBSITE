import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../lib/env.js";

/**
 * Storage adapter. Local disk for development, S3-compatible (R2/S3) for production.
 * The S3 driver uses the AWS SDK lazily so it is not a hard dependency in dev.
 */
export interface StoredFile {
  key: string;
  url: string;
}

export interface StorageDriver {
  put(buffer: Buffer, opts: { folder: string; ext: string; contentType: string; isPublic: boolean }): Promise<StoredFile>;
  remove(key: string): Promise<void>;
  publicUrl(key: string): string;
}

const localRoot = path.resolve(env.UPLOAD_DIR);

const localDriver: StorageDriver = {
  async put(buffer, { folder, ext }) {
    const key = `${folder}/${randomUUID()}.${ext}`;
    const full = path.join(localRoot, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, buffer);
    return { key, url: localDriver.publicUrl(key) };
  },
  async remove(key) {
    await unlink(path.join(localRoot, key)).catch(() => undefined);
  },
  publicUrl(key) {
    return `${env.API_PUBLIC_URL}/files/${key}`;
  },
};

async function makeS3Driver(): Promise<StorageDriver> {
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new Error("STORAGE_DRIVER=s3 requires S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY");
  }
  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
  });
  const bucket = env.S3_BUCKET;
  const publicUrl = (key: string) => `${env.S3_PUBLIC_URL ?? env.API_PUBLIC_URL + "/files"}/${key}`;
  return {
    async put(buffer, { folder, ext, contentType }) {
      const key = `${folder}/${randomUUID()}.${ext}`;
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
      return { key, url: publicUrl(key) };
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    publicUrl,
  };
}

let driverPromise: Promise<StorageDriver> | null = null;
export function storage(): Promise<StorageDriver> {
  if (!driverPromise) driverPromise = env.STORAGE_DRIVER === "s3" ? makeS3Driver() : Promise.resolve(localDriver);
  return driverPromise;
}

export { localRoot };
