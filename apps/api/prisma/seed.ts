/* Seeds an admin user, plans, testimonials and a set of sample candidates.
 * Safe to re-run: upserts by natural keys. Set SEED_CANDIDATES=false to skip sample candidates. */
import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import argon2 from "argon2";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@maidhire.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe!2026";
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.adminUser.upsert({ where: { email }, create: { email, passwordHash, name: "MaidHire Admin" }, update: {} });
  console.log(`✓ admin ${email}`);
}

async function seedPlans() {
  const plans: Prisma.PlanCreateInput[] = [
    {
      slug: "basic", name: "Basic", tagline: "Short-Term Support", priceAed: 4999, priceSar: 5099, sortOrder: 1,
      features: ["Access to verified candidates", "Basic screening", "30 days replacement support", "Email & chat support"],
      footnote: "Great for short-term or occasional needs.",
    },
    {
      slug: "standard", name: "Standard", tagline: "Long-Term Support", priceAed: 7999, priceSar: 8199, sortOrder: 2, isPopular: true,
      features: ["Access to verified candidates", "Detailed background check", "Personalised matching", "60 days replacement support", "Priority customer support"],
      footnote: "Ideal for families seeking reliable, long-term help.",
    },
    {
      slug: "premium", name: "Premium", tagline: "Complete Peace of Mind", priceAed: 12999, priceSar: 13299, sortOrder: 3,
      features: ["Access to verified candidates", "Police clearance & medical fitness", "Visa & documentation assistance", "Personalised matching", "90 days replacement support", "Dedicated account manager"],
      footnote: "For complete safety, comfort, and peace of mind.",
    },
  ];
  for (const p of plans) await prisma.plan.upsert({ where: { slug: p.slug }, create: p, update: p });
  console.log("✓ plans");
}

async function seedTestimonials() {
  if ((await prisma.testimonial.count()) > 0) return;
  await prisma.testimonial.createMany({
    data: [
      { authorName: "Mariam A.", authorLocation: "Jumeirah, Dubai", rating: 5, sortOrder: 1, quote: "MaidHire understood exactly what our family needed. Our nanny was matched within a week, fully verified, and has become part of the household." },
      { authorName: "Khalid R.", authorLocation: "Al Olaya, Riyadh", rating: 5, sortOrder: 2, quote: "Transparent process from start to finish. The team handled the paperwork and kept us informed at every step." },
      { authorName: "Sophie L.", authorLocation: "Saadiyat Island, Abu Dhabi", rating: 5, sortOrder: 3, quote: "We had tried two agencies before. The difference here is the quality of screening — every candidate we met was genuinely experienced." },
      { authorName: "Fatima H.", authorLocation: "Al Hamra, Jeddah", rating: 5, sortOrder: 4, quote: "The elderly caregiver they found for my mother is patient, skilled and kind. I finally have peace of mind." },
    ],
  });
  console.log("✓ testimonials");
}

type Seed = Omit<Prisma.CandidateCreateInput, "slug" | "displayName" | "dateOfBirth"> & { slug: string; dob: string; photo?: string };

