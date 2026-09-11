import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { scaleIn } from "@/lib/motion";

/** "A Smoother Way to a Happier Home" split banner — sand panel + photo, as in the mockup. */
export function CtaBanner() {
  return (
    <Reveal variants={scaleIn} className="overflow-hidden rounded-2xl bg-cream-200 shadow-card ring-1 ring-forest-900/6 lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
        <Reveal staggerChildren={0.1}>
          <RevealItem as="h2" className="h-serif text-balance text-[2.4rem] text-forest-950 sm:text-[3rem] lg:text-[3.4rem]">
            A Smoother Way
            <br />
            to a Happier Home
          </RevealItem>
          <RevealItem as="p" className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-ink-500">
            Let us handle the search, screening and paperwork, so you can focus on what truly matters.
          </RevealItem>
          <RevealItem className="mt-8">
            <Button to="/contact" variant="primary" size="lg" className="rounded-xl px-10">
              Find Your Maid
            </Button>
          </RevealItem>
        </Reveal>
      </div>
      <div className="relative min-h-[300px] lg:min-h-[420px]">
        <img src="/images/cta-towels.webp" alt="A smiling housekeeper holding a stack of freshly folded white towels" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_15%]" />
      </div>
    </Reveal>
  );
}
