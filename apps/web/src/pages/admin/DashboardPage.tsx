import { Link } from "react-router-dom";
import { CANDIDATE_STATUSES } from "@maidhire/shared";
import { useAdminStats, useAdminRequests } from "@/lib/admin";
import { PageTitle, Panel, StatusPill, Table } from "@/components/admin/ui";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime, titleCase } from "@/lib/utils";

export default function DashboardPage() {
  const { data: s, isLoading } = useAdminStats();
  const { data: recent } = useAdminRequests({ pageSize: 6 });
  if (isLoading || !s) return <Spinner />;
  const tiles = [
    { label: "New hire requests", value: s.requests.new, to: "/admin/requests?status=NEW" },
    { label: "Requests · last 30 days", value: s.requests.last30Days, to: "/admin/requests" },
    { label: "Unread messages", value: s.messages.unread, to: "/admin/messages" },
    { label: "Total candidates", value: s.candidates.total, to: "/admin/candidates" },
  ];
  return (
    <>
      <PageTitle title="Overview" subtitle="What needs attention today" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-forest-900/8 transition hover:shadow-card">
            <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-ink-500">{t.label}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-forest-950">{t.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel>
          <h2 className="font-bold text-ink-950">Candidate pipeline</h2>
          <ul className="mt-4 space-y-2.5">
            {CANDIDATE_STATUSES.map((st) => {
              const n = s.candidates.byStatus[st] ?? 0;
              const pct = s.candidates.total ? Math.round((n / s.candidates.total) * 100) : 0;
              return (
                <li key={st}>
                  <Link to={`/admin/candidates?status=${st}`} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0"><StatusPill status={st} /></span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                      <span className="block h-full rounded-full bg-forest-900" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 text-right font-semibold">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
        <div>
          <h2 className="mb-3 font-bold text-ink-950">Latest hire requests</h2>
          <Table head={["Customer", "Location", "Service", "Status", "Received"]}>
            {recent?.items.map((r) => (
              <tr key={r.id} className="hover:bg-cream-100/60">
                <td className="px-4 py-3">
                  <Link to={`/admin/requests?open=${r.id}`} className="font-semibold text-forest-900 hover:underline">
                    {r.fullName}
                  </Link>
                  <p className="text-xs text-ink-500">{r.phone}</p>
                </td>
                <td className="px-4 py-3">{r.city}</td>
                <td className="px-4 py-3">{titleCase(r.service)}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-ink-500">{formatDateTime(r.createdAt)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </>
  );
}
