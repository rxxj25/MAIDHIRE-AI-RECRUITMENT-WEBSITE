/** Market-specific reference data for the Gulf (UAE + KSA). */

export const COUNTRIES = [
  { code: "AE", name: "United Arab Emirates", dial: "+971", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", currency: "SAR" },
] as const;
export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const CITIES: Record<CountryCode, readonly string[]> = {
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah"],
  SA: ["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah", "Madinah"],
};
export const ALL_CITIES = [...CITIES.AE, ...CITIES.SA] as const;

export const NATIONALITIES = [
  "Filipino",
  "Indonesian",
  "Indian",
  "Sri Lankan",
  "Nepali",
  "Bangladeshi",
  "Ethiopian",
  "Kenyan",
  "Ugandan",
  "Ghanaian",
  "Other",
] as const;

export const SERVICE_TYPES = [
  { slug: "full-time-maid", label: "Full-Time Maid" },
  { slug: "part-time-maid", label: "Part-Time Maid" },
  { slug: "live-in-maid", label: "Live-in Maid" },
  { slug: "cook-chef", label: "Cook / Chef" },
  { slug: "elderly-care", label: "Elderly Care" },
  { slug: "child-care", label: "Baby & Child Care" },
] as const;
export const SERVICE_SLUGS = SERVICE_TYPES.map((s) => s.slug) as [string, ...string[]];

export const LANGUAGES = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Tagalog",
  "Bahasa Indonesia",
  "Sinhala",
  "Tamil",
  "Malayalam",
  "Nepali",
  "Bengali",
  "Amharic",
  "Swahili",
] as const;

export const SKILLS = [
  "Housekeeping",
  "Deep cleaning",
  "Laundry & ironing",
  "Cooking (Arabic)",
  "Cooking (Indian)",
  "Cooking (Continental)",
  "Baking",
  "Infant care",
  "Child care",
  "Elderly care",
  "Special-needs care",
  "Pet care",
  "Driving",
  "First aid",
] as const;

export const CANDIDATE_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "VERIFIED",
  "AVAILABLE",
  "HIRED",
  "INACTIVE",
] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

/** Statuses visible to the public directory. */
export const PUBLIC_CANDIDATE_STATUSES: readonly CandidateStatus[] = ["VERIFIED", "AVAILABLE"];

export const AVAILABILITY = ["IMMEDIATE", "WITHIN_2_WEEKS", "WITHIN_1_MONTH", "FLEXIBLE"] as const;
export const AVAILABILITY_LABELS: Record<(typeof AVAILABILITY)[number], string> = {
  IMMEDIATE: "Immediately",
  WITHIN_2_WEEKS: "Within 2 weeks",
  WITHIN_1_MONTH: "Within 1 month",
  FLEXIBLE: "Flexible",
};

export const REQUEST_STATUSES = ["NEW", "CONTACTED", "MATCHING", "INTERVIEWING", "PLACED", "CLOSED"] as const;
export const MESSAGE_STATUSES = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const;

export const EXPERIENCE_BANDS = [
  { value: "0-1", label: "Under 1 year", min: 0, max: 1 },
  { value: "1-3", label: "1–3 years", min: 1, max: 3 },
  { value: "3-5", label: "3–5 years", min: 3, max: 5 },
  { value: "5+", label: "5+ years", min: 5, max: 99 },
] as const;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
