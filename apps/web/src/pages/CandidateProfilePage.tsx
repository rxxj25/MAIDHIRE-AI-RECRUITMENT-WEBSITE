import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, CalendarCheck, Globe2, Home, Languages, MapPin, UserRound, Wallet } from "lucide-react";
import { AVAILABILITY_LABELS } from "@maidhire/shared";
import { Seo } from "@/components/ui/Seo";
import { useCandidate, usePlans } from "@/lib/queries";
import { Spinner } from "@/components/ui/Spinner";
import { VerifiedBadge, Chip } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { serviceLabel } from "@/components/candidates/CandidateCard";
import { HireRequestForm } from "@/components/forms/HireRequestForm";
import { Button } from "@/components/ui/Button";
import { formatMoney, whatsappLink } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { ApiRequestError } from "@/lib/api";
import { scrollToTarget } from "@/hooks/useLenis";

export default function CandidateProfilePage() {
  const { slug = "" } = useParams();
  const { data: c, isLoading, error } = useCandidate(slug);
  const { data: plans } = usePlans();

  if (isLoading) return <div className="pt-40"><Spinner label="Loading profile" /></div>;
  if (error || !c) {
    const notFound = error instanceof ApiRequestError && error.status === 404;
    return (
      <div className="container-x pb-24 pt-44 text-center">
        <h1 className="h-serif text-3xl text-ink-950">{notFound ? "This candidate is no longer available" : "We couldn't load this profile"}</h1>
        <p className="mt-3 text-ink-500">{notFound ? "They may have been placed with a family. Browse other verified professionals." : "Please try again in a moment."}</p>
        <Button to="/candidates" className="mt-8" arrow>
          Browse candidates
        </Button>
      </div>
    );
  }

  const facts = [
    { Icon: Briefcase, label: "Experience", value: `${c.yearsExperience}+ years` },
    { Icon: Globe2, label: "Nationality", value: c.nationality },
    { Icon: MapPin, label: "Location", value: `${c.currentCity}, ${c.currentCountry === "AE" ? "UAE" : "KSA"}` },
    { Icon: CalendarCheck, label: "Availability", value: AVAILABILITY_LABELS[c.availability as keyof typeof AVAILABILITY_LABELS] ?? c.availability },
    { Icon: Home, label: "Arrangement", value: c.liveInPreferred ? "Live-in preferred" : "Live-out preferred" },
    { Icon: Wallet, label: "Expected salary", value: `${formatMoney(c.expectedSalary, c.salaryCurrency)} / month` },
  ];

  return (
    <>
      <Seo title={`${c.displayName} — ${serviceLabel(c.primaryService)}`} description={c.headline ?? c.experienceSummary.slice(0, 150)} path={`/candidates/${c.slug}`} />
      <div className="bg-forest-950 pb-28 pt-28 lg:pt-32">
        <div className="container-x">
          <Link to="/candidates" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to candidates
          </Link>
        </div>
      </div>

      <section className="-mt-20 pb-20 lg:pb-28">
        <div className="container-x grid gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
          <Reveal className="card overflow-hidden p-3 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-200">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt={`${c.displayName}, ${serviceLabel(c.primaryService)}`} className="h-full w-full object-cover object-top" />
              ) : (
                <span className="flex h-full items-center justify-center text-ink-300">
                  <UserRound className="h-24 w-24" strokeWidth={1} aria-hidden="true" />
                </span>
              )}
              {c.isVerified && <VerifiedBadge className="absolute left-3 top-3" />}
            </div>
            <div className="px-3 pb-3 pt-5">
              <h1 className="h-serif text-[2rem] text-ink-950">{c.displayName}</h1>
              <p className="text-lg text-ink-500">{serviceLabel(c.primaryService)}</p>
              {c.reviewCount > 0 && <Stars rating={c.rating} count={c.reviewCount} className="mt-3" />}
              <div className="mt-5 flex flex-col gap-3">
                <Button onClick={() => scrollToTarget("#request")} size="lg" className="rounded-lg" arrow>
                  Request {c.displayName.split(" ")[0]}
                </Button>
                <Button href={whatsappLink(`Hello MaidHire, I'm interested in ${c.displayName} (${serviceLabel(c.primaryService)}, ${c.currentCity}).`)} target="_blank" variant="outline" size="lg" className="rounded-lg">
                  Ask on WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="space-y-10 pt-2 lg:pt-24">
            <Reveal>
              {c.headline && <p className="h-serif text-[1.6rem] text-forest-950 sm:text-[2rem]">{c.headline}</p>}
              <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200 text-forest-900">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <dt className="text-[0.8rem] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
                      <dd className="text-[1.02rem] font-medium text-ink-950">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal>
              <h2 className="text-[0.8rem] font-semibold uppercase tracking-wider text-ink-400">About</h2>
              {c.bio && <p className="mt-3 text-pretty text-lg leading-relaxed text-ink-900">{c.bio}</p>}
              <p className="mt-3 text-pretty leading-relaxed text-ink-500">{c.experienceSummary}</p>
              {c.hasGulfExperience && <Chip className="mt-4 bg-mint-100 text-forest-900">Prior Gulf experience</Chip>}
            </Reveal>

            <Reveal className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-wider text-ink-400">
                  <Briefcase className="h-4 w-4" aria-hidden="true" /> Skills
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {c.skills.map((s) => (
                    <li key={s}>
                      <Chip>{s}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-wider text-ink-400">
                  <Languages className="h-4 w-4" aria-hidden="true" /> Languages
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {c.languages.map((l) => (
                    <li key={l}>
                      <Chip>{l}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal id="request" className="card scroll-mt-28 p-6 sm:p-8">
              <h2 className="h-serif text-[1.8rem] text-ink-950">Request {c.displayName}</h2>
              <p className="mt-1 text-ink-500">Share your details and we'll arrange an interview. No account needed.</p>
              <div className="mt-6">
                <HireRequestForm plans={plans} candidate={{ id: c.id, displayName: c.displayName, primaryService: c.primaryService }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
