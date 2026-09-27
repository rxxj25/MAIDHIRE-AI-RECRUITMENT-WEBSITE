import { Navigate } from "react-router-dom";
import { CANDIDATE_STATUSES, SERVICE_TYPES } from "@maidhire/shared";
import { Check } from "lucide-react";
import { Seo } from "@/components/ui/Seo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCandidateMe, useCandidateProfile } from "@/lib/candidateAuth";
import { cn } from "@/lib/utils";

const PIPELINE = CANDIDATE_STATUSES.filter((s) => s !== "INACTIVE");

export default function CandidateStatusPage() {
  const { data: me, isLoading: meLoading } = useCandidateMe();
  const { data: profile, isLoading: profileLoading } = useCandidateProfile();

  if (!meLoading && !me) return <Navigate to="/login?as=candidate" replace />;
  if (meLoading || profileLoading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <Spinner />
      </div>
    );
  }

  const stepIndex = PIPELINE.indexOf(profile.status as (typeof PIPELINE)[number]);
  const isPublic = profile.status === "VERIFIED" || profile.status === "AVAILABLE";
  const service = SERVICE_TYPES.find((s) => s.slug === profile.primaryService)?.label ?? profile.primaryService;

  return (
    <div className="container-x max-w-3xl py-24">
      <Seo title="My Application" noIndex />
      <p className="eyebrow text-forest-700">My Application</p>
      <h1 className="h-serif mt-3 text-[2.4rem] text-ink-950">Welcome back, {profile.displayName}</h1>
      <p className="mt-2 text-ink-500">
        {service} · {profile.currentCity}, {profile.currentCountry}
      </p>

      <div className="card mt-8 flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
        {profile.photoUrl && <img src={profile.photoUrl} alt={profile.displayName} className="h-28 w-28 shrink-0 rounded-2xl object-cover" />}
        <div className="flex-1">
          <p className="text-[0.85rem] font-semibold uppercase tracking-wide text-ink-400">Current status</p>
          <p className="h-serif mt-1 text-[1.6rem] text-forest-900">{profile.status}</p>
          {isPublic ? (
            <p className="mt-2 text-[0.95rem] text-mint-600">
              You&apos;re verified and live on the public site.{" "}
              <a href={`/candidates/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                View your public profile
              </a>
            </p>
          ) : (
            <p className="mt-2 text-[0.95rem] text-ink-500">Our team is still reviewing your application — you&apos;re not visible on the public site yet.</p>
          )}
        </div>
      </div>

      <div className="card mt-6 p-7">
        <p className="mb-6 text-[0.85rem] font-semibold uppercase tracking-wide text-ink-400">Pipeline</p>
        <ol className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((step, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8rem] font-bold",
                    done && "bg-mint-100 text-forest-900",
                    current && "bg-forest-900 text-white",
                    !done && !current && "bg-cream-200 text-ink-400",
                  )}
                >
                  {done && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
                  {step}
                </span>
                {i < PIPELINE.length - 1 && <span className="h-px w-4 bg-forest-900/15" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card mt-6 p-7">
        <p className="mb-4 text-[0.85rem] font-semibold uppercase tracking-wide text-ink-400">History</p>
        <ul className="space-y-3">
          {profile.statusLogs.map((log) => (
            <li key={log.id} className="flex items-center justify-between border-b border-forest-900/8 pb-3 text-[0.92rem] last:border-0 last:pb-0">
              <span className="font-semibold text-ink-900">
                {log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : log.toStatus}
                {log.note && <span className="ml-2 font-normal text-ink-500">— {log.note}</span>}
              </span>
              <time className="shrink-0 text-ink-400">{new Date(log.createdAt).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button to="/candidates" variant="outline">
          Browse other candidates
        </Button>
      </div>
    </div>
  );
}
