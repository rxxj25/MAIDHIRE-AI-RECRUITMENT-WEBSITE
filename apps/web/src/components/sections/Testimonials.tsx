import { Quote } from "lucide-react";
import { useTestimonials } from "@/lib/queries";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import { useReducedMotion } from "framer-motion";

/** Infinite CSS marquee (transform-only, pauses on hover, static list when reduced motion). */
export function Testimonials() {
  const { data } = useTestimonials();
  const reduce = useReducedMotion();
  if (!data?.length) return null;
  const items = reduce ? data : [...data, ...data];
  return (
    <section className="overflow-hidden bg-forest-950 py-20 text-white lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow="Testimonials" tone="light" serif align="center" title="Trusted by Families Across the Gulf" description="Real words from households in Dubai, Abu Dhabi, Riyadh and Jeddah." />
      </div>
      <div className={reduce ? "container-x mt-12 grid gap-5 md:grid-cols-2" : "mask-fade-x mt-14"}>
        <ul className={reduce ? "contents" : "animate-marquee flex w-max gap-5 px-2.5"} style={{ "--marquee-duration": `${Math.max(40, data.length * 14)}s` } as React.CSSProperties} aria-label="Customer testimonials">
          {items.map((t, i) => (
            <li key={`${t.id}-${i}`} aria-hidden={!reduce && i >= data.length ? true : undefined} className={reduce ? "" : "w-[340px] shrink-0 sm:w-[420px]"}>
              <figure className="flex h-full flex-col rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/10 backdrop-blur-sm">
                <Quote aria-hidden="true" className="h-7 w-7 text-mint-400" />
                <blockquote className="mt-4 flex-1 text-pretty text-[1.02rem] leading-relaxed text-white/85">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{t.authorName}</p>
                    <p className="text-sm text-white/55">{t.authorLocation}</p>
                  </div>
                  <Stars rating={t.rating} className="[&_span:last-child]:text-white" />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
