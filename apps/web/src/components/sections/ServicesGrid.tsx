import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SERVICES } from "@/lib/content";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

/** Six service cards — image on top, icon + title + short line + arrow, exactly as the mockup grid. */
export function ServicesGrid({ limit }: { limit?: number }) {
  const reduce = useReducedMotion();
  const items = limit ? SERVICES.slice(0, limit) : SERVICES;
  return (
    <Reveal as="ul" staggerChildren={0.09} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <RevealItem as="li" key={s.slug} className="h-full">
          <motion.div whileHover={reduce ? undefined : { y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="group card flex h-full flex-col overflow-hidden p-2.5">
            <Link to={`/services#${s.slug}`} className="flex h-full flex-col rounded-xl focus-visible:ring-4 focus-visible:ring-mint-300/60" aria-label={`${s.label} — learn more`}>
              <div className="relative aspect-[16/9.4] overflow-hidden rounded-xl">
                <img src={s.image} alt={s.label} loading="lazy" decoding="async" width={800} height={470} className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.05]" />
              </div>
              <div className="flex flex-1 items-center gap-4 px-3 pb-4 pt-5">
                <s.Icon aria-hidden="true" className="h-9 w-9 shrink-0 text-forest-800" strokeWidth={1.5} />
                <div className="flex-1">
                  <h3 className="text-[1.1rem] font-bold text-ink-950">{s.label}</h3>
                  <p className="mt-0.5 text-[0.9rem] leading-snug text-ink-500">{s.short}</p>
                </div>
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-forest-900 transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </RevealItem>
      ))}
    </Reveal>
  );
}
