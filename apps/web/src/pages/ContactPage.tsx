import { useSearchParams } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Seo } from "@/components/ui/Seo";
import { ContactForm } from "@/components/forms/ContactForm";
import { HireRequestForm } from "@/components/forms/HireRequestForm";
import { usePlans } from "@/lib/queries";
import { SITE, cn } from "@/lib/utils";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { easeOut } from "@/lib/motion";

const social = [
  { href: SITE.social.instagram, label: "Instagram", Icon: Instagram },
  { href: SITE.social.facebook, label: "Facebook", Icon: Facebook },
  { href: SITE.social.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: SITE.social.youtube, label: "YouTube", Icon: Youtube },
];

/**
 * Contact — mirrors the approved design: the sunlit room photo full-bleed, a cream glass panel over the
 * left half carrying the copy + contact details, and a white form card on the right.
 */
export default function ContactPage() {
  const [params, setParams] = useSearchParams();
  const plan = params.get("plan") ?? undefined;
  const service = params.get("service") ?? undefined;
  const mode: "message" | "request" = params.get("mode") === "request" || plan || service ? "request" : "message";
  const { data: plans } = usePlans();
  const reduce = useReducedMotion();

  const setMode = (m: "message" | "request") => {
    const sp = new URLSearchParams(params);
    if (m === "message") ["plan", "service", "mode"].forEach((k) => sp.delete(k));
    else sp.set("mode", "request");
    setParams(sp, { replace: true });
  };

  const details = [
    { Icon: Phone, main: SITE.phoneAe, sub: `UAE · ${SITE.hours}`, href: `tel:${SITE.phoneAe.replace(/\s/g, "")}` },
    { Icon: Phone, main: SITE.phoneSa, sub: `KSA · ${SITE.hours}`, href: `tel:${SITE.phoneSa.replace(/\s/g, "")}` },
    { Icon: Mail, main: SITE.email, sub: "We respond within 24 hours", href: `mailto:${SITE.email}` },
    { Icon: MapPin, main: SITE.addressAe, sub: SITE.addressSa },
  ];

  return (
    <>
      <Seo title="Contact Us" description="Talk to a MaidHire consultant in Dubai or Riyadh. Send a message or submit a hire request — we reply within 24 hours." path="/contact" />
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          <img src="/images/bg-contact.webp" alt="" className="h-full w-full object-cover object-[48%_50%]" {...{ fetchpriority: "high" }} />
          {/* Dark glass band behind the fixed navbar + a whisper of cream so the copy stays legible on the bright wall */}
          <div className="absolute inset-x-0 top-0 h-[84px] bg-[#1d1a15]/70 backdrop-blur-md lg:h-[92px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-sand-100/70 via-sand-100/30 via-45% to-transparent" />
        </div>

        <div className="container-x grid gap-12 pb-14 pt-32 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-20 lg:pt-40">
          <Reveal staggerChildren={0.1} className="max-w-[560px] lg:pt-6">
            <RevealItem as="p" className="eyebrow text-forest-700">
              Get in Touch
            </RevealItem>
            <RevealItem as="h1" className="h-serif mt-4 text-[3rem] text-ink-950 sm:text-[3.8rem] lg:text-[4.4rem]">
              We're Here
              <br />
              to Help
            </RevealItem>
            <RevealItem as="p" className="mt-6 text-pretty text-[1.25rem] leading-relaxed text-ink-900">
              Have questions or need personalised assistance? Our team in Dubai and Riyadh is just a message away.
            </RevealItem>
            <RevealItem as="ul" className="mt-8 space-y-4">
              {details.map(({ Icon, main, sub, href }) => (
                <li key={main} className="flex items-center gap-4 [perspective:900px]">
                  <span className="icon-badge-3d flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-forest-900 text-white">
                    <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <div>
                    {href ? (
                      <a href={href} className="text-[1.2rem] font-bold text-ink-950 hover:text-forest-900">
                        {main}
                      </a>
                    ) : (
                      <p className="text-[1.2rem] font-bold text-ink-950">{main}</p>
                    )}
                    <p className="text-[1.02rem] text-ink-700">{sub}</p>
                  </div>
                </li>
              ))}
            </RevealItem>
            <RevealItem className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <p aria-hidden="true" className="script text-[2.3rem] leading-[1.05] text-forest-900">
                Better Homes
                <br />
                Happier Lives
              </p>
              <ul className="flex gap-3">
                {social.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-900/90 text-white transition-colors hover:bg-forest-700">
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </RevealItem>
          </Reveal>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -10, 0] }}
            transition={reduce ? { duration: 0.3 } : { opacity: { duration: 1, ease: easeOut, delay: 0.3 }, y: { delay: 0.3, duration: 7, repeat: Infinity, ease: "easeInOut" } }}
            className="relative rounded-[28px] bg-white p-6 shadow-[0_2px_4px_rgb(10_50_41/0.04),0_24px_48px_-16px_rgb(10_50_41/0.28),0_60px_120px_-40px_rgb(10_50_41/0.35)] ring-1 ring-forest-900/6 sm:p-9 lg:p-12"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="h-serif text-[2.2rem] text-ink-950 sm:text-[2.7rem]">{mode === "message" ? "Send Us a Message" : "Request a Hire"}</h2>
                <p className="text-[1.05rem] text-ink-700">{mode === "message" ? "Fill out the form and we'll get back to you soon." : "Tell us about your household. A consultant will call within 24 hours."}</p>
              </div>
              <div role="tablist" aria-label="Contact type" className="inline-flex rounded-full bg-cream-200 p-1">
                {(["message", "request"] as const).map((m) => (
                  <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("h-9 rounded-full px-4 text-[0.82rem] font-semibold transition-colors", mode === m ? "bg-forest-900 text-white" : "text-ink-700 hover:text-forest-900")}>
                    {m === "message" ? "Message" : "Hire request"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">{mode === "message" ? <ContactForm defaultService={service} /> : <HireRequestForm plans={plans} defaultPlan={plan} defaultService={service} />}</div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