const candidates: Seed[] = [
  { slug: "maria-d-a1f2c3", firstName: "Maria", lastName: "Dela Cruz", dob: "1991-04-12", nationality: "Filipino", currentCountry: "AE", currentCity: "Dubai", primaryService: "child-care", headline: "Nanny & infant-care specialist, 7 yrs in the UAE", bio: "Maria has cared for newborns and toddlers in three Dubai households. Trained in infant first aid and gentle sleep routines; families describe her as calm, warm and meticulous.", skills: ["Infant care", "Child care", "First aid", "Housekeeping"], languages: ["English", "Tagalog", "Arabic"], yearsExperience: 7, experienceSummary: "7 years as a live-in nanny for families in Jumeirah and Arabian Ranches. Experience with twins, newborn routines, school runs and homework support.", availability: "IMMEDIATE", expectedSalary: 3200, salaryCurrency: "AED", hasGulfExperience: true, status: "AVAILABLE", isFeatured: true, rating: 4.9, reviewCount: 41, phone: "+971501234001", photo: "maria.webp" },
  { slug: "sri-w-b2e4d1", firstName: "Sri", lastName: "Wahyuni", dob: "1989-09-03", nationality: "Indonesian", currentCountry: "SA", currentCity: "Riyadh", primaryService: "full-time-maid", headline: "Full-time housekeeper, detail-oriented, 9 yrs experience", bio: "Sri manages large villas with confidence — deep cleaning, laundry, ironing and daily routines. Known for reliability and discretion.", skills: ["Housekeeping", "Deep cleaning", "Laundry & ironing", "Cooking (Arabic)"], languages: ["Bahasa Indonesia", "Arabic", "English"], yearsExperience: 9, experienceSummary: "9 years in Riyadh and Jeddah households, including 5 years with one family. Comfortable with villa upkeep, guest preparation and Arabic home cooking.", availability: "WITHIN_2_WEEKS", expectedSalary: 2400, salaryCurrency: "SAR", hasGulfExperience: true, status: "AVAILABLE", isFeatured: true, rating: 4.8, reviewCount: 36, phone: "+966501234002", photo: "sri.webp" },
  { slug: "anjali-m-c3d5e2", firstName: "Anjali", lastName: "Menon", dob: "1990-01-22", nationality: "Indian", currentCountry: "AE", currentCity: "Abu Dhabi", primaryService: "cook-chef", headline: "Home chef — Indian, Arabic & continental cuisine", bio: "Anjali plans weekly menus, shops smartly and cooks healthy family meals. Experienced with dietary requirements and large family gatherings.", skills: ["Cooking (Indian)", "Cooking (Arabic)", "Cooking (Continental)", "Baking"], languages: ["English", "Hindi", "Malayalam", "Arabic"], yearsExperience: 6, experienceSummary: "6 years as a family cook in Abu Dhabi. Expert in South Indian, North Indian and Levantine dishes; comfortable with diabetic and low-sodium menus.", availability: "IMMEDIATE", expectedSalary: 3500, salaryCurrency: "AED", hasGulfExperience: true, status: "AVAILABLE", isFeatured: true, rating: 4.9, reviewCount: 28, phone: "+971501234003", photo: "anjali.webp" },
  { slug: "kumari-p-d4f6a3", firstName: "Kumari", lastName: "Perera", dob: "1985-06-15", nationality: "Sri Lankan", currentCountry: "SA", currentCity: "Jeddah", primaryService: "elderly-care", headline: "Compassionate elderly caregiver with nursing-assistant training", bio: "Kumari supports seniors with mobility, medication reminders and companionship. Patient, respectful and trained in basic nursing care.", skills: ["Elderly care", "Special-needs care", "First aid", "Housekeeping"], languages: ["Sinhala", "English", "Arabic"], yearsExperience: 11, experienceSummary: "11 years of caregiving, including 4 years with a post-stroke patient in Jeddah. Certified nursing assistant (Sri Lanka).", availability: "WITHIN_1_MONTH", expectedSalary: 2600, salaryCurrency: "SAR", hasGulfExperience: true, status: "VERIFIED", isFeatured: true, rating: 4.8, reviewCount: 52, phone: "+966501234004", photo: "kumari.webp" },
  { slug: "tigist-b-e5a7b4", firstName: "Tigist", lastName: "Bekele", dob: "1994-11-08", nationality: "Ethiopian", currentCountry: "AE", currentCity: "Sharjah", primaryService: "live-in-maid", headline: "Live-in maid, energetic and quick to learn", bio: "Tigist keeps homes spotless and organised. Great with pets and happy to support with light cooking.", skills: ["Housekeeping", "Laundry & ironing", "Pet care", "Deep cleaning"], languages: ["Amharic", "English", "Arabic"], yearsExperience: 4, experienceSummary: "4 years as a live-in maid in Sharjah and Dubai. Reliable with daily routines, laundry care for delicate garments and pet feeding.", availability: "IMMEDIATE", expectedSalary: 2200, salaryCurrency: "AED", hasGulfExperience: true, status: "AVAILABLE", rating: 4.7, reviewCount: 19, phone: "+971501234005", photo: "tigist.webp" },
  { slug: "grace-o-f6b8c5", firstName: "Grace", lastName: "Otieno", dob: "1992-03-30", nationality: "Kenyan", currentCountry: "SA", currentCity: "Dammam", primaryService: "child-care", headline: "Early-years nanny with Montessori background", bio: "Grace brings structure and play to children's days — reading, crafts and outdoor time. Formerly a pre-school assistant in Nairobi.", skills: ["Child care", "Infant care", "First aid", "Cooking (Continental)"], languages: ["English", "Swahili"], yearsExperience: 5, experienceSummary: "5 years: 2 years as a pre-school assistant and 3 years as a family nanny in Dammam for children aged 1–6.", availability: "WITHIN_2_WEEKS", expectedSalary: 2500, salaryCurrency: "SAR", hasGulfExperience: true, status: "AVAILABLE", rating: 4.8, reviewCount: 23, phone: "+966501234006", photo: "grace.webp" },
  { slug: "sunita-t-a7c9d6", firstName: "Sunita", lastName: "Tamang", dob: "1988-08-19", nationality: "Nepali", currentCountry: "AE", currentCity: "Dubai", primaryService: "part-time-maid", headline: "Part-time housekeeping, flexible hours across Dubai", bio: "Sunita offers dependable part-time support — ideal for apartments and busy professionals. Thorough, punctual and self-directed.", skills: ["Housekeeping", "Deep cleaning", "Laundry & ironing"], languages: ["Nepali", "Hindi", "English"], yearsExperience: 6, experienceSummary: "6 years of part-time and full-time housekeeping in Dubai Marina and Downtown apartments.", availability: "FLEXIBLE", expectedSalary: 2000, salaryCurrency: "AED", hasGulfExperience: true, status: "AVAILABLE", rating: 4.6, reviewCount: 31, phone: "+971501234007", photo: "sunita.webp" },
  { slug: "rowena-s-b8d0e7", firstName: "Rowena", lastName: "Santos", dob: "1987-12-02", nationality: "Filipino", currentCountry: "SA", currentCity: "Riyadh", primaryService: "live-in-maid", headline: "Experienced live-in maid and family cook", bio: "Rowena combines housekeeping with excellent home cooking. Long-term placements with glowing references.", skills: ["Housekeeping", "Cooking (Continental)", "Cooking (Arabic)", "Laundry & ironing"], languages: ["Tagalog", "English", "Arabic"], yearsExperience: 10, experienceSummary: "10 years across two long-term placements in Riyadh. Manages full household routines, meal preparation and guest hosting.", availability: "WITHIN_1_MONTH", expectedSalary: 2700, salaryCurrency: "SAR", hasGulfExperience: true, status: "VERIFIED", rating: 4.9, reviewCount: 44, phone: "+966501234008", photo: "rowena.webp" },
  // Pipeline examples for the admin dashboard
  { slug: "dewi-l-c9e1f8", firstName: "Dewi", lastName: "Lestari", dob: "1996-05-11", nationality: "Indonesian", currentCountry: "AE", currentCity: "Dubai", primaryService: "full-time-maid", skills: ["Housekeeping", "Laundry & ironing"], languages: ["Bahasa Indonesia", "English"], yearsExperience: 2, experienceSummary: "2 years of housekeeping in Jakarta; seeking first Gulf placement.", availability: "IMMEDIATE", expectedSalary: 2000, salaryCurrency: "AED", status: "SCREENING", phone: "+971501234009" },
  { slug: "asha-k-d0f2a9", firstName: "Asha", lastName: "Kimani", dob: "1993-10-25", nationality: "Kenyan", currentCountry: "SA", currentCity: "Riyadh", primaryService: "elderly-care", skills: ["Elderly care", "First aid"], languages: ["English", "Swahili"], yearsExperience: 3, experienceSummary: "3 years of home care for seniors in Nairobi.", availability: "WITHIN_1_MONTH", expectedSalary: 2300, salaryCurrency: "SAR", status: "APPLIED", phone: "+966501234010" },
];

async function seedCandidates() {
  if (process.env.SEED_CANDIDATES === "false") return;
  for (const c of candidates) {
    const { dob, photo, ...rest } = c;
    // Seed photos are served as static assets from apps/web/public/images/candidates
    // (copied 1:1 from seed-assets) rather than through the storage service: on Vercel,
    // STORAGE_DRIVER=local writes to the build container's disk, which doesn't survive
    // into the runtime function, so uploaded-looking seed photos would 404 in production.
    const photoUrl = photo ? `/images/candidates/${photo}` : null;
    const data = { ...rest, dateOfBirth: new Date(dob), displayName: `${c.firstName} ${c.lastName.charAt(0)}.`, ...(photoUrl ? { photoUrl } : {}) };
    await prisma.candidate.upsert({
      where: { slug: c.slug },
      create: { ...data, statusLogs: { create: { toStatus: rest.status ?? "APPLIED", note: "Seeded" } } },
      update: data,
    });
  }
  console.log(`✓ ${candidates.length} candidates`);
}

await seedAdmin();
await seedPlans();
await seedTestimonials();
await seedCandidates();
await prisma.$disconnect();
