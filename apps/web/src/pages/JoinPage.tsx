import { Seo } from "@/components/ui/Seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandidateApplicationForm } from "@/components/forms/CandidateApplicationForm";
import { Reveal } from "@/components/ui/Reveal";
import { BadgeCheck, HandCoins, HeartHandshake } from "lucide-react";

const PERKS = [
  { Icon: HandCoins, title: "Fair pay, on time", text: "Contracts that follow UAE and KSA labour law, with salary paid on schedule." },
  { Icon: BadgeCheck, title: "Verified families", text: "We screen employers too. You'll meet them before you decide." },
  { Icon: HeartHandshake, title: "Ongoing support", text: "A dedicated welfare officer and a WhatsApp line you can reach anytime." },
];

export default function JoinPage() {
  return (
    <>
      <Seo title="Join as a Candidate" description="Apply to join MaidHire's pool of verified housekeepers, nannies, cooks and caregivers placed with families in the UAE and Saudi Arabia." path="/join" />
      <PageHeader compact eyebrow="For Candidates" title={<>Work with Families<br />Who Value You</>} description="Join a trusted network of household professionals. Verified placements, fair contracts and support throughout your journey." background="/images/services-header.webp" />
      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <Reveal className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {PERKS.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4 [perspective:900px]">
                <span className="icon-badge-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="font-bold text-ink-950">{title}</h2>
                  <p className="mt-1 text-[0.95rem] text-ink-500">{text}</p>
                </div>
              </div>
            ))}
          </Reveal>
          <Reveal className="card p-6 sm:p-9">
            <CandidateApplicationForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
