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
  requests: { total: number; new: number; last30Days: number };
  messages: { total: number; unread: number };
}
