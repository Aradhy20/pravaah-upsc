-- Migration: 20261124000000_add_question_format_and_corpus_metadata
-- Safe, idempotent column additions for Question and related models

-- 1. AlterTable "Question"
ALTER TABLE "Question" 
ADD COLUMN IF NOT EXISTS "questionFormat" TEXT DEFAULT 'SINGLE_CHOICE',
ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING',
ADD COLUMN IF NOT EXISTS "examStage" TEXT DEFAULT 'PRELIMS',
ADD COLUMN IF NOT EXISTS "sourceReference" TEXT,
ADD COLUMN IF NOT EXISTS "bookletSeries" TEXT,
ADD COLUMN IF NOT EXISTS "contentLabel" TEXT DEFAULT 'OFFICIAL_UPSC_PYQ',
ADD COLUMN IF NOT EXISTS "corpusDocumentId" TEXT;

-- 2. AlterTable "QuestionOption"
ALTER TABLE "QuestionOption" 
ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING';

-- 3. AlterTable "Explanation"
ALTER TABLE "Explanation" 
ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'ORIGINAL_SOURCE';

-- 4. AlterTable "MainsQuestion"
ALTER TABLE "MainsQuestion" 
ADD COLUMN IF NOT EXISTS "questionTextHi" TEXT,
ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING',
ADD COLUMN IF NOT EXISTS "sourceReference" TEXT;

-- 5. CreateTable "QuestionStagingRecord" if not exists
CREATE TABLE IF NOT EXISTS "QuestionStagingRecord" (
    "id" TEXT NOT NULL,
    "examCategory" TEXT NOT NULL DEFAULT 'CSE',
    "year" INTEGER NOT NULL,
    "paperCode" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionFormat" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
    "questionTextEn" TEXT NOT NULL,
    "questionTextHi" TEXT,
    "optionsJson" TEXT NOT NULL,
    "officialAnswer" TEXT,
    "explanationEn" TEXT,
    "explanationHi" TEXT,
    "sourceCitation" TEXT,
    "subjectSlug" TEXT,
    "topicSlug" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "translationStatus" TEXT NOT NULL DEFAULT 'TRANSLATION_MISSING',
    "validationErrorsJson" TEXT,
    "workflowStatus" TEXT NOT NULL DEFAULT 'IMPORTED',
    "publishedQuestionId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionStagingRecord_pkey" PRIMARY KEY ("id")
);

-- 6. Indices for QuestionStagingRecord
CREATE UNIQUE INDEX IF NOT EXISTS "QuestionStagingRecord_paperCode_year_questionNumber_examCategory_key" 
ON "QuestionStagingRecord"("paperCode", "year", "questionNumber", "examCategory");

CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_workflowStatus_idx" 
ON "QuestionStagingRecord"("workflowStatus");

CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_year_paperCode_idx" 
ON "QuestionStagingRecord"("year", "paperCode");

-- 7. Backfill translationStatus on Question if empty
UPDATE "Question"
SET "translationStatus" = CASE 
  WHEN "questionTextHi" IS NOT NULL AND length(trim("questionTextHi")) > 0 THEN 'HUMAN_VERIFIED'
  ELSE 'TRANSLATION_MISSING'
END
WHERE "translationStatus" IS NULL OR "translationStatus" = 'TRANSLATION_MISSING';
