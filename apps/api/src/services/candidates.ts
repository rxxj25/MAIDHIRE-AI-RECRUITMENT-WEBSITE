import type { Prisma } from "@prisma/client";
import { EXPERIENCE_BANDS, PUBLIC_CANDIDATE_STATUSES, type CandidateQuery, type PublicCandidate, type PublicCandidateDetail } from "@maidhire/shared";
import { prisma } from "../lib/prisma.js";
import { paginate } from "../lib/util.js";

type CandidateRow = Prisma.CandidateGetPayload<Record<string, never>>;

export function toPublic(c: CandidateRow): PublicCandidate {
  return {
    id: c.id,
    slug: c.slug,
    displayName: c.displayName,
    headline: c.headline,
    primaryService: c.primaryService,
    nationality: c.nationality,
    currentCity: c.currentCity,
    currentCountry: c.currentCountry,
    yearsExperience: c.yearsExperience,
    languages: c.languages,
    skills: c.skills,
    availability: c.availability,
    rating: Number(c.rating),
    reviewCount: c.reviewCount,
    isFeatured: c.isFeatured,
    isVerified: c.status === "VERIFIED" || c.status === "AVAILABLE" || c.status === "HIRED",
    photoUrl: c.photoUrl,
  };
}

export function toPublicDetail(c: CandidateRow): PublicCandidateDetail {
  return {
    ...toPublic(c),
    bio: c.bio,
    experienceSummary: c.experienceSummary,
    hasGulfExperience: c.hasGulfExperience,
    liveInPreferred: c.liveInPreferred,
    expectedSalary: c.expectedSalary,
    salaryCurrency: c.salaryCurrency,
  };
}

export async function searchPublic(q: CandidateQuery) {
  const where: Prisma.CandidateWhereInput = {
    status: { in: [...PUBLIC_CANDIDATE_STATUSES] },
    ...(q.service ? { primaryService: q.service } : {}),
    ...(q.city ? { currentCity: q.city } : {}),
    ...(q.country ? { currentCountry: q.country } : {}),
    ...(q.nationality ? { nationality: q.nationality } : {}),
    ...(q.availability ? { availability: q.availability } : {}),
  };
  if (q.experience) {
    const band = EXPERIENCE_BANDS.find((b) => b.value === q.experience)!;
    where.yearsExperience = { gte: band.min, ...(band.max < 99 ? { lt: band.max } : {}) };
  }
  if (q.q) {
    where.OR = [
      { displayName: { contains: q.q, mode: "insensitive" } },
      { headline: { contains: q.q, mode: "insensitive" } },
      { skills: { hasSome: [q.q] } },
    ];
  }
  const orderBy: Prisma.CandidateOrderByWithRelationInput[] =
    q.sort === "experience"
      ? [{ yearsExperience: "desc" }]
      : q.sort === "newest"
        ? [{ createdAt: "desc" }]
        : [{ isFeatured: "desc" }, { rating: "desc" }, { reviewCount: "desc" }];

  const [items, total] = await prisma.$transaction([
    prisma.candidate.findMany({ where, orderBy, ...paginate(q.page, q.pageSize) }),
    prisma.candidate.count({ where }),
  ]);
  return {
    items: items.map(toPublic),
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}
