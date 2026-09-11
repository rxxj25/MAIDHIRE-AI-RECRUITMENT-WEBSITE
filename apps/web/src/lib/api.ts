import type { ApiError } from "@maidhire/shared";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

interface Options extends Omit<RequestInit, "body"> {
  body?: unknown;
  admin?: boolean;
}

export async function api<T>(path: string, { body, admin, headers, ...init }: Options = {}): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(admin ? { "X-Requested-With": "maidhire-admin" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as T | ApiError;
  if (!res.ok) {
    const e = (data as ApiError).error ?? { code: "HTTP_" + res.status, message: res.statusText };
    throw new ApiRequestError(res.status, e.code, e.message, e.fields);
  }
  return data as T;
}

export const get = <T>(path: string, admin = false) => api<T>(path, { admin });
export const post = <T>(path: string, body: unknown, admin = false) => api<T>(path, { method: "POST", body, admin });
export const patch = <T>(path: string, body: unknown, admin = true) => api<T>(path, { method: "PATCH", body, admin });
export const put = <T>(path: string, body: unknown, admin = true) => api<T>(path, { method: "PUT", body, admin });
export const del = <T>(path: string, admin = true) => api<T>(path, { method: "DELETE", admin });

export const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "" && v !== false) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};
