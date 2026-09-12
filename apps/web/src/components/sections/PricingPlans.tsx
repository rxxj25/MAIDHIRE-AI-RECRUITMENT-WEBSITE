import { Check, Crown, Gem, Headset, House, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicPlan } from "@maidhire/shared";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/hooks/useCurrency";
import { cn, formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Spinner";

const ICONS: Record<string, typeof House> = { basic: House, standard: Users, premium: Gem };

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div role="radiogroup" aria-label="Currency" className={cn("inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/20", className)}>
      {(["AED", "SAR"] as const).map((c) => (
        <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)} className={cn("h-9 rounded-full px-5 text-sm font-semibold transition-colors", currency === c ? "bg-white text-forest-950" : "text-white/80 hover:text-white")}>
          {c === "AED" ? "UAE · AED" : "KSA · SAR"}
        </button>
      ))}
    </div>
  );
}

export function PlanCard({ plan }: { plan: PublicPlan }) {
  const { currency } = useCurrency();
  const Icon = ICONS[plan.slug] ?? House;
  const price = currency === "AED" ? plan.priceAed : plan.priceSar;
  return (
    <article className={cn("card-3d glass relative flex h-full flex-col overflow-hidden rounded-2xl text-white", plan.isPopular && "border-mint-500/70 lg:-mt-6 lg:mb-[-1px]")} aria-label={`${plan.name} plan`}>
      {plan.isPopular && (
        <div className="flex items-center justify-center gap-2 bg-forest-800 py-2.5 text-[0.95rem] font-semibold text-white">
          <Crown aria-hidden="true" className="h-4 w-4 text-gold-500" />
          Most Popular
        </div>
      )}
      <div className="flex flex-1 flex-col px-7 pb-8 pt-8 text-center sm:px-8 [perspective:900px]">
        <span className="icon-badge-3d mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white">
          <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
        </span>
        <h3 className="mt-4 text-[1.9rem] font-extrabold tracking-tight">{plan.name}</h3>
        <p className="text-[1.05rem] text-white/75">{plan.tagline}</p>
        <p className="mt-4">
          <span className="text-[2.6rem] font-extrabold tracking-tight">{formatMoney(price, currency)}</span>
        </p>
        <p className="text-[0.92rem] text-white/70">+ one-time service fee</p>
        <hr className="my-6 border-white/12" />
        <ul className="space-y-3.5 text-left text-[1.02rem] text-white/95">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-forest-800 text-white ring-1 ring-white/15">
                <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <Button to={`/contact?plan=${plan.slug}`} variant={plan.isPopular ? "primary" : "outline-light"} size="lg" className="w-full rounded-xl text-[1.05rem]">
            Get Started
          </Button>
          {plan.footnote && <p className="mt-4 text-[0.85rem] text-white/70">{plan.footnote}</p>}
        </div>
      </div>
    </article>
  );
}

export function PricingPlans({ plans, loading }: { plans?: PublicPlan[]; loading?: boolean }) {
  return (
    <>
      <Reveal as="div" staggerChildren={0.12} className="grid gap-6 lg:grid-cols-3 lg:items-start lg:gap-5">
        {loading
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[560px]" />)
          : plans?.map((p) => (
              <RevealItem key={p.slug} className="h-full [perspective:1400px]">
                <PlanCard plan={p} />
              </RevealItem>
            ))}
      </Reveal>
      <Reveal className="glass mt-8 flex flex-col items-center gap-6 rounded-2xl px-6 py-6 text-white sm:flex-row sm:px-8 [perspective:900px]">
        <span className="icon-badge-3d flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white">
          <Headset aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
        </span>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="h-serif text-[1.5rem]">Need a Custom Plan?</h3>
          <p className="text-white/75">Contact us for tailored solutions for large households, multiple staff or corporate placements.</p>
        </div>
        <Link to="/contact?plan=custom" className="group inline-flex h-14 items-center gap-2 rounded-lg bg-forest-900 px-8 font-semibold text-white transition hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint-300/60">
          Contact Us
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </>
  );
}
