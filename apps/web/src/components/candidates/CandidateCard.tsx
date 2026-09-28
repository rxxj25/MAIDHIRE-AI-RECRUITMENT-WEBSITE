import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, MapPin, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { PublicCandidate } from "@maidhire/shared";
import { SERVICE_TYPES } from "@maidhire/shared";
import { VerifiedBadge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { cn } from "@/lib/utils";

export const serviceLabel = (slug: string) => SERVICE_TYPES.find((s) => s.slug === slug)?.label ?? slug;

export function CandidateCard({ c, className }: { c: PublicCandidate; className?: string }) {
  const reduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  return (
    <motion.article whileHover={reduce ? undefined : { y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className={cn("group card flex h-full flex-col overflow-hidden p-2.5", className)}>
      <Link to={`/candidates/${c.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-cream-200" aria-label={`View ${c.displayName}'s profile`}>
        {c.photoUrl && !imgError ? (
          <img src={c.photoUrl} alt={`${c.displayName}, ${serviceLabel(c.primaryService)}`} loading="lazy" decoding="async" width={400} height={300} onError={() => setImgError(true)} className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.05]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-ink-300">
            <UserRound className="h-16 w-16" strokeWidth={1.2} aria-hidden="true" />
          </span>
        )}
        {c.isVerified && <VerifiedBadge className="absolute bottom-3 left-3" />}
      </Link>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <h3 className="text-[1.15rem] font-bold text-ink-950">{c.displayName}</h3>
        <p className="text-[0.98rem] text-ink-500">{serviceLabel(c.primaryService)}</p>
        <ul className="mt-3 space-y-1.5 text-[0.9rem] text-ink-700">
          <li className="flex items-center gap-2">
            <Briefcase aria-hidden="true" className="h-4 w-4 text-forest-800" />
            {c.yearsExperience}+ years · {c.nationality}
          </li>
          <li className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4 text-forest-800" />
            {c.currentCity}
          </li>
        </ul>
        {c.reviewCount > 0 && <Stars rating={c.rating} count={c.reviewCount} className="mt-3" />}
        <Link to={`/candidates/${c.slug}`} className="group/btn mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-forest-900 font-semibold text-white transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint-300/60">
          View Profile
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="card p-2.5" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse rounded-xl bg-cream-200" />
      <div className="space-y-3 px-3 pb-3 pt-4">
        <div className="h-5 w-1/2 animate-pulse rounded bg-cream-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-cream-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
        <div className="h-12 animate-pulse rounded-lg bg-cream-200" />
      </div>
    </div>
  );
}
