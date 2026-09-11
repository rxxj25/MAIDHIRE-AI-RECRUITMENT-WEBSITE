import { Seo } from "@/components/ui/Seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PricingPlans, CurrencyToggle } from "@/components/sections/PricingPlans";
import { usePlans } from "@/lib/queries";
import { FAQS } from "@/lib/content";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ChevronDown } from "lucide-react";

export default function PricingPage() {
  const { data, isLoading, isError } = usePlans();
  return (
    <>
      <Seo title="Pricing" description="Transparent placement plans in AED and SAR — Basic, Standard and Premium — with replacement guarantees and documentation support." path="/pricing" />
      {/* Full-bleed blurred interior behind header + glass cards, as in the design */}
      <div className="relative isolate overflow-hidden bg-[#1f1a15] text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img src="/images/bg-pricing.webp" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#14110d]/28" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream-100 to-transparent" />
        </div>

        <div className="container-x pb-24 pt-36 lg:pt-44">
          <SectionHeader eyebrow="Pricing" tone="light" align="center" title={<>Transparent Plans<br />for Your Peace of Mind</>} description="Choose a plan that works best for your home. No hidden charges." />
          <div className="mt-8 flex justify-center">
            <CurrencyToggle />
          </div>
          <div className="mt-14">
            {isError ? (
              <p role="alert" className="text-center text-white/80">
                Plans are temporarily unavailable. Please contact us for a quote.
              </p>
            ) : (
              <PricingPlans plans={data} loading={isLoading} />
            )}
          </div>
          <p className="mt-8 text-center text-[0.85rem] text-white/60">Prices exclude government fees (visa, medical, Emirates ID / Iqama) which are billed at cost. Service fees are one-time per placement.</p>
        </div>
      </div>

      <section className="bg-cream-200/70 py-20 lg:py-28">
        <div className="container-x max-w-3xl">
          <h2 className="h-serif text-center text-[2.2rem] text-ink-950">Plan Questions</h2>
          <Reveal as="div" staggerChildren={0.08} className="mt-10 space-y-3">
            {FAQS.slice(0, 4).map((f) => (
              <RevealItem as="details" key={f.q} className="group card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[1.05rem] font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-forest-900 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-ink-500">{f.a}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
