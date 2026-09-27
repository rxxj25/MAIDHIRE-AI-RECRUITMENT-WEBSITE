import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidate, postCandidate } from "./api";

export interface CandidateUser {
  id: string;
  email: string;
  name: string;
}

export interface CandidateProfile {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: string;
  primaryService: string;
  currentCity: string;
  currentCountry: "AE" | "SA";
  photoUrl: string | null;
  yearsExperience: number;
  createdAt: string;
  statusLogs: { id: string; fromStatus: string | null; toStatus: string; note: string | null; createdAt: string }[];
}

export const useCandidateMe = () =>
  useQuery({
    queryKey: ["candidate", "me"],
    queryFn: () => getCandidate<{ user: CandidateUser }>("/api/candidate/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });

export const useCandidateProfile = () =>
  useQuery({
    queryKey: ["candidate", "profile"],
    queryFn: () => getCandidate<CandidateProfile>("/api/candidate/me"),
  });

export function useCandidateLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => postCandidate<{ user: CandidateUser }>("/api/candidate/auth/login", body),
    onSuccess: (data) => qc.setQueryData(["candidate", "me"], data),
  });
}

export function useCandidateLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postCandidate("/api/candidate/auth/logout", {}),
    onSuccess: () => qc.setQueryData(["candidate", "me"], null),
  });
}
