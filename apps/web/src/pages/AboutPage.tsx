import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsBand } from "@/components/sections/StatsBand";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { HeartHandshake, ShieldCheck, Sparkles, Scale } from "lucide-react";

const VALUES = [
  { Icon: ShieldCheck, title: "Safety first", text: "Every placement is built on verified identity, references, medical fitness and police clearance." },
  { Icon: HeartHandshake, title: "Dignity for everyone", text: "Fair contracts, ethical recruitment and ongoing welfare check-ins for the people we place." },
  { Icon: Sparkles, title: "Personal matching", text: "No databases dumped on you — a consultant curates a shortlist for your family's rhythm." },
  { Icon: Scale, title: "Transparent pricing", text: "Clear plans, government fees at cost, and a written replacement guarantee." },
];

export default function AboutPage() {
  return (
    <>
      <Seo title="About MaidHire" description="MaidHire is a premium domestic staffing agency serving families in the UAE and Saudi Arabia with verified, ethically recruited household professionals." path="/about" />
      <PageHeader eyebrow="About Us" title={<>Trusted Care for<br />Brighter Tomorrows</>} description="We started MaidHire because finding trustworthy help for your home should feel personal, safe and simple — for families and for the professionals who care for them." background="/images/how-it-works.webp" />

      <section className="py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="overflow-hidden rounded-2xl shadow-card">
            <img src="/images/services/elderly-care.webp" alt="A caregiver sharing a warm moment with an elderly lady" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </Reveal>
          <div>
            <SectionHeader eyebrow="Our Story" serif title="Built for the Gulf, by people who live here" description="With offices in Dubai and Riyadh, our consultants understand the sponsorship process, the cultural nuances of household work and what discerning families expect. We recruit ethically from the Philippines, Indonesia, India, Sri Lanka, Nepal and East Africa, and we stay involved long after placement." />
          </div>
        </div>
      </section>

      <section className="bg-cream-200/70 py-20 lg:py-28">
        <div className="container-x">
          <SectionHeader eyebrow="What We Stand For" serif align="center" title="Our Values" />
          <Reveal as="ul" staggerChildren={0.1} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, title, text }) => (
              <RevealItem as="li" key={title} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-white">
                  <Icon aria-hidden="true" className="h-5.5 w-5.5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-[1.1rem] font-bold text-ink-950">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">{text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-x">
          <StatsBand />
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <CtaBanner />
        </div>
      </section>
    </>
  );
}
