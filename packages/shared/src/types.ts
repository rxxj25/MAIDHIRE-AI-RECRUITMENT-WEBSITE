/** API response shapes shared with the frontend. */

export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string> };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PublicCandidate {
  id: string;
  slug: string;
  displayName: string;
  headline: string | null;
  primaryService: string;
  nationality: string;
  currentCity: string;
  currentCountry: "AE" | "SA";
  yearsExperience: number;
  languages: string[];
  skills: string[];
  availability: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  photoUrl: string | null;
}

export interface PublicCandidateDetail extends PublicCandidate {
  bio: string | null;
  experienceSummary: string;
  hasGulfExperience: boolean;
  liveInPreferred: boolean;
  expectedSalary: number;
  salaryCurrency: "AED" | "SAR";
}

export interface PublicPlan {
  slug: string;
  name: string;
  tagline: string;
  priceAed: number;
  priceSar: number;
  features: string[];
  footnote: string | null;
  isPopular: boolean;
}

export interface PublicTestimonial {
  id: string;
  authorName: string;
  authorLocation: string;
  quote: string;
  rating: number;
}

export interface AdminStats {
  candidates: { total: number; byStatus: Record<string, number> };
  requests: { total: number; new: number; last30Days: number; byStatus: Record<string, number> };
  messages: { total: number; unread: number };
  hires: { total: number };
  /** % change vs the preceding 30-day period; null when there's no prior-period data to compare against. */
  deltas: { requests30d: number | null; candidates30d: number | null; messages30d: number | null; hires30d: number | null };
  /** Daily hire-request counts for the last 30 days, oldest first — slice the tail for a shorter window. */
  trend: { date: string; count: number }[];
  /** Requests currently being matched or interviewed, most recently updated first. */
  interviewPipeline: { id: string; fullName: string; service: string; city: string; status: string; startDate: string | null }[];
}
