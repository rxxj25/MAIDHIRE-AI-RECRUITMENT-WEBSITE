import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Steps } from "@/components/sections/Steps";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FAQS } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ChevronDown, FileCheck2, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";

const VERIFICATION = [
  { Icon: UserCheck, title: "Identity & documents", text: "Passport, visa status and certificates verified against originals." },
  { Icon: FileCheck2, title: "Reference checks", text: "We call previous employers and confirm duration, duties and conduct." },
  { Icon: Stethoscope, title: "Medical fitness", text: "Government-approved medical fitness testing arranged before placement." },
  { Icon: ShieldCheck, title: "Police clearance", text: "Home-country and Gulf police clearance certificates obtained and attested." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Seo title="How It Works" description="Share your requirements, get matched with verified candidates, interview and hire with confidence. Documentation handled end-to-end." path="/how-it-works" />
      <PageHeader eyebrow="How It Works" title={<>Get the Right Help<br />in 4 Easy Steps</>} description="We make domestic staff recruitment simple, transparent, and stress-free." background="/images/how-it-works.webp" overlap />

      <section className="pb-16 lg:pb-24">
        <div className="container-x">
          <div className="relative z-10 -mt-20 rounded-[22px] bg-cream-50 px-6 py-12 shadow-[0_30px_60px_-30px_rgb(10_50_41/0.45)] ring-1 ring-forest-900/6 lg:-mt-24 lg:px-10 lg:py-14">
            <Steps />
          </div>
          <div className="mt-10">
            <CtaBanner />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHeader eyebrow="Verification" serif align="center" title="What “Verified” Means at MaidHire" description="Every candidate on our platform passes a four-stage screening before they ever meet a family." />
          <Reveal as="ul" staggerChildren={0.1} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VERIFICATION.map(({ Icon, title, text }) => (
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

      <section className="pb-20 lg:pb-28">
        <div className="container-x max-w-3xl">
          <SectionHeader eyebrow="FAQ" serif align="center" title="Questions Families Ask" />
          <Reveal as="div" staggerChildren={0.08} className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <RevealItem as="details" key={f.q} className="group card open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[1.05rem] font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-forest-900 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-6 text-pretty leading-relaxed text-ink-500">{f.a}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
