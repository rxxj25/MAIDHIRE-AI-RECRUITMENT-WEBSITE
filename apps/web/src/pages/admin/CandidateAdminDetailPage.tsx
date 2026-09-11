import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { CANDIDATE_STATUSES } from "@maidhire/shared";
import { useAdminCandidate, useCandidateDelete, useCandidateStatus, useCandidateUpdate } from "@/lib/admin";
import { PageTitle, Panel, StatusPill, selectCls } from "@/components/admin/ui";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Checkbox } from "@/components/ui/Form";
import { formatDate, formatDateTime, formatMoney, titleCase } from "@/lib/utils";

export default function CandidateAdminDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: c, isLoading } = useAdminCandidate(id);
  const status = useCandidateStatus();
  const update = useCandidateUpdate();
  const remove = useCandidateDelete();
  const [next, setNext] = useState<string>("");
  const [note, setNote] = useState("");

  if (isLoading || !c) return <Spinner />;

  return (
    <>
      <Link to="/admin/candidates" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All candidates
      </Link>
      <PageTitle
        title={`${c.firstName} ${c.lastName}`}
        subtitle={`${titleCase(c.primaryService)} · ${c.nationality} · ${c.currentCity}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusPill status={c.status} />
            <a href={`/candidates/${c.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-forest-900 underline-offset-4 hover:underline">
              Public profile ↗
            </a>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel>
            <h2 className="font-bold text-ink-950">Profile</h2>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                update.mutate({
                  id: c.id,
                  displayName: String(fd.get("displayName")),
                  headline: String(fd.get("headline")),
                  bio: String(fd.get("bio")),
                  rating: Number(fd.get("rating")),
                  reviewCount: Number(fd.get("reviewCount")),
                  isFeatured: fd.get("isFeatured") === "on",
                });
              }}
            >
              <Input label="Public display name" name="displayName" defaultValue={c.displayName} />
              <Input label="Headline" name="headline" defaultValue={c.headline ?? ""} />
              <Textarea label="Public bio" name="bio" defaultValue={c.bio ?? ""} wrapClassName="sm:col-span-2" className="min-h-[100px]" />
              <Input label="Rating (0–5)" name="rating" type="number" step="0.1" min={0} max={5} defaultValue={Number(c.rating)} />
              <Input label="Review count" name="reviewCount" type="number" min={0} defaultValue={c.reviewCount} />
              <Checkbox label="Featured on home page" name="isFeatured" defaultChecked={c.isFeatured} className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <Button type="submit" size="sm" loading={update.isPending}>
                  Save profile
                </Button>
                {update.isSuccess && <span className="ml-3 text-sm text-forest-700">Saved</span>}
              </div>
            </form>
          </Panel>

          <Panel>
            <h2 className="font-bold text-ink-950">Application details</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Phone", c.phone],
                ["WhatsApp", c.whatsapp ?? "—"],
                ["Email", c.email ?? "—"],
                ["Date of birth", formatDate(c.dateOfBirth)],
                ["Experience", `${c.yearsExperience} years${c.hasGulfExperience ? " · Gulf experience" : ""}`],
                ["Availability", titleCase(c.availability)],
                ["Expected salary", formatMoney(c.expectedSalary, c.salaryCurrency)],
                ["Arrangement", c.liveInPreferred ? "Live-in preferred" : "Live-out preferred"],
                ["Skills", c.skills.join(", ")],
                ["Languages", c.languages.join(", ")],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">{k}</dt>
                  <dd className="text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">{c.experienceSummary}</p>
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel>
              <h2 className="font-bold text-ink-950">Documents ({c.documents.length})</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {c.documents.map((d) => (
                  <li key={d.id}>
                    <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-forest-900 hover:underline">
                      <FileText className="h-4 w-4" aria-hidden="true" /> {d.fileName} <span className="text-ink-400">({Math.round(d.sizeBytes / 1024)} KB)</span>
                    </a>
                  </li>
                ))}
                {c.documents.length === 0 && <li className="text-ink-500">No documents uploaded.</li>}
              </ul>
              <p className="mt-3 text-xs text-ink-400">Documents are stored privately; links are served only to authenticated admins in production (S3 signed URLs).</p>
            </Panel>
            <Panel>
              <h2 className="font-bold text-ink-950">References ({c.references.length})</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {c.references.map((r) => (
                  <li key={r.id}>
                    <span className="font-semibold">{r.name}</span> · {r.relation} · {r.phone}
                  </li>
                ))}
                {c.references.length === 0 && <li className="text-ink-500">No references provided.</li>}
              </ul>
            </Panel>
          </div>
        </div>

        <div className="space-y-6">
          <Panel>
            <h2 className="font-bold text-ink-950">Move in pipeline</h2>
            <p className="mt-1 text-xs text-ink-500">Applied → Screening → Interview → Verified → Available → Hired</p>
            <select value={next} onChange={(e) => setNext(e.target.value)} className={`${selectCls} mt-4 w-full`} aria-label="New status">
              <option value="">Choose new status…</option>
              {CANDIDATE_STATUSES.filter((s) => s !== c.status).map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
            <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} className="mt-3 min-h-[80px]" placeholder="e.g. Passed skills interview, medical booked for Tuesday" />
            <Button
              size="sm"
              className="mt-3 w-full"
              disabled={!next}
              loading={status.isPending}
              onClick={() =>
                status.mutate(
                  { id: c.id, status: next, note: note || undefined },
                  {
                    onSuccess: () => {
                      setNext("");
                      setNote("");
                    },
                  },
                )
              }
            >
              Update status
            </Button>
          </Panel>

          <Panel>
            <h2 className="font-bold text-ink-950">History</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {c.statusLogs.map((l) => (
                <li key={l.id} className="border-l-2 border-forest-900/15 pl-3">
                  <p>
                    {l.fromStatus && (
                      <>
                        <StatusPill status={l.fromStatus} /> →{" "}
                      </>
                    )}
                    <StatusPill status={l.toStatus} />
                  </p>
                  {l.note && <p className="mt-1 text-ink-700">{l.note}</p>}
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatDateTime(l.createdAt)}
                    {l.changedBy ? ` · ${l.changedBy.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <h2 className="font-bold text-ink-950">Hire requests ({c.requests.length})</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.requests.map((r) => (
                <li key={r.id}>
                  <Link to={`/admin/requests?open=${r.id}`} className="text-forest-900 hover:underline">
                    {r.fullName}
                  </Link>{" "}
                  · {r.city} · <StatusPill status={r.status} />
                </li>
              ))}
              {c.requests.length === 0 && <li className="text-ink-500">None yet.</li>}
            </ul>
          </Panel>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Permanently delete ${c.firstName} ${c.lastName} and all their documents? This cannot be undone.`)) remove.mutate(c.id, { onSuccess: () => navigate("/admin/candidates") });
            }}
            className="flex items-center gap-2 text-sm font-medium text-danger-500 hover:underline"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete candidate
          </button>
        </div>
      </div>
    </>
  );
}
