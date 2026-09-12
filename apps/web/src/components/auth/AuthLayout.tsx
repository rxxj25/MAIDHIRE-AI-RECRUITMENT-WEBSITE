import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, House, Heart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export interface TrustItem {
  Icon: LucideIcon;
  text: string;
}

export const GUEST_TRUST_ITEMS: TrustItem[] = [
  { Icon: ShieldCheck, text: "Verified & Trusted Professionals" },
  { Icon: House, text: "Safe & Hassle-Free Hiring" },
  { Icon: Heart, text: "A Happier Home Everyday" },
];

interface Props {
  eyebrow?: string;
  heading?: string;
  description?: string;
  trustItems?: TrustItem[];
  children: ReactNode;
}

/** Split-screen auth shell: photographic brand panel on the left, form card on the right. */
export function AuthLayout({
  eyebrow = "A Cleaner, Calmer Tomorrow",
  heading = "Trusted Care for Brighter Tomorrows",
  description = "Find reliable, verified, and professional house help for a happier, stress-free home.",
  trustItems = GUEST_TRUST_ITEMS,
  children,
}: Props) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest-950 lg:block">
        <img src="/images/cta-towels.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/92 via-forest-950/72 to-forest-950/25" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" />

          <div>
            <p className="eyebrow text-mint-400">{eyebrow}</p>
            <h1 className="h-serif mt-3 max-w-md text-[2.75rem] leading-[1.05] text-white">{heading}</h1>
            <p className="mt-4 max-w-sm text-[1.05rem] text-white/75">{description}</p>

            <ul className="mt-8 space-y-4">
              {trustItems.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <Icon aria-hidden="true" className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </span>
                  <span className="font-medium text-white">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="script text-2xl leading-tight text-mint-300">
            Better Homes
            <br />
            Happier Lives
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream-100 px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
