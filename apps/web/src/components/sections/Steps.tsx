import { STEPS } from "@/lib/content";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

/** The four-step "How It Works" row on the cream panel. */
export function Steps() {
  return (
    <Reveal as="ol" staggerChildren={0.12} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-forest-900/12">
      {STEPS.map(({ n, Icon, title, text }) => (
        <RevealItem as="li" key={n} className="flex flex-col items-center px-4 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-forest-900 text-white shadow-[0_16px_30px_-16px_rgb(10_50_41/0.8)]">
            <Icon aria-hidden="true" className="h-10 w-10" strokeWidth={1.6} />
          </span>
          <span className="mt-4 text-4xl font-extrabold tracking-tight text-forest-950" aria-hidden="true">
            {n}
          </span>
          <h3 className="mt-1 text-[1.25rem] font-bold text-ink-950">
            <span className="sr-only">Step {n}: </span>
            {title}
          </h3>
          <p className="mt-2 max-w-[260px] text-pretty text-[1.02rem] leading-relaxed text-ink-500">{text}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
