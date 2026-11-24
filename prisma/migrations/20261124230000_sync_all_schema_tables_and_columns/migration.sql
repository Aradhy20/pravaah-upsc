-- Migration: 20261124230000_sync_all_schema_tables_and_columns
-- Safely ensures all missing columns and tables exist across environments

-- 1. UserProfile missing columns
ALTER TABLE "UserProfile" 
ADD COLUMN IF NOT EXISTS "strongSubjects" TEXT,
ADD COLUMN IF NOT EXISTS "weakSubjects" TEXT,
ADD COLUMN IF NOT EXISTS "dailyStudyHours" DOUBLE PRECISION DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS "preparationStage" TEXT DEFAULT 'BEGINNER',
ADD COLUMN IF NOT EXISTS "readinessIndex" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "targetExam" TEXT DEFAULT 'UPSC_CSE';

-- Table QuestionStagingRecord
CREATE TABLE IF NOT EXISTS "QuestionStagingRecord" (
    id text NOT NULL,
    "importJobId" text,
    "sourceReference" text,
    "examCategory" text DEFAULT 'CSE'::text NOT NULL,
    "examStage" text DEFAULT 'PRELIMS'::text NOT NULL,
    year integer NOT NULL,
    "paperCode" text NOT NULL,
    "questionNumber" integer NOT NULL,
    "questionFormat" text DEFAULT 'SINGLE_CHOICE'::text NOT NULL,
    "questionTextEn" text NOT NULL,
    "questionTextHi" text,
    "optionsJson" text NOT NULL,
    "officialAnswer" text,
    "explanationEn" text,
    "explanationHi" text,
    "sourceCitation" text,
    "subjectSlug" text,
    "topicSlug" text,
    difficulty text DEFAULT 'MEDIUM'::text NOT NULL,
    "translationStatus" text DEFAULT 'TRANSLATION_MISSING'::text NOT NULL,
    "validationErrorsJson" text,
    "workflowStatus" text DEFAULT 'IMPORTED'::text NOT NULL,
    "publishedQuestionId" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table UserMistakeClassification
CREATE TABLE IF NOT EXISTS "UserMistakeClassification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "questionId" text NOT NULL,
    "mistakeType" text NOT NULL,
    notes text,
    "revisitedAt" timestamp(3) without time zone,
    "isResolved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table SupportTicket
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    id text NOT NULL,
    "ticketNumber" text NOT NULL,
    "userId" text,
    "fullName" text NOT NULL,
    email text NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL,
    priority text DEFAULT 'NORMAL'::text NOT NULL,
    "sourceIp" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table UserTopicProgress
CREATE TABLE IF NOT EXISTS "UserTopicProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "topicId" text NOT NULL,
    status text DEFAULT 'NOT_STARTED'::text NOT NULL,
    confidence double precision DEFAULT 0.0 NOT NULL,
    notes text,
    "lastStudiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table InterviewQuestion
CREATE TABLE IF NOT EXISTS "InterviewQuestion" (
    id text NOT NULL,
    "questionTextEn" text NOT NULL,
    "questionTextHi" text,
    "contextEn" text,
    "contextHi" text,
    "sourceType" text DEFAULT 'CANDIDATE_REPORTED'::text NOT NULL,
    "sourceAttribution" text,
    year integer,
    topic text NOT NULL,
    tags text,
    "frameworkGuidance" text,
    "frameworkGuidanceHi" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table MapFeature
CREATE TABLE IF NOT EXISTS "MapFeature" (
    id text NOT NULL,
    name text NOT NULL,
    "nameHi" text,
    category text NOT NULL,
    "stateOrCountry" text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "keyFacts" text NOT NULL,
    "keyFactsHi" text,
    "upscReference" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" text NOT NULL,
    "discountValue" double precision NOT NULL,
    "maxRedemptions" integer DEFAULT 100 NOT NULL,
    "currentRedemptions" integer DEFAULT 0 NOT NULL,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validUntil" timestamp(3) without time zone NOT NULL,
    "eligiblePlans" text,
    "minOrderValue" double precision DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table Referral
CREATE TABLE IF NOT EXISTS "Referral" (
    id text NOT NULL,
    "referrerUserId" text NOT NULL,
    "referredUserId" text,
    "referralCode" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "rewardPoints" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table UserPackPurchase
CREATE TABLE IF NOT EXISTS "UserPackPurchase" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "packId" text NOT NULL,
    "purchasePrice" double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "creditsRemaining" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table SpecializedPack
CREATE TABLE IF NOT EXISTS "SpecializedPack" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "nameHi" text,
    tagline text NOT NULL,
    category text NOT NULL,
    "priceRupees" double precision NOT NULL,
    "featuresJson" text NOT NULL,
    "creditsIncluded" integer DEFAULT 0 NOT NULL,
    "validityDays" integer DEFAULT 365 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table UserUsageLedger
CREATE TABLE IF NOT EXISTS "UserUsageLedger" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "periodStart" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "aiMentorMessagesUsed" integer DEFAULT 0 NOT NULL,
    "aiMentorMessagesLimit" integer DEFAULT 0 NOT NULL,
    "mainsEvaluationsUsed" integer DEFAULT 0 NOT NULL,
    "mainsEvaluationsLimit" integer DEFAULT 0 NOT NULL,
    "pyqAttemptsToday" integer DEFAULT 0 NOT NULL,
    "pyqDailyLimit" integer DEFAULT 15 NOT NULL,
    "lastPyqAttemptDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table CouponRedemption
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
    id text NOT NULL,
    "couponId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    "discountAmount" double precision NOT NULL,
    "redeemedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table GeneratedPracticeQuestion
CREATE TABLE IF NOT EXISTS "GeneratedPracticeQuestion" (
    id text NOT NULL,
    "practiceId" text NOT NULL,
    "examFamily" text DEFAULT 'CSE'::text NOT NULL,
    "syllabusSubject" text NOT NULL,
    "syllabusTopic" text,
    difficulty text DEFAULT 'MEDIUM'::text NOT NULL,
    "questionText" text NOT NULL,
    "optionA" text NOT NULL,
    "optionB" text NOT NULL,
    "optionC" text NOT NULL,
    "optionD" text NOT NULL,
    "answerLetter" text NOT NULL,
    explanation text NOT NULL,
    "generationModel" text,
    "generatedAt" text,
    "reviewStatus" text DEFAULT 'UNVERIFIED_PRACTICE'::text NOT NULL,
    "contentLabel" text DEFAULT 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table CorpusIngestionJob
CREATE TABLE IF NOT EXISTS "CorpusIngestionJob" (
    id text NOT NULL,
    "runId" text NOT NULL,
    action text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "finishedAt" timestamp(3) without time zone,
    "recordsSeen" integer DEFAULT 0 NOT NULL,
    "recordsAdded" integer DEFAULT 0 NOT NULL,
    errors integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table CorpusDocument
CREATE TABLE IF NOT EXISTS "CorpusDocument" (
    id text NOT NULL,
    "examId" text,
    "examName" text NOT NULL,
    year integer NOT NULL,
    paper text NOT NULL,
    "documentType" text NOT NULL,
    authority text DEFAULT 'UPSC'::text NOT NULL,
    "sourceUrl" text NOT NULL,
    uploaded text,
    "fileSize" text,
    "verificationStatus" text DEFAULT 'OFFICIAL_REGISTRY_VERIFIED'::text NOT NULL,
    "sourceRef" text,
    "localPath" text,
    "fileHashSha256" text,
    "extractionStatus" text DEFAULT 'NOT_EXTRACTED'::text NOT NULL,
    note text,
    "sourceId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table CorpusSource
CREATE TABLE IF NOT EXISTS "CorpusSource" (
    id text NOT NULL,
    "sourceName" text NOT NULL,
    "sourceKind" text NOT NULL,
    authority text DEFAULT 'UPSC'::text NOT NULL,
    url text NOT NULL,
    "lastChecked" text,
    "observedCount" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table CorpusExam
CREATE TABLE IF NOT EXISTS "CorpusExam" (
    id text NOT NULL,
    "examName" text NOT NULL,
    year integer NOT NULL,
    "examFamily" text NOT NULL,
    "sourceId" text,
    "registryStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Table CorpusDocumentPage
CREATE TABLE IF NOT EXISTS "CorpusDocumentPage" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    "pageNumber" integer NOT NULL,
    "pageText" text NOT NULL,
    "extractionQuality" text DEFAULT 'USABLE_TEXT'::text NOT NULL,
    "characterCount" integer DEFAULT 0 NOT NULL,
    "hasHindi" boolean DEFAULT false NOT NULL,
    "hasEnglish" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "QuestionStagingRecord_paperCode_year_questionNumber_examCat_key" ON "QuestionStagingRecord" USING btree ("paperCode", year, "questionNumber", "examCategory");
CREATE UNIQUE INDEX IF NOT EXISTS "QuestionStagingRecord_paperCode_year_questionNumber_examCategor" ON "QuestionStagingRecord" USING btree ("paperCode", year, "questionNumber", "examCategory");
CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_workflowStatus_idx" ON "QuestionStagingRecord" USING btree ("workflowStatus");
CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_year_paperCode_idx" ON "QuestionStagingRecord" USING btree (year, "paperCode");

CREATE INDEX IF NOT EXISTS "UserMistakeClassification_userId_isResolved_idx" ON "UserMistakeClassification" USING btree ("userId", "isResolved");
CREATE INDEX IF NOT EXISTS "UserMistakeClassification_userId_mistakeType_idx" ON "UserMistakeClassification" USING btree ("userId", "mistakeType");
CREATE INDEX IF NOT EXISTS "UserMistakeClassification_userId_questionId_idx" ON "UserMistakeClassification" USING btree ("userId", "questionId");

CREATE INDEX IF NOT EXISTS "SupportTicket_email_status_idx" ON "SupportTicket" USING btree (email, status);
CREATE INDEX IF NOT EXISTS "SupportTicket_status_createdAt_idx" ON "SupportTicket" USING btree (status, "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "SupportTicket_ticketNumber_key" ON "SupportTicket" USING btree ("ticketNumber");

CREATE INDEX IF NOT EXISTS "UserTopicProgress_userId_status_idx" ON "UserTopicProgress" USING btree ("userId", status);
CREATE UNIQUE INDEX IF NOT EXISTS "UserTopicProgress_userId_topicId_key" ON "UserTopicProgress" USING btree ("userId", "topicId");

CREATE INDEX IF NOT EXISTS "InterviewQuestion_sourceType_topic_idx" ON "InterviewQuestion" USING btree ("sourceType", topic);
CREATE INDEX IF NOT EXISTS "InterviewQuestion_year_idx" ON "InterviewQuestion" USING btree (year);

CREATE INDEX IF NOT EXISTS "MapFeature_category_stateOrCountry_idx" ON "MapFeature" USING btree (category, "stateOrCountry");

CREATE INDEX IF NOT EXISTS "Coupon_code_isActive_idx" ON "Coupon" USING btree (code, "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon" USING btree (code);

CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referralCode_key" ON "Referral" USING btree ("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referredUserId_key" ON "Referral" USING btree ("referredUserId");
CREATE INDEX IF NOT EXISTS "Referral_referrerUserId_status_idx" ON "Referral" USING btree ("referrerUserId", status);

CREATE INDEX IF NOT EXISTS "UserPackPurchase_userId_status_expiresAt_idx" ON "UserPackPurchase" USING btree ("userId", status, "expiresAt");

CREATE INDEX IF NOT EXISTS "SpecializedPack_category_isActive_idx" ON "SpecializedPack" USING btree (category, "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "SpecializedPack_code_key" ON "SpecializedPack" USING btree (code);

CREATE UNIQUE INDEX IF NOT EXISTS "UserUsageLedger_userId_key" ON "UserUsageLedger" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "UserUsageLedger_userId_periodEnd_idx" ON "UserUsageLedger" USING btree ("userId", "periodEnd");

CREATE INDEX IF NOT EXISTS "CouponRedemption_couponId_userId_idx" ON "CouponRedemption" USING btree ("couponId", "userId");

CREATE INDEX IF NOT EXISTS "GeneratedPracticeQuestion_contentLabel_idx" ON "GeneratedPracticeQuestion" USING btree ("contentLabel");
CREATE UNIQUE INDEX IF NOT EXISTS "GeneratedPracticeQuestion_practiceId_key" ON "GeneratedPracticeQuestion" USING btree ("practiceId");
CREATE INDEX IF NOT EXISTS "GeneratedPracticeQuestion_syllabusSubject_difficulty_idx" ON "GeneratedPracticeQuestion" USING btree ("syllabusSubject", difficulty);

CREATE INDEX IF NOT EXISTS "CorpusIngestionJob_action_status_idx" ON "CorpusIngestionJob" USING btree (action, status);
CREATE UNIQUE INDEX IF NOT EXISTS "CorpusIngestionJob_runId_key" ON "CorpusIngestionJob" USING btree ("runId");

CREATE INDEX IF NOT EXISTS "CorpusDocument_examId_documentType_idx" ON "CorpusDocument" USING btree ("examId", "documentType");
CREATE INDEX IF NOT EXISTS "CorpusDocument_extractionStatus_idx" ON "CorpusDocument" USING btree ("extractionStatus");
CREATE INDEX IF NOT EXISTS "CorpusDocument_year_documentType_idx" ON "CorpusDocument" USING btree (year, "documentType");


CREATE INDEX IF NOT EXISTS "CorpusExam_examFamily_year_idx" ON "CorpusExam" USING btree ("examFamily", year);
CREATE INDEX IF NOT EXISTS "CorpusExam_year_idx" ON "CorpusExam" USING btree (year);

CREATE INDEX IF NOT EXISTS "CorpusDocumentPage_documentId_idx" ON "CorpusDocumentPage" USING btree ("documentId");
CREATE UNIQUE INDEX IF NOT EXISTS "CorpusDocumentPage_documentId_pageNumber_key" ON "CorpusDocumentPage" USING btree ("documentId", "pageNumber");

