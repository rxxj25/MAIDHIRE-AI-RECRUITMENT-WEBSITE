-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'VERIFIED', 'AVAILABLE', 'HIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IMMEDIATE', 'WITHIN_2_WEEKS', 'WITHIN_1_MONTH', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('AE', 'SA');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'SAR');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'CONTACTED', 'MATCHING', 'INTERVIEWING', 'PLACED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PHOTO', 'PASSPORT', 'VISA', 'MEDICAL', 'POLICE_CLEARANCE', 'CERTIFICATE', 'OTHER');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "currentCountry" "Country" NOT NULL,
    "currentCity" TEXT NOT NULL,
    "primaryService" TEXT NOT NULL,
    "skills" TEXT[],
    "languages" TEXT[],
    "yearsExperience" INTEGER NOT NULL,
    "experienceSummary" TEXT NOT NULL,
    "availability" "Availability" NOT NULL,
    "expectedSalary" INTEGER NOT NULL,
    "salaryCurrency" "Currency" NOT NULL,
    "hasGulfExperience" BOOLEAN NOT NULL DEFAULT false,
    "liveInPreferred" BOOLEAN NOT NULL DEFAULT true,
    "status" "CandidateStatus" NOT NULL DEFAULT 'APPLIED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateDocument" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateReference" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CandidateReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateStatusLog" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fromStatus" "CandidateStatus",
    "toStatus" "CandidateStatus" NOT NULL,
    "note" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HireRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "city" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "planSlug" TEXT,
    "candidateId" TEXT,
    "startDate" TEXT,
    "familySize" INTEGER,
    "preferredNationalities" TEXT[],
    "preferredLanguages" TEXT[],
    "liveIn" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HireRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "service" TEXT,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "priceAed" INTEGER NOT NULL,
    "priceSar" INTEGER NOT NULL,
    "features" TEXT[],
    "footnote" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorLocation" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_slug_key" ON "Candidate"("slug");

-- CreateIndex
CREATE INDEX "Candidate_status_isFeatured_idx" ON "Candidate"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "Candidate_primaryService_currentCity_idx" ON "Candidate"("primaryService", "currentCity");

-- CreateIndex
CREATE INDEX "Candidate_nationality_idx" ON "Candidate"("nationality");

-- CreateIndex
CREATE INDEX "CandidateDocument_candidateId_idx" ON "CandidateDocument"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateStatusLog_candidateId_createdAt_idx" ON "CandidateStatusLog"("candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "HireRequest_status_createdAt_idx" ON "HireRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HireRequest_email_idx" ON "HireRequest"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateReference" ADD CONSTRAINT "CandidateReference_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStatusLog" ADD CONSTRAINT "CandidateStatusLog_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStatusLog" ADD CONSTRAINT "CandidateStatusLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HireRequest" ADD CONSTRAINT "HireRequest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
