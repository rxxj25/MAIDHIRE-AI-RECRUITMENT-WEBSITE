import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new HttpError(404, "NOT_FOUND", `${what} not found`);
export const unauthorized = (msg = "Authentication required") => new HttpError(401, "UNAUTHORIZED", msg);
export const forbidden = (msg = "Forbidden") => new HttpError(403, "FORBIDDEN", msg);
export const badRequest = (msg: string, fields?: Record<string, string>) =>
  new HttpError(400, "BAD_REQUEST", msg, fields);

/** Convert a ZodError into a field → message map for form UIs. */
export function zodFields(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function errorHandler(error: FastifyError | HttpError | ZodError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: { code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", fields: zodFields(error) },
    });
  }
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) },
    });
  }
  const fe = error as FastifyError;
  if (fe.statusCode === 429) {
    return reply.status(429).send({ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } });
  }
  if (fe.statusCode && fe.statusCode < 500) {
    return reply.status(fe.statusCode).send({ error: { code: fe.code ?? "BAD_REQUEST", message: fe.message } });
  }
  request.log.error({ err: error }, "Unhandled error");
  return reply.status(500).send({ error: { code: "INTERNAL", message: "Something went wrong. Please try again." } });
}
