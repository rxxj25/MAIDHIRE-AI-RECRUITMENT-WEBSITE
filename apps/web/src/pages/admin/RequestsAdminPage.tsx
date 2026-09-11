import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { REQUEST_STATUSES } from "@maidhire/shared";
import { useAdminRequests, useRequestUpdate, type AdminRequest } from "@/lib/admin";
import { PageTitle, Pager, StatusPill, Table, selectCls, Panel } from "@/components/admin/ui";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime, titleCase, whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Form";
import { X } from "lucide-react";

function Drawer({ r, onClose }: { r: AdminRequest; onClose: () => void }) {
  const update = useRequestUpdate();
  const [notes, setNotes] = useState(r.adminNotes ?? "");
  const rows: [string, string][] = [
    ["Email", r.email],
    ["Phone", r.phone],
    ["Location", `${r.city}, ${r.country}`],
    ["Service", titleCase(r.service)],
    ["Plan", r.planSlug ? titleCase(r.planSlug) : "Not chosen"],
    ["Candidate", r.candidate?.displayName ?? "—"],
    ["Start date", r.startDate ?? "—"],
    ["Household size", r.familySize?.toString() ?? "—"],
    ["Arrangement", r.liveIn ? "Live-in" : "Live-out"],
    ["Nationalities", r.preferredNationalities.join(", ") || "—"],
    ["Languages", r.preferredLanguages.join(", ") || "—"],
    ["Received", formatDateTime(r.createdAt)],
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest-950/40" onClick={onClose}>
      <aside role="dialog" aria-label={`Request from ${r.fullName}`} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-lg overflow-y-auto bg-cream-50 p-6 shadow-lift">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="h-serif text-2xl text-ink-950">{r.fullName}</h2>
            <StatusPill status={r.status} />
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-cream-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">{k}</dt>
              <dd className="text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
        {r.notes && (
          <Panel className="mt-5 bg-cream-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Customer notes</p>
            <p className="mt-1 text-sm text-ink-900">{r.notes}</p>
          </Panel>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href={whatsappLink(`Hello ${r.fullName.split(" ")[0]}, this is MaidHire regarding your ${titleCase(r.service)} request in ${r.city}.`)} target="_blank" size="sm" variant="outline">
            WhatsApp customer
          </Button>
          <Button href={`mailto:${r.email}`} size="sm" variant="outline">
            Email
          </Button>
          <Button href={`tel:${r.phone}`} size="sm" variant="outline">
            Call
          </Button>
        </div>
        <div className="mt-6">
          <label className="text-sm font-semibold text-ink-700">Status</label>
          <select value={r.status} onChange={(e) => update.mutate({ id: r.id, status: e.target.value })} className={`${selectCls} mt-1.5 w-full`}>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </div>
        <Textarea label="Internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-4 min-h-[120px]" wrapClassName="mt-4" />
        <Button size="sm" className="mt-3" loading={update.isPending} onClick={() => update.mutate({ id: r.id, adminNotes: notes })}>
          Save notes
        </Button>
      </aside>
    </div>
  );
}

export default function RequestsAdminPage() {
  const [sp, setSp] = useSearchParams();
  const q = { status: sp.get("status") ?? undefined, page: Number(sp.get("page") ?? 1), pageSize: 20 };
  const { data, isLoading } = useAdminRequests(q);
  const openId = sp.get("open");
  const open = data?.items.find((r) => r.id === openId);
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n, { replace: true });
  };
  return (
    <>
      <PageTitle
        title="Hire Requests"
        subtitle={data ? `${data.total} total` : undefined}
        actions={
          <select value={q.status ?? ""} onChange={(e) => set("status", e.target.value)} className={selectCls} aria-label="Filter by status">
            <option value="">All statuses</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        }
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table head={["Customer", "Location", "Service", "Plan", "Candidate", "Status", "Received"]}>
            {data?.items.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-cream-100/60" onClick={() => set("open", r.id)}>
                <td className="px-4 py-3">
                  <span className="block font-semibold text-forest-900">{r.fullName}</span>
                  <span className="text-xs text-ink-500">{r.phone}</span>
                </td>
                <td className="px-4 py-3">{r.city}</td>
                <td className="px-4 py-3">{titleCase(r.service)}</td>
                <td className="px-4 py-3">{r.planSlug ? titleCase(r.planSlug) : "—"}</td>
                <td className="px-4 py-3">{r.candidate?.displayName ?? "—"}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-ink-500">{formatDateTime(r.createdAt)}</td>
              </tr>
            ))}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-500">
                  No requests yet.
                </td>
              </tr>
            )}
          </Table>
          {data && <Pager page={data.page} totalPages={data.totalPages} onChange={(p) => set("page", String(p))} />}
        </>
      )}
      {open && <Drawer r={open} onClose={() => set("open", "")} />}
    </>
  );
}
