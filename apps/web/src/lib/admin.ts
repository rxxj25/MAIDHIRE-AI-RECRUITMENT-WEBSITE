import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminStats } from "@maidhire/shared";
import { del, get, patch, post, put, qs } from "./api";

export interface AdminUser { id: string; email: string; name: string }

export const useAdminMe = () =>
  useQuery({ queryKey: ["admin", "me"], queryFn: () => get<{ user: AdminUser }>("/api/admin/auth/me", true), retry: false, staleTime: 5 * 60_000 });

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => post<{ user: AdminUser }>("/api/admin/auth/login", body, true),
    onSuccess: (data) => qc.setQueryData(["admin", "me"], data),
  });
}
export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => post("/api/admin/auth/logout", {}, true), onSuccess: () => qc.clear() });
}

export const useAdminStats = () => useQuery({ queryKey: ["admin", "stats"], queryFn: () => get<AdminStats>("/api/admin/stats", true) });

export type AdminList<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };

export const useAdminCandidates = (q: Record<string, string | number | undefined>) =>
  useQuery({ queryKey: ["admin", "candidates", q], queryFn: () => get<AdminList<AdminCandidate>>(`/api/admin/candidates${qs(q)}`, true), placeholderData: (p) => p });
export const useAdminCandidate = (id: string) => useQuery({ queryKey: ["admin", "candidate", id], queryFn: () => get<AdminCandidateDetail>(`/api/admin/candidates/${id}`, true) });
export const useAdminRequests = (q: Record<string, string | number | undefined>) =>
  useQuery({ queryKey: ["admin", "requests", q], queryFn: () => get<AdminList<AdminRequest>>(`/api/admin/requests${qs(q)}`, true), placeholderData: (p) => p });
export const useAdminMessages = (q: Record<string, string | number | undefined>) =>
  useQuery({ queryKey: ["admin", "messages", q], queryFn: () => get<AdminList<AdminMessage>>(`/api/admin/messages${qs(q)}`, true), placeholderData: (p) => p });
export const useAdminPlans = () => useQuery({ queryKey: ["admin", "plans"], queryFn: () => get<AdminPlan[]>("/api/admin/plans", true) });

export function useInvalidating<TArgs, TRes>(fn: (a: TArgs) => Promise<TRes>, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })) });
}
export const useCandidateStatus = () => useInvalidating(({ id, status, note }: { id: string; status: string; note?: string }) => post(`/api/admin/candidates/${id}/status`, { status, note }, true), [["admin"]]);
export const useCandidateUpdate = () => useInvalidating(({ id, ...data }: { id: string } & Record<string, unknown>) => patch(`/api/admin/candidates/${id}`, data), [["admin"], ["candidates"], ["candidate"]]);
export const useCandidateDelete = () => useInvalidating((id: string) => del(`/api/admin/candidates/${id}`), [["admin"], ["candidates"]]);
export const useRequestUpdate = () => useInvalidating(({ id, ...data }: { id: string; status?: string; adminNotes?: string }) => patch(`/api/admin/requests/${id}`, data), [["admin"]]);
export const useMessageUpdate = () => useInvalidating(({ id, status }: { id: string; status: string }) => patch(`/api/admin/messages/${id}`, { status }), [["admin"]]);
export const usePlanUpsert = () => useInvalidating((data: Record<string, unknown>) => put("/api/admin/plans", data), [["admin", "plans"], ["plans"]]);

/* ---- admin row types (mirror Prisma models) ---- */
export interface AdminCandidate {
  id: string; slug: string; firstName: string; lastName: string; displayName: string; headline: string | null; phone: string; whatsapp: string | null; email: string | null;
  nationality: string; currentCountry: "AE" | "SA"; currentCity: string; primaryService: string; yearsExperience: number; status: string; isFeatured: boolean;
  rating: string | number; reviewCount: number; photoUrl: string | null; createdAt: string; expectedSalary: number; salaryCurrency: "AED" | "SAR";
  skills: string[]; languages: string[]; availability: string; bio: string | null; experienceSummary: string; hasGulfExperience: boolean; liveInPreferred: boolean; dateOfBirth: string;
  _count?: { documents: number };
}
export interface AdminCandidateDetail extends AdminCandidate {
  documents: { id: string; type: string; fileName: string; mimeType: string; sizeBytes: number; uploadedAt: string; url: string }[];
  references: { id: string; name: string; relation: string; phone: string; verified: boolean }[];
  statusLogs: { id: string; fromStatus: string | null; toStatus: string; note: string | null; createdAt: string; changedBy: { name: string } | null }[];
  requests: AdminRequest[];
}
export interface AdminRequest {
  id: string; fullName: string; email: string; phone: string; country: "AE" | "SA"; city: string; service: string; planSlug: string | null; candidateId: string | null;
  candidate?: { displayName: string; slug: string } | null; startDate: string | null; familySize: number | null; preferredNationalities: string[]; preferredLanguages: string[];
  liveIn: boolean; notes: string | null; status: string; adminNotes: string | null; createdAt: string;
}
export interface AdminMessage { id: string; name: string; email: string; phone: string; service: string | null; message: string; status: string; createdAt: string }
export interface AdminPlan { id: string; slug: string; name: string; tagline: string; priceAed: number; priceSar: number; features: string[]; footnote: string | null; isPopular: boolean; sortOrder: number; isActive: boolean }
