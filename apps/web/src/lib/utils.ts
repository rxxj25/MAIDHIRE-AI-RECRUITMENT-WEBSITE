import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatMoney = (amount: number, currency: "AED" | "SAR") =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export const titleCase = (s: string) => s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "971501234567";
export const whatsappLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** The Twilio number wired to the AI phone receptionist (apps/api/src/routes/voice.ts). Unset until that's configured. */
export const VOICE_NUMBER = import.meta.env.VITE_VOICE_NUMBER ?? "";
export const voiceCallLink = () => `tel:${VOICE_NUMBER}`;

export const SITE = {
  name: "MaidHire",
  phoneAe: "+971 50 123 4567",
  phoneSa: "+966 50 123 4567",
  email: "hello@maidhire.com",
  hours: "Sat – Thu, 9:00 AM – 7:00 PM",
  addressAe: "Business Bay, Dubai, UAE",
  addressSa: "Al Olaya, Riyadh, KSA",
  social: {
    instagram: "https://instagram.com/maidhire",
    facebook: "https://facebook.com/maidhire",
    linkedin: "https://linkedin.com/company/maidhire",
    youtube: "https://youtube.com/@maidhire",
  },
};
