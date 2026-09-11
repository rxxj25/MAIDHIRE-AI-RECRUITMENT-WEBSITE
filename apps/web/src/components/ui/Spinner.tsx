import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-ink-400">
      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-cream-200 ${className}`} />;
}
