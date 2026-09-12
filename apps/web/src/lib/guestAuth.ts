import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGuest, postGuest } from "./api";

export interface GuestUser {
  id: string;
  email: string;
  name: string;
}

export interface GuestActivity {
  requests: { id: string; service: string; city: string; country: "AE" | "SA"; status: string; createdAt: string }[];
  messages: { id: string; message: string; status: string; createdAt: string }[];
}

export const useGuestMe = () =>
  useQuery({
    queryKey: ["guest", "me"],
    queryFn: () => getGuest<{ user: GuestUser }>("/api/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });

export function useGuestSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; confirmPassword: string }) =>
      postGuest<{ user: GuestUser }>("/api/auth/signup", body),
    onSuccess: (data) => qc.setQueryData(["guest", "me"], data),
  });
}

export function useGuestLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => postGuest<{ user: GuestUser }>("/api/auth/login", body),
    onSuccess: (data) => qc.setQueryData(["guest", "me"], data),
  });
}

export function useGuestLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postGuest("/api/auth/logout", {}),
    onSuccess: () => qc.setQueryData(["guest", "me"], null),
  });
}

export const useGuestActivity = () =>
  useQuery({ queryKey: ["guest", "activity"], queryFn: () => getGuest<GuestActivity>("/api/my-activity") });
