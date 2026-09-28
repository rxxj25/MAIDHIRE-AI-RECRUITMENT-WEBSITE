import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SERVICE_TYPES } from "@maidhire/shared";
import { SITE } from "@/lib/utils";

const social = [
  { href: SITE.social.instagram, label: "Instagram", Icon: Instagram },
  { href: SITE.social.facebook, label: "Facebook", Icon: Facebook },
  { href: SITE.social.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: SITE.social.youtube, label: "YouTube", Icon: Youtube },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#0b3a2c] text-white">
      {/* Brand artwork: house silhouette (left), leaves (top-right), towels & dispenser (bottom-right). Columns stay in the clean centre. */}
      <picture aria-hidden="true" className="absolute inset-0 -z-10 block">
        <source media="(min-width: 768px)" srcSet="/images/footer-bg.webp" />
        <img src="/images/footer-bg-sm.webp" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-[80%_50%] md:object-center" />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#062b21]/40 via-transparent to-[#062b21]/55 md:from-[#062b21]/20" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20 lg:pr-[16%] xl:pr-[20%]">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-6 text-pretty text-[0.95rem] leading-relaxed text-white/80">
            Verified, trained domestic staff for discerning families across the UAE and Saudi Arabia. Safe, personal and hassle-free.
          </p>
          <p className="script mt-6 text-2xl text-mint-400">Better Homes, Happier Lives</p>
          <ul className="mt-6 flex gap-3">
            {social.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-mint-400 hover:text-forest-950">
                  <Icon className="h-4.5 w-4.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Services">
          <h3 className="eyebrow text-mint-400">Services</h3>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-white/85">
            {SERVICE_TYPES.map((s) => (
              <li key={s.slug}>
                <Link to={`/services#${s.slug}`} className="transition-colors hover:text-white">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="eyebrow text-mint-400">Company</h3>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-white/85">
            {[
              ["/about", "About Us"],
              ["/how-it-works", "How It Works"],
              ["/candidates", "Browse Candidates"],
              ["/pricing", "Pricing"],
              ["/join", "Join as a Candidate"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow text-mint-400">Get in touch</h3>
          <ul className="mt-5 space-y-4 text-[0.95rem] text-white/85">
            <li className="flex gap-3">
              <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
              <span>
                <a href={`tel:${SITE.phoneAe.replace(/\s/g, "")}`} className="block hover:text-white">
                  {SITE.phoneAe} <span className="text-white/45">UAE</span>
                </a>
                <a href={`tel:${SITE.phoneSa.replace(/\s/g, "")}`} className="block hover:text-white">
                  {SITE.phoneSa} <span className="text-white/45">KSA</span>
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
              <span>
                {SITE.addressAe}
                <br />
                {SITE.addressSa}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/12 bg-[#062b21]/35 backdrop-blur-[2px]">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-[0.8rem] text-white/60 sm:flex-row lg:pr-[16%] xl:pr-[20%]">
          <p>
            © {new Date().getFullYear()} MaidHire. All rights reserved. · Made by Rajdeep Bandyopadhaya ·{" "}
            <a href="mailto:rajdeep04@icloud.com" className="hover:text-white">
              rajdeep04@icloud.com
            </a>
          </p>
          <ul className="flex gap-6">
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
