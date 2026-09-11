import { Check } from "lucide-react";
import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SERVICES } from "@/lib/content";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  return (
    <>
      <Seo title="Our Services" description="Full-time, part-time and live-in maids, cooks, elderly caregivers and nannies for homes in the UAE and Saudi Arabia." path="/services" />
      <PageHeader eyebrow="Our Services" serif={false} title={<>Tailored Support<br />for Every Home</>} description="From daily housekeeping to specialised care, we help you find the right professional for your needs." background="/images/bg-warm.webp" subject="/images/services-header.webp" subjectAlt="A housekeeper preparing a bed with fresh white pillows" />

      <section className="py-16 lg:py-24">
        <div className="container-x">
          <ServicesGrid />
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="container-x space-y-24">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} id={s.slug} staggerChildren={0.1} className={cn("grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
              <RevealItem className="overflow-hidden rounded-2xl shadow-card">
                <img src={s.image} alt={s.label} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
              </RevealItem>
              <RevealItem>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-200 text-forest-900">
                  <s.Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
                </span>
                <h2 className="h-serif mt-5 text-[2.2rem] text-ink-950 sm:text-[2.6rem]">{s.label}</h2>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-500">{s.description}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {s.includes.map((x) => (
                    <li key={x} className="flex items-start gap-3 text-[0.98rem] text-ink-900">
                      <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
                        <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to={`/contact?service=${s.slug}`} arrow>
                    Request this service
                  </Button>
                  <Button to={`/candidates?service=${s.slug}`} variant="outline">
                    View candidates
                  </Button>
                </div>
              </RevealItem>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
