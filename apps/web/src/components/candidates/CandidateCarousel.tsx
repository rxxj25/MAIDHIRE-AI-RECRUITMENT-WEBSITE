import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicCandidate } from "@maidhire/shared";
import { CandidateCard, CandidateCardSkeleton } from "./CandidateCard";
import { cn } from "@/lib/utils";

/**
 * Native scroll-snap carousel: touch-friendly, keyboard accessible, no JS scroll hijacking.
 * Arrows + dots reflect the visible page; works with any number of cards.
 */
export function CandidateCarousel({ items, loading }: { items?: PublicCandidate[]; loading?: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const p = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(p);
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [measure, items]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };
  const goTo = (i: number) => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: "smooth" });

  return (
    <div className="relative">
      <ul ref={ref} aria-label="Featured candidates" className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                <CandidateCardSkeleton />
              </li>
            ))
          : items?.map((c) => (
              <li key={c.id} className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                <CandidateCard c={c} />
              </li>
            ))}
      </ul>

      {pages > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} disabled={page === 0} aria-label="Previous candidates" className="absolute -left-2 top-[38%] hidden h-12 w-12 items-center justify-center rounded-full bg-white text-forest-950 shadow-card transition hover:scale-105 disabled:opacity-30 lg:-left-6 lg:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={page >= pages - 1} aria-label="Next candidates" className="absolute -right-2 top-[38%] hidden h-12 w-12 items-center justify-center rounded-full bg-white text-forest-950 shadow-card transition hover:scale-105 disabled:opacity-30 lg:-right-6 lg:flex">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-4 flex justify-center gap-2.5" role="tablist" aria-label="Carousel pages">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" role="tab" aria-selected={i === page} aria-label={`Go to page ${i + 1}`} onClick={() => goTo(i)} className={cn("h-3 w-3 rounded-full transition-colors", i === page ? "bg-forest-900" : "bg-ink-300 hover:bg-ink-400")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
