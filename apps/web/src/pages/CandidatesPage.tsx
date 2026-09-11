import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandidateFilters, type Filters } from "@/components/candidates/CandidateFilters";
import { CandidateCard, CandidateCardSkeleton } from "@/components/candidates/CandidateCard";
import { useCandidates } from "@/lib/queries";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function CandidatesPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo<Filters & { page: number; sort: string }>(
    () => ({
      service: params.get("service") ?? undefined,
      city: params.get("city") ?? undefined,
      nationality: params.get("nationality") ?? undefined,
      experience: params.get("experience") ?? undefined,
      availability: params.get("availability") ?? undefined,
      page: Number(params.get("page") ?? 1),
      sort: params.get("sort") ?? "featured",
    }),
    [params],
  );
  const { data, isLoading, isFetching, isError } = useCandidates({ ...filters, pageSize: 12 });

  const update = (next: Partial<typeof filters>) => {
    const sp = new URLSearchParams();
    const merged = { ...filters, ...next };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "page" && v === 1) && !(k === "sort" && v === "featured")) sp.set(k, String(v));
    setParams(sp, { replace: true });
  };

  return (
    <>
      <Seo title="Browse Verified Candidates" description="Search background-verified maids, nannies, cooks and caregivers by role, city, nationality, experience and availability." path="/candidates" />
      <PageHeader compact eyebrow="Browse Candidates" align="center" title={<>Verified Professionals<br />Ready to Support Your Home</>} description="Browse through our pool of trained and background-verified candidates." background="/images/bg-browse.webp" />

      <section className="py-10 lg:py-14">
        <div className="container-x">
          <div className="-mt-20 rounded-2xl bg-cream-50 p-4 shadow-lift ring-1 ring-forest-900/8 lg:-mt-24">
            <CandidateFilters value={filters} onChange={(f) => update({ ...f, page: 1 })} />
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-ink-500" aria-live="polite">
              {isLoading ? "Searching…" : data ? `${data.total} candidate${data.total === 1 ? "" : "s"} found` : ""}
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-500">
              Sort by
              <select value={filters.sort} onChange={(e) => update({ sort: e.target.value, page: 1 })} className="field h-10 w-auto py-0 pr-8 text-sm">
                <option value="featured">Featured</option>
                <option value="experience">Most experienced</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>

          {isError ? (
            <p role="alert" className="mt-10 text-center text-ink-500">
              We couldn't load candidates. Please try again shortly.
            </p>
          ) : (
            <Reveal as="ul" key={JSON.stringify(filters)} staggerChildren={0.06} className={cn("mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", isFetching && !isLoading && "opacity-70 transition-opacity")}>
              {isLoading
                ? Array.from({ length: 8 }, (_, i) => (
                    <li key={i}>
                      <CandidateCardSkeleton />
                    </li>
                  ))
                : data?.items.map((c) => (
                    <RevealItem as="li" key={c.id}>
                      <CandidateCard c={c} />
                    </RevealItem>
                  ))}
            </Reveal>
          )}

          {data && data.items.length === 0 && (
            <div className="mt-10 rounded-2xl bg-cream-200/70 px-6 py-16 text-center">
              <h2 className="h-serif text-2xl text-ink-950">No candidates match these filters yet</h2>
              <p className="mt-2 text-ink-500">Tell us what you need and we'll source candidates for you within days.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => setParams({}, { replace: true })} variant="outline">
                  Clear filters
                </Button>
                <Button to="/contact" arrow>
                  Share your requirements
                </Button>
              </div>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              <button type="button" onClick={() => update({ page: filters.page - 1 })} disabled={filters.page <= 1} aria-label="Previous page" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest-950 shadow-soft disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => update({ page: n })} aria-current={n === filters.page ? "page" : undefined} className={cn("h-11 min-w-11 rounded-full px-3 text-sm font-semibold", n === filters.page ? "bg-forest-900 text-white" : "bg-white text-ink-700 shadow-soft hover:bg-cream-200")}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => update({ page: filters.page + 1 })} disabled={filters.page >= data.totalPages} aria-label="Next page" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest-950 shadow-soft disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
