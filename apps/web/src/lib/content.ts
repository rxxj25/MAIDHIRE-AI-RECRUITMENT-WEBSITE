import { Baby, CalendarDays, ChefHat, HeartHandshake, House, UserRound, ShieldCheck, Users, HeartPulse, Handshake, ClipboardList, CalendarCheck, BadgeCheck } from "lucide-react";

/** Static marketing content that mirrors the mockups, adapted for the UAE/KSA market. */

export const SERVICES = [
  { slug: "full-time-maid", label: "Full-Time Maid", short: "Dedicated support for a well-managed home.", Icon: House, image: "/images/services/full-time-maid.webp",
    description: "A dedicated housekeeper on a full-time schedule — daily cleaning, laundry, ironing and household organisation, tailored to your routine.",
    includes: ["Daily housekeeping & deep cleaning", "Laundry, ironing & wardrobe care", "Kitchen support & grocery organisation", "Flexible live-in or live-out arrangements"] },
  { slug: "part-time-maid", label: "Part-Time Maid", short: "Flexible help, when you need it.", Icon: CalendarDays, image: "/images/services/part-time-maid.webp",
    description: "Reliable help for a few hours a day or select days a week — ideal for apartments, busy professionals and second homes.",
    includes: ["Hourly or day-based schedules", "Same trusted helper every visit", "Cleaning, laundry & tidying", "Easy rescheduling"] },
  { slug: "live-in-maid", label: "Live-in Maid", short: "Reliable, round-the-clock assistance.", Icon: UserRound, image: "/images/services/live-in-maid.webp",
    description: "A trusted live-in helper who becomes part of the household — full support for villas and large families, with complete sponsorship guidance.",
    includes: ["Full household management", "Visa & documentation support", "Medical fitness & police clearance", "Ongoing welfare check-ins"] },
  { slug: "cook-chef", label: "Cook / Chef", short: "Delicious meals made with care.", Icon: ChefHat, image: "/images/services/cook-chef.webp",
    description: "Experienced home cooks skilled in Arabic, Indian, Filipino and continental cuisine — menu planning, dietary needs and entertaining.",
    includes: ["Weekly menu planning", "Dietary & allergy-aware cooking", "Family meals & guest hosting", "Kitchen hygiene standards"] },
  { slug: "elderly-care", label: "Elderly Care", short: "Compassionate support for your loved ones.", Icon: HeartHandshake, image: "/images/services/elderly-care.webp",
    description: "Patient, trained caregivers who support seniors with daily living, mobility, medication reminders and companionship.",
    includes: ["Nursing-assistant trained caregivers", "Mobility & personal care", "Medication reminders", "Companionship & dignity-first care"] },
  { slug: "child-care", label: "Baby & Child Care", short: "Trusted caregivers for a brighter tomorrow.", Icon: Baby, image: "/images/services/child-care.webp",
    description: "Nannies with early-years experience and first-aid training — from newborn routines to school-age support.",
    includes: ["Infant & toddler care", "First-aid certified", "Educational play & routines", "School runs & homework support"] },
];

export const TRUST_PILLARS = [
  { Icon: ShieldCheck, title: "Verified Candidates", text: "Identity, references and background-checked." },
  { Icon: Users, title: "Trained & Experienced", text: "Skilled professionals with proven Gulf experience." },
  { Icon: HeartPulse, title: "Safe & Trustworthy", text: "Medical fitness & police clearance support." },
  { Icon: Handshake, title: "Personalised Matching", text: "Hand-picked for your family's needs." },
];

export const STEPS = [
  { n: 1, Icon: ClipboardList, title: "Share Your Requirements", text: "Tell us what you need — full-time, live-in, cook, nanny or elderly care." },
  { n: 2, Icon: Users, title: "Get Matched", text: "We shortlist verified candidates based on your preferences." },
  { n: 3, Icon: CalendarCheck, title: "Meet & Choose", text: "Interview in person or online and select the right fit for your home." },
  { n: 4, Icon: BadgeCheck, title: "Start with Confidence", text: "Begin your journey with documentation handled and our ongoing support." },
];

export const STATS = [
  { value: 2400, suffix: "+", label: "Families served" },
  { value: 1800, suffix: "+", label: "Verified candidates" },
  { value: 98, suffix: "%", label: "Placement satisfaction" },
  { value: 6, suffix: "", label: "Cities across UAE & KSA" },
];

export const FAQS = [
  { q: "Do you support visa and sponsorship paperwork?", a: "Yes. For live-in placements we guide you through the Tadbeer (UAE) or Musaned (KSA) process, medical fitness testing, police clearance and contract attestation." },
  { q: "How long does matching take?", a: "Most families receive a curated shortlist within 3–5 working days. Immediate-availability candidates can start within a week of selection." },
  { q: "What if the placement doesn't work out?", a: "Every plan includes a replacement window — 30, 60 or 90 days depending on the plan — during which we find a replacement at no extra cost." },
  { q: "Are candidates interviewed before I meet them?", a: "Every candidate is screened by our team: identity and document verification, reference calls, a skills interview and, for Premium, an in-person assessment." },
  { q: "Which cities do you cover?", a: "Dubai, Abu Dhabi, Sharjah, Riyadh, Jeddah and Dammam, with placements arranged across the wider UAE and Saudi Arabia on request." },
];
