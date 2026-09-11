import { useSearchParams } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Seo } from "@/components/ui/Seo";
import { ContactForm } from "@/components/forms/ContactForm";
import { HireRequestForm } from "@/components/forms/HireRequestForm";
import { usePlans } from "@/lib/queries";
import { SITE, cn } from "@/lib/utils";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

const social = [
  { href: SITE.social.instagram, label: "Instagram", Icon: Instagram },
  { href: SITE.social.facebook, label: "Facebook", Icon: Facebook },
  { href: SITE.social.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: SITE.social.youtube, label: "YouTube", Icon: Youtube },
];

export default function ContactPage() {
  const [params, setParams] = useSearchParams();
  const plan = params.get("plan") ?? undefined;
  const service = params.get("service") ?? undefined;
  const mode: "message" | "request" = params.get("mode") === "request" || plan || service ? "request" : "message";
  const { data: plans } = usePlans();
  const reduce = useReducedMotion();

  const setMode = (m: "message" | "request") => {
    const sp = new URLSearchParams(params);
    if (m === "message") {
      sp.delete("plan");
      sp.delete("service");
      sp.delete("mode");
    } else sp.set("mode", "request");
    setParams(sp, { replace: true });
  };

  return (
    <>
      <Seo title="Contact Us" description="Talk to a MaidHire consultant in Dubai or Riyadh. Send a message or submit a hire request — we reply within 24 hours." path="/contact" />
      <div className="h-[84px] bg-forest-950 lg:h-[92px]" aria-hidden="true" />
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img src="/images/bg-contact.webp" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-sand-100 via-sand-100/90 to-sand-100/40 lg:to-transparent" />
        </div>
        <img src="/images/contact-plant.webp" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 hidden h-[80%] w-auto object-contain object-left-bottom opacity-90 [mask-image:linear-gradient(to_bottom,transparent,black_18%)] 2xl:block" />

        <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24 2xl:pl-[15%]">
          <Reveal staggerChildren={0.1} className="max-w-xl">
            <RevealItem as="p" className="eyebrow text-forest-700">
              Get in Touch
            </RevealItem>
            <RevealItem as="h1" className="h-serif mt-4 text-[3rem] text-ink-950 sm:text-[3.8rem] lg:text-[4.4rem]">
              We're Here
              <br />
              to Help
            </RevealItem>
            <RevealItem as="p" className="mt-5 text-pretty text-lg leading-relaxed text-ink-700">
              Have questions or need personalised assistance? Our team in Dubai and Riyadh is just a message away.
            </RevealItem>
            <RevealItem as="ul" className="mt-9 space-y-5">
              {[
                { Icon: Phone, main: SITE.phoneAe, sub: `UAE · ${SITE.hours}`, href: `tel:${SITE.phoneAe.replace(/\s/g, "")}` },
                { Icon: Phone, main: SITE.phoneSa, sub: `KSA · ${SITE.hours}`, href: `tel:${SITE.phoneSa.replace(/\s/g, "")}` },
                { Icon: Mail, main: SITE.email, sub: "We respond within 24 hours", href: `mailto:${SITE.email}` },
                { Icon: MapPin, main: `${SITE.addressAe}`, sub: SITE.addressSa },
              ].map(({ Icon, main, sub, href }) => (
                <li key={main} className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
                    <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <div>
                    {href ? (
                      <a href={href} className="text-[1.15rem] font-bold text-ink-950 hover:text-forest-900">
                        {main}
                      </a>
                    ) : (
                      <p className="text-[1.15rem] font-bold text-ink-950">{main}</p>
                    )}
                    <p className="text-ink-500">{sub}</p>
                  </div>
                </li>
              ))}
            </RevealItem>
            <RevealItem className="mt-9 flex items-end justify-between gap-6">
              <ul className="flex gap-3">
                {social.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-12 w-12 items-center justify-center rounded-lg bg-forest-900 text-white transition-colors hover:bg-forest-700">
                      <Icon className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
              <p aria-hidden="true" className="script hidden rotate-[-8deg] text-[2rem] leading-none text-forest-900 sm:block">Better Homes<br />Happier Lives</p>
            </RevealItem>
          </Reveal>

          <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: easeOut, delay: 0.3 }} className="rounded-2xl bg-cream-50 p-6 shadow-lift ring-1 ring-forest-900/8 sm:p-9 lg:p-11">
            <div role="tablist" aria-label="Contact type" className="mb-6 inline-flex rounded-full bg-cream-200 p-1">
              {(["message", "request"] as const).map((m) => (
                <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("h-10 rounded-full px-5 text-sm font-semibold transition-colors", mode === m ? "bg-forest-900 text-white" : "text-ink-700 hover:text-forest-900")}>
                  {m === "message" ? "Send a message" : "Request a hire"}
                </button>
              ))}
            </div>
            {mode === "message" ? (
              <>
                <h2 className="h-serif text-[2.2rem] text-ink-950 sm:text-[2.6rem]">Send Us a Message</h2>
                <p className="mb-6 text-ink-500">Fill out the form and we'll get back to you soon.</p>
                <ContactForm defaultService={service} />
              </>
            ) : (
              <>
                <h2 className="h-serif text-[2.2rem] text-ink-950 sm:text-[2.6rem]">Request a Hire</h2>
                <p className="mb-6 text-ink-500">Tell us about your household. A consultant will call you within 24 hours.</p>
                <HireRequestForm plans={plans} defaultPlan={plan} defaultService={service} />
              </>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
