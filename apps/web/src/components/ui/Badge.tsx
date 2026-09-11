import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-mint-300 px-3 py-1 text-[0.78rem] font-semibold text-forest-950", className)}>
      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-cream-200 px-3 py-1 text-[0.78rem] font-medium text-ink-700", className)}>{children}</span>;
}
