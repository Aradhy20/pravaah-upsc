-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "googleId" TEXT,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetYear" INTEGER DEFAULT 2027,
    "targetExam" TEXT DEFAULT 'UPSC_CSE',
    "optionalSubject" TEXT,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 60,
    "dailyStudyHours" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "weakSubjects" TEXT,
    "preparationStage" TEXT DEFAULT 'BEGINNER',
    "readinessIndex" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamStage" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 100,
    "totalMarks" INTEGER NOT NULL DEFAULT 200,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "positiveMark" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "negativeMark" DOUBLE PRECISION NOT NULL DEFAULT 0.666,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusNode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "paperCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "recordId" TEXT,
    "questionGroupId" TEXT,
    "examId" TEXT,
    "examYearId" TEXT,
    "stageId" TEXT,
    "paperId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MCQ',
    "questionText" TEXT NOT NULL,
    "questionTextEn" TEXT,
    "questionTextHi" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "difficultyLevel" TEXT DEFAULT 'MEDIUM',
    "subjectId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "marks" DOUBLE PRECISION DEFAULT 2.0,
    "negativeMarks" DOUBLE PRECISION DEFAULT 0.666,
    "sourceId" TEXT,
    "sourcePage" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "isStatic" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "verifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'OFFICIALLY_VERIFIED',
    "examCategory" TEXT NOT NULL DEFAULT 'CSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionCode" TEXT NOT NULL,
    "optionLabel" TEXT,
    "optionText" TEXT NOT NULL,
    "optionTextEn" TEXT,
    "optionTextHi" TEXT,
    "optionOrder" INTEGER NOT NULL DEFAULT 1,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedExplanation" TEXT NOT NULL,
    "eliminationTechnique" TEXT,
    "sourceCitation" TEXT,
    "relatedConcept" TEXT,
    "explanationEn" TEXT,
    "explanationHi" TEXT,
    "explanationSource" TEXT,
    "explanationType" TEXT DEFAULT 'PEDAGOGICAL',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerOption" TEXT NOT NULL,
    "answerType" TEXT NOT NULL DEFAULT 'FINAL',
    "answerKeyType" TEXT NOT NULL DEFAULT 'UPSC_FINAL_KEY',
    "answerProvenance" TEXT NOT NULL DEFAULT 'UPSC_OFFICIAL_FINAL',
    "verificationStatus" TEXT NOT NULL DEFAULT 'OFFICIALLY_VERIFIED',
    "sourceId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerKeyVersion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "officialAnswer" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'UPSC_OFFICIAL_FINAL',
    "sourceReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerKeyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTopic" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "QuestionTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fileHash" TEXT,
    "paperCode" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSource" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "QuestionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isFullPaper" BOOLEAN NOT NULL DEFAULT true,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "totalTimeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "attemptedCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "unattemptedCount" INTEGER NOT NULL DEFAULT 0,
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "netScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'LEARN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT,
    "selectedCode" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isMarkedReview" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "folderTag" TEXT DEFAULT 'Default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "repetitionCount" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "targetDate" TIMESTAMP(3),
    "targetHours" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "refId" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentImportJob" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "paperYear" INTEGER NOT NULL,
    "paperCode" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorReportJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detailsJson" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPrice" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "billingInterval" TEXT NOT NULL,
    "amountRupees" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureCode" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "isIncluded" BOOLEAN NOT NULL DEFAULT true,
    "limitValue" INTEGER,
    "tooltip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureEntitlement" (
    "id" TEXT NOT NULL,
    "featureCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minTier" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "billingInterval" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "providerSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'SANDBOX',
    "providerTxId" TEXT,
    "idempotencyKey" TEXT,
    "paymentMethod" TEXT,
    "receiptNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRecord" (
    "id" TEXT NOT NULL,
    "paymentRecordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "providerRefundId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" TEXT NOT NULL,
    "clientOrderId" TEXT NOT NULL,
    "gatewayOrderId" TEXT,
    "userId" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'SUBSCRIPTION',
    "productId" TEXT,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "isTest" BOOLEAN NOT NULL DEFAULT true,
    "paymentUrl" TEXT,
    "upiIntent" TEXT,
    "utr" TEXT,
    "metadataJson" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventSequence" INTEGER,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "paymentOrderId" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "signature" TEXT,
    "rawPayload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "errorDetails" TEXT,
    "occurredAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentAffairsStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importancePrelims" TEXT,
    "importanceMains" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "termsList" TEXT,
    "prelimsFodder" TEXT,
    "mainsFodder" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrentAffairsStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTopic" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "syllabusPaper" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryQuestionLink" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "relationshipRationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryQuestionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuiz" (
    "id" TEXT NOT NULL,
    "quizDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuizQuestion" (
    "id" TEXT NOT NULL,
    "dailyQuizId" TEXT NOT NULL,
    "storyId" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctOption" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyQuizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "accuracyPercent" DOUBLE PRECISION NOT NULL,
    "answersJson" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamDirectory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conductingBody" TEXT NOT NULL DEFAULT 'UPSC',
    "category" TEXT NOT NULL DEFAULT 'Civil Services',
    "overview" TEXT NOT NULL,
    "eligibilityQualifications" TEXT NOT NULL,
    "ageLimit" TEXT NOT NULL,
    "attemptsAllowed" TEXT NOT NULL,
    "stagesDescription" TEXT NOT NULL,
    "officialNotificationUrl" TEXT NOT NULL,
    "syllabusOverview" TEXT NOT NULL,
    "examCycleDates" TEXT,
    "totalVacanciesTypical" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainsQuestion" (
    "id" TEXT NOT NULL,
    "paperCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 10,
    "wordLimit" INTEGER NOT NULL DEFAULT 150,
    "theme" TEXT NOT NULL,
    "frameworkGuidance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MainsQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainsDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mainsQuestionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "selfEvaluationScore" DOUBLE PRECISION,
    "selfEvaluationNotes" TEXT,
    "aiFeedbackJson" TEXT,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MainsDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "summary" TEXT,
    "errorDetails" TEXT,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRegistryRecord" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "canonicalDomain" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "collectionMethod" TEXT NOT NULL,
    "termsUrl" TEXT,
    "robotsStatus" TEXT NOT NULL DEFAULT 'ALLOWED',
    "lastStatusCode" INTEGER NOT NULL DEFAULT 200,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSuccessAt" TIMESTAMP(3),
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceRegistryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NCERTBook" (
    "id" TEXT NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "medium" TEXT NOT NULL DEFAULT 'English',
    "coverUrl" TEXT,
    "officialPortalUrl" TEXT NOT NULL,
    "copyrightNotice" TEXT NOT NULL DEFAULT 'Copyright © National Council of Educational Research and Training (NCERT), New Delhi. Links provided for educational navigation under fair dealing.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NCERTBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NCERTChapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "chapterTitle" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "officialPdfUrl" TEXT NOT NULL,
    "keyTopics" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NCERTChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NCERTChapterQuestionLink" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "relevanceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NCERTChapterQuestionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalExamPeriod" (
    "id" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "patternDescription" TEXT NOT NULL,
    "qualifyingRules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalExamPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractionJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "targetSource" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "paperCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "extractedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "errorLog" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExtractionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataQualityReport" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "totalAudited" INTEGER NOT NULL DEFAULT 0,
    "duplicatesFound" INTEGER NOT NULL DEFAULT 0,
    "missingOptionsFound" INTEGER NOT NULL DEFAULT 0,
    "ocrConfidenceAvg" DOUBLE PRECISION NOT NULL DEFAULT 0.98,
    "issuesSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataQualityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamYear" (
    "id" TEXT NOT NULL,
    "examFamily" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "paperOrStage" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English/Hindi',
    "officialSourceUrl" TEXT,
    "downloadStatus" TEXT NOT NULL DEFAULT 'NOT_HARVESTED',
    "verificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "subtopicName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusTopic" (
    "id" TEXT NOT NULL,
    "examId" TEXT,
    "paperId" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "syllabusVersion" TEXT NOT NULL DEFAULT '2024-2026',
    "syllabusText" TEXT NOT NULL,
    "officialSourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSyllabusMapping" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "syllabusTopicId" TEXT NOT NULL,
    "mappingType" TEXT NOT NULL DEFAULT 'PRIMARY',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "mappingMethod" TEXT NOT NULL DEFAULT 'MANUAL_VERIFIED',
    "reviewedStatus" TEXT NOT NULL DEFAULT 'REVIEWED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionSyllabusMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "rightsStatus" TEXT NOT NULL DEFAULT 'PUBLIC_DOMAIN',
    "accessStatus" TEXT NOT NULL DEFAULT 'ACCESSIBLE',
    "reliabilityLevel" TEXT NOT NULL DEFAULT 'PRIMARY_OFFICIAL',
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRecord" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalRecordId" TEXT,
    "originalUrl" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "sourcePage" TEXT,
    "extractionStatus" TEXT NOT NULL DEFAULT 'DISCOVERED',
    "checksum" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCitation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "pageNumber" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'OFFICIAL_GAZETTE',
    "citationText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionJobAudit" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalDiscovered" INTEGER NOT NULL DEFAULT 0,
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "totalExtracted" INTEGER NOT NULL DEFAULT 0,
    "totalVerified" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionJobAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleHi" TEXT,
    "description" TEXT,
    "descriptionHi" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "paperCode" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "facultyName" TEXT DEFAULT 'Pravaah Senior Faculty',
    "thumbnailUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoLessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopperCopy" (
    "id" TEXT NOT NULL,
    "topperName" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'UPSC_CSE',
    "paperCode" TEXT NOT NULL,
    "optionalSubject" TEXT,
    "title" TEXT NOT NULL,
    "titleHi" TEXT,
    "description" TEXT,
    "pdfUrl" TEXT,
    "sampleAnswerUrl" TEXT,
    "keyTakeaways" TEXT,
    "scoreMarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopperCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_code_key" ON "Exam"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Paper_code_key" ON "Paper"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusNode_code_key" ON "SyllabusNode"("code");

-- CreateIndex
CREATE INDEX "Question_year_paperId_status_idx" ON "Question"("year", "paperId", "status");

-- CreateIndex
CREATE INDEX "Question_questionGroupId_idx" ON "Question"("questionGroupId");

-- CreateIndex
CREATE INDEX "Question_examCategory_year_idx" ON "Question"("examCategory", "year");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Question_paperId_year_questionNumber_key" ON "Question"("paperId", "year", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_optionCode_key" ON "QuestionOption"("questionId", "optionCode");

-- CreateIndex
CREATE UNIQUE INDEX "Explanation_questionId_key" ON "Explanation"("questionId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_questionId_idx" ON "QuestionAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_answerKeyType_idx" ON "QuestionAnswer"("answerKeyType");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTopic_questionId_topicId_key" ON "QuestionTopic"("questionId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_questionId_key" ON "TestQuestion"("testId", "questionId");

-- CreateIndex
CREATE INDEX "UserAttempt_userId_createdAt_idx" ON "UserAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserResponse_sessionId_idx" ON "UserResponse"("sessionId");

-- CreateIndex
CREATE INDEX "UserResponse_userId_idx" ON "UserResponse"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_folderTag_idx" ON "Bookmark"("userId", "folderTag");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_questionId_key" ON "Bookmark"("userId", "questionId");

-- CreateIndex
CREATE INDEX "UserNote_userId_idx" ON "UserNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNote_userId_questionId_key" ON "UserNote"("userId", "questionId");

-- CreateIndex
CREATE INDEX "ReviewSchedule_userId_isResolved_nextReviewDate_idx" ON "ReviewSchedule"("userId", "isResolved", "nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_userId_questionId_key" ON "ReviewSchedule"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_billingInterval_key" ON "PlanPrice"("planId", "billingInterval");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureCode_key" ON "PlanFeature"("planId", "featureCode");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureEntitlement_featureCode_key" ON "FeatureEntitlement"("featureCode");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_currentPeriodEnd_idx" ON "Subscription"("userId", "status", "currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_providerTxId_key" ON "PaymentRecord"("providerTxId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_idempotencyKey_key" ON "PaymentRecord"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_clientOrderId_key" ON "PaymentOrder"("clientOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_gatewayOrderId_key" ON "PaymentOrder"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "PaymentOrder_userId_status_idx" ON "PaymentOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "PaymentOrder_status_createdAt_idx" ON "PaymentOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentOrder_gatewayOrderId_idx" ON "PaymentOrder"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "PaymentOrder_clientOrderId_idx" ON "PaymentOrder"("clientOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhookEvent_eventId_key" ON "PaymentWebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_orderId_eventType_idx" ON "PaymentWebhookEvent"("orderId", "eventType");

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_eventId_idx" ON "PaymentWebhookEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentAffairsStory_slug_key" ON "CurrentAffairsStory"("slug");

-- CreateIndex
CREATE INDEX "CurrentAffairsStory_status_publishedAt_idx" ON "CurrentAffairsStory"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoryQuestionLink_storyId_questionId_key" ON "StoryQuestionLink"("storyId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuiz_quizDate_key" ON "DailyQuiz"("quizDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuizAttempt_userId_dailyQuizId_key" ON "DailyQuizAttempt"("userId", "dailyQuizId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamDirectory_code_key" ON "ExamDirectory"("code");

-- CreateIndex
CREATE INDEX "MainsQuestion_paperCode_year_idx" ON "MainsQuestion"("paperCode", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MainsQuestion_paperCode_year_questionNumber_key" ON "MainsQuestion"("paperCode", "year", "questionNumber");

-- CreateIndex
CREATE INDEX "MainsDraft_userId_isSubmitted_idx" ON "MainsDraft"("userId", "isSubmitted");

-- CreateIndex
CREATE UNIQUE INDEX "MainsDraft_userId_mainsQuestionId_key" ON "MainsDraft"("userId", "mainsQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceRegistryRecord_sourceId_key" ON "SourceRegistryRecord"("sourceId");

-- CreateIndex
CREATE INDEX "NCERTBook_classNumber_subject_idx" ON "NCERTBook"("classNumber", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "NCERTBook_classNumber_subject_bookTitle_key" ON "NCERTBook"("classNumber", "subject", "bookTitle");

-- CreateIndex
CREATE INDEX "NCERTChapter_chapterTitle_idx" ON "NCERTChapter"("chapterTitle");

-- CreateIndex
CREATE UNIQUE INDEX "NCERTChapter_bookId_chapterNumber_key" ON "NCERTChapter"("bookId", "chapterNumber");

-- CreateIndex
CREATE INDEX "NCERTChapterQuestionLink_chapterId_idx" ON "NCERTChapterQuestionLink"("chapterId");

-- CreateIndex
CREATE INDEX "NCERTChapterQuestionLink_questionId_idx" ON "NCERTChapterQuestionLink"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "NCERTChapterQuestionLink_chapterId_questionId_key" ON "NCERTChapterQuestionLink"("chapterId", "questionId");

-- CreateIndex
CREATE INDEX "ExtractionJob_status_examCode_year_idx" ON "ExtractionJob"("status", "examCode", "year");

-- CreateIndex
CREATE INDEX "ExamYear_examFamily_year_idx" ON "ExamYear"("examFamily", "year");

-- CreateIndex
CREATE INDEX "ExamYear_downloadStatus_idx" ON "ExamYear"("downloadStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_examFamily_year_paperOrStage_key" ON "ExamYear"("examFamily", "year", "paperOrStage");

-- CreateIndex
CREATE INDEX "Subtopic_topicId_idx" ON "Subtopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_topicId_subtopicName_key" ON "Subtopic"("topicId", "subtopicName");

-- CreateIndex
CREATE INDEX "SyllabusTopic_paperId_subjectId_idx" ON "SyllabusTopic"("paperId", "subjectId");

-- CreateIndex
CREATE INDEX "QuestionSyllabusMapping_questionId_idx" ON "QuestionSyllabusMapping"("questionId");

-- CreateIndex
CREATE INDEX "QuestionSyllabusMapping_syllabusTopicId_idx" ON "QuestionSyllabusMapping"("syllabusTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSyllabusMapping_questionId_syllabusTopicId_key" ON "QuestionSyllabusMapping"("questionId", "syllabusTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSource_canonicalUrl_key" ON "KnowledgeSource"("canonicalUrl");

-- CreateIndex
CREATE INDEX "KnowledgeSource_sourceType_idx" ON "KnowledgeSource"("sourceType");

-- CreateIndex
CREATE INDEX "KnowledgeSource_rightsStatus_idx" ON "KnowledgeSource"("rightsStatus");

-- CreateIndex
CREATE INDEX "SourceRecord_sourceId_idx" ON "SourceRecord"("sourceId");

-- CreateIndex
CREATE INDEX "SourceRecord_extractionStatus_idx" ON "SourceRecord"("extractionStatus");

-- CreateIndex
CREATE INDEX "SourceCitation_questionId_idx" ON "SourceCitation"("questionId");

-- CreateIndex
CREATE INDEX "SourceCitation_sourceId_idx" ON "SourceCitation"("sourceId");

-- CreateIndex
CREATE INDEX "IngestionJobAudit_jobType_status_idx" ON "IngestionJobAudit"("jobType", "status");

-- CreateIndex
CREATE INDEX "VideoLesson_paperCode_subject_idx" ON "VideoLesson"("paperCode", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProgress_userId_videoLessonId_key" ON "VideoProgress"("userId", "videoLessonId");

-- CreateIndex
CREATE INDEX "TopperCopy_paperCode_year_idx" ON "TopperCopy"("paperCode", "year");

-- CreateIndex
CREATE INDEX "TopperCopy_rank_idx" ON "TopperCopy"("rank");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamStage" ADD CONSTRAINT "ExamStage_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ExamStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerKeyVersion" ADD CONSTRAINT "AnswerKeyVersion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTopic" ADD CONSTRAINT "QuestionTopic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTopic" ADD CONSTRAINT "QuestionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSource" ADD CONSTRAINT "QuestionSource_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSource" ADD CONSTRAINT "QuestionSource_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyActivity" ADD CONSTRAINT "StudyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentImportJob" ADD CONSTRAINT "ContentImportJob_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "PaymentRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_paymentOrderId_fkey" FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTopic" ADD CONSTRAINT "StoryTopic_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "CurrentAffairsStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryQuestionLink" ADD CONSTRAINT "StoryQuestionLink_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "CurrentAffairsStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryQuestionLink" ADD CONSTRAINT "StoryQuestionLink_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuizQuestion" ADD CONSTRAINT "DailyQuizQuestion_dailyQuizId_fkey" FOREIGN KEY ("dailyQuizId") REFERENCES "DailyQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuizQuestion" ADD CONSTRAINT "DailyQuizQuestion_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "CurrentAffairsStory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuizAttempt" ADD CONSTRAINT "DailyQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuizAttempt" ADD CONSTRAINT "DailyQuizAttempt_dailyQuizId_fkey" FOREIGN KEY ("dailyQuizId") REFERENCES "DailyQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainsDraft" ADD CONSTRAINT "MainsDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainsDraft" ADD CONSTRAINT "MainsDraft_mainsQuestionId_fkey" FOREIGN KEY ("mainsQuestionId") REFERENCES "MainsQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NCERTChapter" ADD CONSTRAINT "NCERTChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "NCERTBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NCERTChapterQuestionLink" ADD CONSTRAINT "NCERTChapterQuestionLink_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "NCERTChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NCERTChapterQuestionLink" ADD CONSTRAINT "NCERTChapterQuestionLink_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusTopic" ADD CONSTRAINT "SyllabusTopic_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSyllabusMapping" ADD CONSTRAINT "QuestionSyllabusMapping_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSyllabusMapping" ADD CONSTRAINT "QuestionSyllabusMapping_syllabusTopicId_fkey" FOREIGN KEY ("syllabusTopicId") REFERENCES "SyllabusTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceRecord" ADD CONSTRAINT "SourceRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation" ADD CONSTRAINT "SourceCitation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation" ADD CONSTRAINT "SourceCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_videoLessonId_fkey" FOREIGN KEY ("videoLessonId") REFERENCES "VideoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

