import { Link, useSearchParams } from "react-router-dom";
import { CANDIDATE_STATUSES } from "@maidhire/shared";
import { useAdminCandidates } from "@/lib/admin";
import { PageTitle, Pager, StatusPill, Table, selectCls } from "@/components/admin/ui";
import { formatDate, titleCase } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export default function CandidatesAdminPage() {
  const [sp, setSp] = useSearchParams();
  const q = { status: sp.get("status") ?? undefined, q: sp.get("q") ?? undefined, page: Number(sp.get("page") ?? 1), pageSize: 20 };
  const { data, isLoading } = useAdminCandidates(q);
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    if (k !== "page") n.delete("page");
    setSp(n, { replace: true });
  };
  return (
    <>
      <PageTitle
        title="Candidates"
        subtitle={data ? `${data.total} total` : undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <input type="search" placeholder="Search name or phone" defaultValue={q.q} onKeyDown={(e) => e.key === "Enter" && set("q", (e.target as HTMLInputElement).value)} className="field h-10 w-56 py-0 text-sm" aria-label="Search candidates" />
            <select value={q.status ?? ""} onChange={(e) => set("status", e.target.value)} className={selectCls} aria-label="Filter by status">
              <option value="">All statuses</option>
              {CANDIDATE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>
        }
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table head={["Candidate", "Role", "Location", "Exp.", "Status", "Docs", "Applied"]}>
            {data?.items.map((c) => (
              <tr key={c.id} className="hover:bg-cream-100/60">
                <td className="px-4 py-3">
                  <Link to={`/admin/candidates/${c.id}`} className="flex items-center gap-3">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-cream-200">{c.photoUrl && <img src={c.photoUrl} alt="" className="h-full w-full object-cover object-top" />}</span>
                    <span>
                      <span className="block font-semibold text-forest-900 hover:underline">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="text-xs text-ink-500">
                        {c.nationality} · {c.phone}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">{titleCase(c.primaryService)}</td>
                <td className="px-4 py-3">{c.currentCity}</td>
                <td className="px-4 py-3">{c.yearsExperience} yrs</td>
                <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                <td className="px-4 py-3">{c._count?.documents ?? 0}</td>
                <td className="px-4 py-3 text-ink-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-500">
                  No candidates match.
                </td>
              </tr>
            )}
          </Table>
          {data && <Pager page={data.page} totalPages={data.totalPages} onChange={(p) => set("page", String(p))} />}
        </>
      )}
    </>
  );
}
