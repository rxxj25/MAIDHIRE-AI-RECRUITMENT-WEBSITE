import { Seo } from "@/components/ui/Seo";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Contact details and household requirements you submit through our forms; candidate profile information, documents and photographs submitted by applicants; and technical data such as a hashed IP address used to prevent abuse."],
      ["How we use it", "To match families with candidates, to contact you about your request, to verify candidates, to comply with UAE and KSA recruitment regulations, and to improve our service. We never sell personal data."],
      ["Sharing", "Candidate profiles are shown to prospective employers only in anonymised form (first name and initial) until an interview is arranged. Documents are shared only with government bodies as required for sponsorship."],
      ["Retention", "Enquiries are retained for 24 months; candidate records for the duration of their engagement plus statutory periods. You may request deletion at any time by emailing hello@maidhire.com."],
      ["Your rights", "You may request access to, correction of, or deletion of your personal data. We respond within 30 days."],
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      ["Our role", "MaidHire is a licensed domestic-worker recruitment agency. We source, screen and introduce candidates; the employment contract is between the employer and the domestic worker under applicable law (Tadbeer in the UAE, Musaned in KSA)."],
      ["Fees", "Plan fees are one-time per placement and exclude government charges, which are billed at cost. Fees are payable on selection of a candidate, before documentation begins."],
      ["Replacement guarantee", "If a placement ends within the plan's replacement window for reasons other than employer misconduct, we provide one replacement at no additional service fee."],
      ["Conduct", "Employers agree to provide lawful working conditions, timely salary payment and respectful treatment. Breach may result in termination of services and reporting to authorities."],
      ["Liability", "We take all reasonable care in screening, but cannot guarantee outcomes. Our liability is limited to the service fee paid."],
    ],
  },
};

export default function LegalPage({ kind }: { kind: keyof typeof CONTENT }) {
  const c = CONTENT[kind];
  return (
    <>
      <Seo title={c.title} path={`/${kind}`} />
      <div className="h-[84px] bg-forest-950 lg:h-[92px]" aria-hidden="true" />
      <section className="py-16 lg:py-24">
        <div className="container-x max-w-3xl">
          <p className="eyebrow text-forest-700">Legal</p>
          <h1 className="h-serif mt-3 text-[2.6rem] text-ink-950">{c.title}</h1>
          <p className="mt-2 text-sm text-ink-400">Last updated: September 2026</p>
          <div className="mt-10 space-y-8">
            {c.sections.map(([h, p]) => (
              <section key={h}>
                <h2 className="text-xl font-bold text-ink-950">{h}</h2>
                <p className="mt-2 leading-relaxed text-ink-700">{p}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
