import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const STATUS_TONE: Record<string, string> = {
  APPLIED: "bg-cream-200 text-ink-700",
  SCREENING: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-sky-100 text-sky-800",
  VERIFIED: "bg-mint-200 text-forest-900",
  AVAILABLE: "bg-mint-300 text-forest-950",
  HIRED: "bg-forest-900 text-white",
  INACTIVE: "bg-ink-300/40 text-ink-700",
  NEW: "bg-mint-300 text-forest-950",
  CONTACTED: "bg-sky-100 text-sky-800",
  MATCHING: "bg-amber-100 text-amber-800",
  INTERVIEWING: "bg-violet-100 text-violet-800",
  PLACED: "bg-forest-900 text-white",
  CLOSED: "bg-ink-300/40 text-ink-700",
  UNREAD: "bg-mint-300 text-forest-950",
  READ: "bg-cream-200 text-ink-700",
  REPLIED: "bg-sky-100 text-sky-800",
  ARCHIVED: "bg-ink-300/40 text-ink-700",
};

export const StatusPill = ({ status }: { status: string }) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-wider", STATUS_TONE[status] ?? "bg-cream-200 text-ink-700")}>{status.toLowerCase()}</span>
);

export const PageTitle = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="h-serif text-[2rem] text-ink-950">{title}</h1>
      {subtitle && <p className="text-ink-500">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("rounded-2xl bg-white p-5 shadow-soft ring-1 ring-forest-900/8", className)}>{children}</div>;

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-forest-900/8">
      <table className="w-full min-w-[720px] text-left text-[0.9rem]">
        <thead className="bg-cream-100 text-[0.72rem] font-bold uppercase tracking-wider text-ink-500">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-forest-900/6">{children}</tbody>
      </table>
    </div>
  );
}

export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-full bg-white px-4 py-1.5 shadow-soft disabled:opacity-40">
        Previous
      </button>
      <span className="text-ink-500">
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded-full bg-white px-4 py-1.5 shadow-soft disabled:opacity-40">
        Next
      </button>
    </div>
  );
}

export const selectCls = "field h-10 w-auto py-0 pr-9 text-sm";
