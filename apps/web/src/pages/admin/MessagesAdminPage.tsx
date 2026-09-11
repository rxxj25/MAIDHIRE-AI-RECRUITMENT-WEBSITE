import { useSearchParams } from "react-router-dom";
import { MESSAGE_STATUSES } from "@maidhire/shared";
import { useAdminMessages, useMessageUpdate } from "@/lib/admin";
import { PageTitle, Pager, StatusPill, selectCls } from "@/components/admin/ui";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime, titleCase, cn } from "@/lib/utils";

export default function MessagesAdminPage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") ?? 1);
  const { data, isLoading } = useAdminMessages({ page, pageSize: 20 });
  const update = useMessageUpdate();
  return (
    <>
      <PageTitle title="Messages" subtitle={data ? `${data.total} total` : undefined} />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ul className="space-y-3">
            {data?.items.map((m) => (
              <li key={m.id} className={cn("rounded-2xl bg-white p-5 shadow-soft ring-1 ring-forest-900/8", m.status === "UNREAD" && "ring-mint-400")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-950">
                      {m.name} <StatusPill status={m.status} />
                    </p>
                    <p className="text-sm text-ink-500">
                      <a href={`mailto:${m.email}`} className="hover:underline">
                        {m.email}
                      </a>{" "}
                      ·{" "}
                      <a href={`tel:${m.phone}`} className="hover:underline">
                        {m.phone}
                      </a>
                      {m.service && ` · ${titleCase(m.service)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-400">{formatDateTime(m.createdAt)}</span>
                    <select value={m.status} onChange={(e) => update.mutate({ id: m.id, status: e.target.value })} className={selectCls} aria-label="Message status">
                      {MESSAGE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {titleCase(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-[0.95rem] text-ink-900">{m.message}</p>
              </li>
            ))}
            {data?.items.length === 0 && <li className="rounded-2xl bg-white p-10 text-center text-ink-500">No messages yet.</li>}
          </ul>
          {data && <Pager page={data.page} totalPages={data.totalPages} onChange={(p) => setSp({ page: String(p) }, { replace: true })} />}
        </>
      )}
    </>
  );
}
