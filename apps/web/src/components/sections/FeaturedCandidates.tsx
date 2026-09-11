import { SectionHeader } from "@/components/ui/SectionHeader";
import { CandidateCarousel } from "@/components/candidates/CandidateCarousel";
import { useFeaturedCandidates } from "@/lib/queries";
import { Button } from "@/components/ui/Button";

export function FeaturedCandidates() {
  const { data, isLoading, isError } = useFeaturedCandidates();
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/images/bg-browse.webp')] bg-cover bg-center opacity-[0.28]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-100 via-cream-100/70 to-cream-100" />
      <div className="container-x">
        <SectionHeader eyebrow="Browse Candidates" align="center" serif title={<>Verified Professionals<br />Ready to Support Your Home</>} description="Browse through our pool of trained and background-verified candidates across the UAE and Saudi Arabia." />
        <div className="mt-12">
          {isError ? (
            <p role="alert" className="text-center text-ink-500">
              We couldn't load candidates right now. Please try again shortly.
            </p>
          ) : (
            <CandidateCarousel items={data} loading={isLoading} />
          )}
        </div>
        <div className="mt-10 text-center">
          <Button to="/candidates" variant="outline" size="lg" arrow>
            Browse all candidates
          </Button>
        </div>
      </div>
    </section>
  );
}
