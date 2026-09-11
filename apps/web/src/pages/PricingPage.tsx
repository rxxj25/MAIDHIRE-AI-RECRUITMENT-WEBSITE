import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <PageHeader compact eyebrow="Pricing" align="center" title={<>Transparent Plans<br />for Your Peace of Mind</>} description="Choose a plan that works best for your home. No hidden charges." background="/images/bg-pricing.webp">
        <div className="flex justify-center">
          <CurrencyToggle />
        </div>
      </PageHeader>
      <div aria-hidden="true" className="pointer-events-none relative hidden lg:block">
        <p className="script absolute -top-52 left-[6%] rotate-[-12deg] text-3xl text-white/75">Trusted Care ♡<br />for Brighter<br />Tomorrows</p>
        <p className="script absolute -top-60 right-[5%] rotate-[8deg] text-right text-3xl text-white/75">Better<br />Homes<br />Happier<br />Lives</p>
      </div>

      <section className="relative pb-20 pt-6 lg:pb-28">
        <div className="container-x">
          {isError ? (
            <p role="alert" className="text-center text-ink-500">
              Plans are temporarily unavailable. Please contact us for a quote.
            </p>
          ) : (
            <PricingPlans plans={data} loading={isLoading} />
          )}
          <p className="mt-8 text-center text-[0.85rem] text-ink-400">Prices exclude government fees (visa, medical, Emirates ID / Iqama) which are billed at cost. Service fees are one-time per placement.</p>
        </div>
      </section>

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
