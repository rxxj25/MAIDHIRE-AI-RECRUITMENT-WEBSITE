import { useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";

/** Shared submit-state machine: maps server field errors back onto the form, exposes a generic error. */
export function useSubmit<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError$] = useState<string | undefined>();

  async function run(fn: () => Promise<unknown>) {
    setStatus("submitting");
    setError$(undefined);
    try {
      await fn();
      setStatus("success");
    } catch (e) {
      setStatus("idle");
      if (e instanceof ApiRequestError) {
        if (e.fields) for (const [k, msg] of Object.entries(e.fields)) setError(k as Path<T>, { message: msg });
        setError$(e.fields ? "Please check the highlighted fields." : e.message);
      } else {
        setError$("We couldn't reach the server. Please check your connection and try again.");
      }
    }
  }
  return { status, error, run, submitting: status === "submitting", success: status === "success" };
}
