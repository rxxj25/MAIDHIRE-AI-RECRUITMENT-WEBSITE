import { z } from "zod";
import {
  ALL_CITIES,
  AVAILABILITY,
  CANDIDATE_STATUSES,
  COUNTRIES,
  LANGUAGES,
  MESSAGE_STATUSES,
  NATIONALITIES,
  REQUEST_STATUSES,
  SERVICE_SLUGS,
  SKILLS,
} from "./constants.js";

/* ---------- primitives ---------- */

// Gulf mobile numbers: +971 5X XXX XXXX / +966 5X XXX XXXX, tolerant of spaces and dashes.
export const gulfPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(\+?971|0)?5\d{8}$|^(\+?966|0)?5\d{8}$|^\+\d{8,15}$/, "Enter a valid mobile number (e.g. +971 50 123 4567)"),
  );

export const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
export const personName = z.string().trim().min(2, "Too short").max(80, "Too long");
export const countryCode = z.enum(COUNTRIES.map((c) => c.code) as ["AE", "SA"]);
export const city = z.enum(ALL_CITIES as unknown as [string, ...string[]]);
export const serviceSlug = z.enum(SERVICE_SLUGS);
export const nationality = z.enum(NATIONALITIES);
export const availability = z.enum(AVAILABILITY);
export const candidateStatus = z.enum(CANDIDATE_STATUSES);
export const requestStatus = z.enum(REQUEST_STATUSES);
export const messageStatus = z.enum(MESSAGE_STATUSES);

/** Honeypot: bots fill hidden fields; humans leave them empty. */
const honeypot = z.string().max(0, "Invalid submission").optional();

/* ---------- public forms ---------- */

export const contactMessageSchema = z.object({
  name: personName,
  email,
  phone: gulfPhone,
  service: serviceSlug.optional(),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(500, "Maximum 500 characters"),
  website: honeypot,
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/** The employer/customer "I want to hire" record. No account required. */
export const hireRequestSchema = z.object({
  fullName: personName,
  email,
  phone: gulfPhone,
  country: countryCode,
  city,
  service: serviceSlug,
  planSlug: z.string().trim().max(40).optional(),
  candidateId: z.string().uuid().optional(),
  startDate: z.string().trim().max(40).optional(),
  familySize: z.coerce.number().int().min(1).max(30).optional(),
  preferredNationalities: z.array(nationality).max(5).default([]),
  preferredLanguages: z.array(z.enum(LANGUAGES)).max(5).default([]),
  liveIn: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy policy" }) }),
  website: honeypot,
});
export type HireRequestInput = z.infer<typeof hireRequestSchema>;

/** Candidate self-registration (text part; files are handled as multipart alongside). */
export const candidateApplicationSchema = z.object({
  firstName: personName,
  lastName: personName,
  email: email.optional().or(z.literal("")),
  phone: gulfPhone,
  whatsapp: gulfPhone.optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .refine((d) => {
      const dob = new Date(d);
      if (Number.isNaN(dob.getTime())) return false;
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 21 && age <= 60;
    }, "Candidates must be between 21 and 60 years old"),
  nationality,
  currentCountry: countryCode,
  currentCity: city,
  primaryService: serviceSlug,
  skills: z.array(z.enum(SKILLS)).min(1, "Select at least one skill").max(8),
  languages: z.array(z.enum(LANGUAGES)).min(1, "Select at least one language").max(6),
  yearsExperience: z.coerce.number().int().min(0).max(40),
  experienceSummary: z.string().trim().min(30, "Please describe your experience (30+ characters)").max(1500),
  availability,
  expectedSalary: z.coerce.number().int().min(500).max(20000),
  salaryCurrency: z.enum(["AED", "SAR"]),
  hasGulfExperience: z.boolean().default(false),
  liveInPreferred: z.boolean().default(true),
  references: z
    .array(
      z.object({
        name: personName,
        relation: z.string().trim().min(2).max(60),
        phone: gulfPhone,
      }),
    )
    .max(3)
    .default([]),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the terms" }) }),
  website: honeypot,
});
export type CandidateApplicationInput = z.infer<typeof candidateApplicationSchema>;

/* ---------- public queries ---------- */

export const candidateQuerySchema = z.object({
  service: serviceSlug.optional(),
  city: city.optional(),
  country: countryCode.optional(),
  nationality: nationality.optional(),
  experience: z.enum(["0-1", "1-3", "3-5", "5+"]).optional(),
  availability: availability.optional(),
  q: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
  sort: z.enum(["featured", "experience", "newest"]).default("featured"),
});
export type CandidateQuery = z.infer<typeof candidateQuerySchema>;

/* ---------- guest (family/employer) accounts ---------- */

export const guestSignupSchema = z
  .object({
    name: personName,
    email,
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
export type GuestSignupInput = z.infer<typeof guestSignupSchema>;

export const guestLoginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(128),
});
export type GuestLoginInput = z.infer<typeof guestLoginSchema>;

/* ---------- admin ---------- */

export const adminLoginSchema = z.object({
  email,
  password: z.string().min(8).max(128),
});

export const candidateStatusUpdateSchema = z.object({
  status: candidateStatus,
  note: z.string().trim().max(500).optional(),
});

export const candidateAdminUpdateSchema = z.object({
  firstName: personName.optional(),
  lastName: personName.optional(),
  displayName: z.string().trim().min(2).max(40).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  isFeatured: z.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().int().min(0).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(40).optional(),
  expectedSalary: z.coerce.number().int().min(0).optional(),
  skills: z.array(z.enum(SKILLS)).max(8).optional(),
  languages: z.array(z.enum(LANGUAGES)).max(6).optional(),
  availability: availability.optional(),
  currentCity: city.optional(),
  currentCountry: countryCode.optional(),
});

export const requestStatusUpdateSchema = z.object({
  status: requestStatus,
  adminNotes: z.string().trim().max(2000).optional(),
});

export const messageStatusUpdateSchema = z.object({ status: messageStatus });

export const planUpsertSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().trim().min(2).max(40),
  tagline: z.string().trim().max(80),
  priceAed: z.coerce.number().int().min(0),
  priceSar: z.coerce.number().int().min(0),
  features: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
  footnote: z.string().trim().max(120).optional(),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
