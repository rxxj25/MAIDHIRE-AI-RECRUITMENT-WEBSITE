import { useQuery } from "@tanstack/react-query";
import type { CandidateQuery, Paginated, PublicCandidate, PublicCandidateDetail, PublicPlan, PublicTestimonial } from "@maidhire/shared";
import { get, qs } from "./api";

export const useFeaturedCandidates = () =>
  useQuery({ queryKey: ["candidates", "featured"], queryFn: () => get<PublicCandidate[]>("/api/candidates/featured"), staleTime: 5 * 60_000 });

/** Filter values come from the URL as plain strings; the server validates them against the enums. */
export type CandidateFilterInput = { [K in keyof CandidateQuery]?: string | number };

export const useCandidates = (q: CandidateFilterInput) =>
  useQuery({
    queryKey: ["candidates", q],
    queryFn: () => get<Paginated<PublicCandidate>>(`/api/candidates${qs(q as Record<string, string | number | undefined>)}`),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });

export const useCandidate = (slug: string) =>
  useQuery({ queryKey: ["candidate", slug], queryFn: () => get<PublicCandidateDetail>(`/api/candidates/${slug}`), enabled: !!slug });

export const usePlans = () => useQuery({ queryKey: ["plans"], queryFn: () => get<PublicPlan[]>("/api/plans"), staleTime: 10 * 60_000 });

export const useTestimonials = () => useQuery({ queryKey: ["testimonials"], queryFn: () => get<PublicTestimonial[]>("/api/testimonials"), staleTime: 10 * 60_000 });
