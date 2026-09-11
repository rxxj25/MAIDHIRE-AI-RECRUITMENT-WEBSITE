import { STATS } from "@/lib/content";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

export function StatsBand() {
  return (
    <Reveal as="ul" staggerChildren={0.1} className="grid grid-cols-2 gap-8 lg:grid-cols-4">
      {STATS.map((s) => (
        <RevealItem as="li" key={s.label} className="text-center lg:text-left">
          <p className="h-serif text-[2.8rem] text-forest-950 sm:text-[3.4rem]">
            <CountUp value={s.value} suffix={s.suffix} />
          </p>
          <p className="mt-1 text-[0.95rem] font-medium text-ink-500">{s.label}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
