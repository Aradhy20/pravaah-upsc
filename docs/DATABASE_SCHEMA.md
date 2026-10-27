# Database Design & Schema Specification
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Data Architecture:** Relational (PostgreSQL / SQLite via Prisma ORM)  

---

## 1. Relational Entity Relationship (ER) Model

```
       +------------------+             +--------------------+
       |       Role       |◄────────────┤        User        |
       +------------------+             +---------+----------+
                                                  │
                 ┌────────────────────────────────┼─────────────────────────────────┐
                 │                                │                                 │
                 ▼                                ▼                                 ▼
       +------------------+             +--------------------+            +--------------------+
       |   UserProfile    |             |    TestSession     |            |      Bookmark      |
       +------------------+             +---------+----------+            +--------------------+
                                                  │                                 │
                                                  ▼                                 ▼
+---------------------+                 +--------------------+            +--------------------+
|        Exam         |                 |    UserAttempt     |            |      UserNote      |
+----------+----------+                 +---------+----------+            +--------------------+
           │                                      │                                 │
           ▼                                      ▼                                 ▼
+---------------------+                 +--------------------+            +--------------------+
|      ExamStage      |                 |    UserResponse    |            |   ReviewSchedule   |
+----------+----------+                 +---------+----------+            +--------------------+
           │                                      │
           ▼                                      ▼
+---------------------+                 +--------------------+
|        Paper        |                 |      Question      |
+----------+----------+                 +---+---+---+----+---+
                                            │   │   │    │
                     ┌──────────────────────┘   │   │    └──────────────────────┐
                     ▼                          ▼   ▼                           ▼
          +--------------------+        +---------------+           +--------------------+
          |   QuestionOption   |        |  Explanation  |           |  AnswerKeyVersion  |
          +--------------------+        +---------------+           +--------------------+
                     │
                     ▼
          +--------------------+        +---------------+           +--------------------+
          |   QuestionTopic    |───────►|     Topic     |◄──────────|    SyllabusNode    |
          +--------------------+        +-------+-------+           +--------------------+
                                                │
                                                ▼
                                        +---------------+
                                        |    Subject    |
                                        +---------------+
```

---

## 2. Table Definitions & Data Dictionary

### 2.1 Authentication & User Management

#### `User`
Primary identity table for aspirants and administrators.
- `id` (VARCHAR(36), PK): UUID.
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Indexed user email.
- `passwordHash` (VARCHAR(255), NOT NULL): Bcrypt-hashed password.
- `roleId` (VARCHAR(36), FK $\rightarrow$ Role.id, NOT NULL): User role (`ASPIRANT` or `ADMIN`).
- `isActive` (BOOLEAN, DEFAULT true): Soft status flag.
- `createdAt` (TIMESTAMP, DEFAULT NOW()): Record creation time.
- `updatedAt` (TIMESTAMP, DEFAULT NOW()): Record last updated time.

#### `UserProfile`
Extended metadata for an aspirant.
- `id` (VARCHAR(36), PK): UUID.
- `userId` (VARCHAR(36), UNIQUE, FK $\rightarrow$ User.id, NOT NULL): One-to-one link.
- `fullName` (VARCHAR(100), NOT NULL): Aspirant's name.
- `targetYear` (INTEGER): Target examination year (e.g., 2026, 2027).
- `optionalSubject` (VARCHAR(100)): Selected UPSC Optional (e.g., "PSIR", "Geography").
- `dailyGoalMinutes` (INTEGER, DEFAULT 60): Planned study duration.

#### `Role`
Authorization roles.
- `id` (VARCHAR(36), PK): Role identifier (`ASPIRANT`, `ADMIN`).
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Display name.
- `description` (TEXT): Permission notes.

---

### 2.2 Examination Structure & Content Hierarchy

#### `Exam`
- `id` (VARCHAR(36), PK): e.g., `UPSC_CSE` (Civil Services Examination).
- `name` (VARCHAR(150), NOT NULL): "UPSC Civil Services Examination".
- `code` (VARCHAR(50), UNIQUE, NOT NULL): `CSE`.

#### `ExamStage`
- `id` (VARCHAR(36), PK): e.g., `CSE_PRELIMS`.
- `examId` (VARCHAR(36), FK $\rightarrow$ Exam.id, NOT NULL).
- `name` (VARCHAR(100), NOT NULL): "Preliminary Examination".
- `orderIndex` (INTEGER, NOT NULL): 1.

#### `Paper`
- `id` (VARCHAR(36), PK): e.g., `CSE_PRE_GS1`, `CSE_PRE_CSAT`.
- `stageId` (VARCHAR(36), FK $\rightarrow$ ExamStage.id, NOT NULL).
- `code` (VARCHAR(20), NOT NULL): `GS1` or `GS2`.
- `name` (VARCHAR(150), NOT NULL): "General Studies Paper I" or "General Studies Paper II (CSAT)".
- `totalQuestions` (INTEGER, NOT NULL): 100 for GS1, 80 for CSAT.
- `totalMarks` (INTEGER, NOT NULL): 200.
- `durationMinutes` (INTEGER, NOT NULL): 120.
- `positiveMark` (FLOAT, NOT NULL): 2.0 for GS1, 2.5 for CSAT.
- `negativeMark` (FLOAT, NOT NULL): 0.666 for GS1, 0.833 for CSAT.

#### `Subject`
- `id` (VARCHAR(36), PK): e.g., `POLITY`, `ECONOMY`, `GEOGRAPHY`, `HISTORY`, `ENVIRONMENT`, `SCIENCE_TECH`, `CSAT_QUANT`, `CSAT_REASONING`, `CSAT_READING`.
- `paperId` (VARCHAR(36), FK $\rightarrow$ Paper.id, NOT NULL).
- `name` (VARCHAR(100), NOT NULL): Display title.
- `slug` (VARCHAR(100), UNIQUE, NOT NULL): URL identifier.
- `icon` (VARCHAR(50)): Lucide icon key.

#### `Topic` & `SyllabusNode`
- `id` (VARCHAR(36), PK): UUID.
- `subjectId` (VARCHAR(36), FK $\rightarrow$ Subject.id, NOT NULL).
- `name` (VARCHAR(150), NOT NULL): Topic title (e.g., "Fundamental Rights & DPSP").
- `slug` (VARCHAR(150), NOT NULL).
- `description` (TEXT): Syllabus summary.
- `parentId` (VARCHAR(36), FK $\rightarrow$ Topic.id, NULL): Hierarchical taxonomy support.

---

### 2.3 Question Bank, Options & Verified Answer Keys

#### `Question`
The core question entity.
- `id` (VARCHAR(36), PK): UUID.
- `paperId` (VARCHAR(36), FK $\rightarrow$ Paper.id, NOT NULL).
- `year` (INTEGER, NOT NULL): Examination year (e.g., 2024, 2023).
- `questionNumber` (INTEGER, NOT NULL): Original question index in paper.
- `questionText` (TEXT, NOT NULL): Full question stem including statements.
- `difficulty` (VARCHAR(20), DEFAULT 'MEDIUM'): `EASY`, `MEDIUM`, `HARD`.
- `isStatic` (BOOLEAN, DEFAULT true): Static syllabus vs. Dynamic Current Affairs.
- `status` (VARCHAR(20), DEFAULT 'DRAFT'): `DRAFT`, `NEEDS_REVIEW`, `VERIFIED`, `PUBLISHED`, `ARCHIVED`.
- `verifiedAt` (TIMESTAMP): Timestamp when reviewer approved.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).
- `updatedAt` (TIMESTAMP, DEFAULT NOW()).
- *Constraints:* UNIQUE(`paperId`, `year`, `questionNumber`).

#### `QuestionOption`
Options associated with a question.
- `id` (VARCHAR(36), PK): UUID.
- `questionId` (VARCHAR(36), FK $\rightarrow$ Question.id, CASCADE DELETE, NOT NULL).
- `optionCode` (VARCHAR(5), NOT NULL): `A`, `B`, `C`, `D`.
- `optionText` (TEXT, NOT NULL): The option text.
- `isCorrect` (BOOLEAN, NOT NULL): Authoritative truth flag.

#### `AnswerKeyVersion`
Provenance and versioning of the answer key.
- `id` (VARCHAR(36), PK): UUID.
- `questionId` (VARCHAR(36), FK $\rightarrow$ Question.id, NOT NULL).
- `officialAnswer` (VARCHAR(5), NOT NULL): `A`, `B`, `C`, or `D` (or `DROPPED`).
- `sourceType` (VARCHAR(50), NOT NULL): `UPSC_OFFICIAL_FINAL`, `PROVISIONAL_COACHING`, `FACULTY_REVIEW`.
- `sourceReference` (VARCHAR(255)): URL or notification document date.
- `notes` (TEXT): Any note regarding dropped or ambiguous questions.

#### `Explanation`
Pedagogical solution and conceptual analysis.
- `id` (VARCHAR(36), PK): UUID.
- `questionId` (VARCHAR(36), UNIQUE, FK $\rightarrow$ Question.id, CASCADE DELETE, NOT NULL).
- `summary` (TEXT, NOT NULL): Quick takeaway / why the answer is correct.
- `detailedExplanation` (TEXT, NOT NULL): In-depth breakdown.
- `eliminationTechnique` (TEXT): How to eliminate wrong options.
- `sourceCitation` (VARCHAR(255)): Standard book/NCERT reference (e.g., "M. Laxmikanth, Indian Polity 7th Ed, Ch. 7").
- `relatedConcept` (VARCHAR(150)): Primary theoretical concept.

#### `QuestionTopic`
Many-to-many relationship linking questions to syllabus topics.
- `id` (VARCHAR(36), PK): UUID.
- `questionId` (VARCHAR(36), FK $\rightarrow$ Question.id, NOT NULL).
- `topicId` (VARCHAR(36), FK $\rightarrow$ Topic.id, NOT NULL).

#### `SourceDocument` & `QuestionSource`
Tracks the original UPSC official question paper PDF.
- `id` (VARCHAR(36), PK): UUID.
- `title` (VARCHAR(255), NOT NULL): e.g., "Civil Services (Preliminary) Examination 2024 - General Studies Paper I (Series A)".
- `sourceUrl` (VARCHAR(500), NOT NULL): Official upsc.gov.in URL.
- `fileHash` (VARCHAR(64)): SHA256 checksum of source PDF.
- `paperCode` (VARCHAR(20)): "Series A".

---

### 2.4 Testing, Attempts & User Interactions

#### `Test` & `TestQuestion`
Curated test papers (e.g., Full 2024 GS Paper 1, or Custom Modern History Test).
- `id` (VARCHAR(36), PK): UUID.
- `title` (VARCHAR(200), NOT NULL).
- `paperId` (VARCHAR(36), FK $\rightarrow$ Paper.id, NOT NULL).
- `isFullPaper` (BOOLEAN, DEFAULT true).
- `year` (INTEGER): Applicable year.

#### `TestSession`
An active or finished test sitting.
- `id` (VARCHAR(36), PK): UUID.
- `userId` (VARCHAR(36), FK $\rightarrow$ User.id, NOT NULL).
- `testId` (VARCHAR(36), FK $\rightarrow$ Test.id, NOT NULL).
- `status` (VARCHAR(20), DEFAULT 'IN_PROGRESS'): `IN_PROGRESS`, `COMPLETED`, `ABANDONED`.
- `startedAt` (TIMESTAMP, DEFAULT NOW()).
- `submittedAt` (TIMESTAMP).
- `totalTimeSpentSeconds` (INTEGER, DEFAULT 0).
- `totalQuestions` (INTEGER, NOT NULL).
- `attemptedCount` (INTEGER, DEFAULT 0).
- `correctCount` (INTEGER, DEFAULT 0).
- `incorrectCount` (INTEGER, DEFAULT 0).
- `netScore` (FLOAT, DEFAULT 0.0).

#### `UserAttempt` & `UserResponse`
Tracks individual responses both in Learn Mode and Exam Mode.
- `id` (VARCHAR(36), PK): UUID.
- `testSessionId` (VARCHAR(36), FK $\rightarrow$ TestSession.id, NULL): Nullable if done in free Learn Mode.
- `userId` (VARCHAR(36), FK $\rightarrow$ User.id, NOT NULL).
- `questionId` (VARCHAR(36), FK $\rightarrow$ Question.id, NOT NULL).
- `selectedOption` (VARCHAR(5)): `A`, `B`, `C`, `D`, or NULL.
- `isCorrect` (BOOLEAN, NOT NULL).
- `timeSpentSeconds` (INTEGER, DEFAULT 0).
- `mode` (VARCHAR(20), NOT NULL): `LEARN` or `EXAM`.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).

#### `Bookmark` & `UserNote`
- `Bookmark`: (`id`, `userId`, `questionId`, `folderTag`, `createdAt`)
- `UserNote`: (`id`, `userId`, `questionId`, `content`, `updatedAt`)

#### `ReviewSchedule`
Spaced revision queue for missed questions.
- `id` (VARCHAR(36), PK): UUID.
- `userId` (VARCHAR(36), FK $\rightarrow$ User.id, NOT NULL).
- `questionId` (VARCHAR(36), FK $\rightarrow$ Question.id, NOT NULL).
- `repetitionCount` (INTEGER, DEFAULT 0).
- `intervalDays` (INTEGER, DEFAULT 1).
- `easeFactor` (FLOAT, DEFAULT 2.5).
- `nextReviewDate` (TIMESTAMP, NOT NULL).
- `isResolved` (BOOLEAN, DEFAULT false).

#### `StudyGoal` & `StudyActivity`
Daily and weekly habit tracking.
- `StudyActivity`: (`id`, `userId`, `activityType`, `refId`, `durationMinutes`, `timestamp`)

---

### 2.5 Administration, Ingestion & Audit Logs

#### `ContentImportJob`
Tracks file uploads and batch imports.
- `id` (VARCHAR(36), PK): UUID.
- `adminId` (VARCHAR(36), FK $\rightarrow$ User.id, NOT NULL).
- `fileName` (VARCHAR(255), NOT NULL).
- `paperYear` (INTEGER, NOT NULL).
- `paperCode` (VARCHAR(20), NOT NULL).
- `totalRecords` (INTEGER, DEFAULT 0).
- `importedCount` (INTEGER, DEFAULT 0).
- `rejectedCount` (INTEGER, DEFAULT 0).
- `status` (VARCHAR(20)): `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- `errorReportJson` (TEXT): Detailed parsing errors.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).

#### `ContentReview` & `AuditLog`
- `AuditLog`: (`id`, `adminId`, `action`, `entityType`, `entityId`, `detailsJson`, `timestamp`).

---

### 2.6 Plans, Subscriptions, Payments & Feature Entitlements

#### `Plan`
Authoritative product tier definition.
- `id` (VARCHAR(36), PK): UUID.
- `name` (VARCHAR(100), NOT NULL): e.g., "Aspirant Foundation", "Prelims Pro".
- `slug` (VARCHAR(50), UNIQUE, NOT NULL): `FREE`, `BEGINNER`, `ACHIEVER`, `SCHOLAR`.
- `description` (TEXT, NOT NULL): Marketing/pedagogical scope.
- `tier` (INTEGER, NOT NULL): Hierarchy level (0 = Free, 1 = Beginner, 2 = Achiever, 3 = Scholar).
- `isActive` (BOOLEAN, DEFAULT true): Plan availability toggle.
- `isFeatured` (BOOLEAN, DEFAULT false): Highlights recommended plan.
- `badge` (VARCHAR(50)): e.g., "Most Popular", "Best Value".
- `sortOrder` (INTEGER, DEFAULT 0).
- `createdAt` (TIMESTAMP, DEFAULT NOW()).
- `updatedAt` (TIMESTAMP, DEFAULT NOW()).

#### `PlanPrice`
Interval-specific pricing for each plan.
- `id` (VARCHAR(36), PK): UUID.
- `planId` (VARCHAR(36), FK $\rightarrow$ Plan.id, CASCADE DELETE, NOT NULL).
- `billingPeriod` (VARCHAR(20), NOT NULL): `MONTHLY`, `QUARTERLY`, `ANNUAL`.
- `amount` (FLOAT, NOT NULL): Numeric amount in INR (e.g., 799.00).
- `currency` (VARCHAR(10), DEFAULT 'INR').
- `formattedAmount` (VARCHAR(20), NOT NULL): Display string (e.g., "₹799").
- `savingsPercent` (INTEGER, DEFAULT 0): Calculated discount (e.g., 15 for quarterly, 35 for annual).
- `isActive` (BOOLEAN, DEFAULT true).
- *Constraints:* UNIQUE(`planId`, `billingPeriod`).

#### `PlanFeature`
Marketing and UI checklist feature bullet points.
- `id` (VARCHAR(36), PK): UUID.
- `planId` (VARCHAR(36), FK $\rightarrow$ Plan.id, CASCADE DELETE, NOT NULL).
- `featureKey` (VARCHAR(100), NOT NULL): Identifier code.
- `featureName` (VARCHAR(255), NOT NULL): Descriptive text.
- `isIncluded` (BOOLEAN, DEFAULT true).
- `displayOrder` (INTEGER, DEFAULT 0).

#### `FeatureEntitlement`
Authoritative server-enforced quota and feature bounds.
- `id` (VARCHAR(36), PK): UUID.
- `planId` (VARCHAR(36), FK $\rightarrow$ Plan.id, CASCADE DELETE, NOT NULL).
- `quotaKey` (VARCHAR(50), NOT NULL): e.g., `MAX_BOOKMARKS`, `MAX_NOTES`, `TIMED_EXAMS`, `DETAILED_ANALYTICS`.
- `quotaValue` (INTEGER, NOT NULL): Numerical limit or `-1` for unlimited.
- `description` (TEXT): Entitlement specification.
- *Constraints:* UNIQUE(`planId`, `quotaKey`).

#### `Subscription`
Active or historical user subscription record.
- `id` (VARCHAR(36), PK): UUID.
- `userId` (VARCHAR(36), FK $\rightarrow$ User.id, CASCADE DELETE, NOT NULL).
- `planId` (VARCHAR(36), FK $\rightarrow$ Plan.id, NOT NULL).
- `status` (VARCHAR(20), DEFAULT 'ACTIVE'): `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
- `billingPeriod` (VARCHAR(20), NOT NULL): `MONTHLY`, `QUARTERLY`, `ANNUAL`.
- `currentPeriodStart` (TIMESTAMP, DEFAULT NOW()).
- `currentPeriodEnd` (TIMESTAMP, NOT NULL): Access expiration timestamp.
- `cancelAtPeriodEnd` (BOOLEAN, DEFAULT false): Non-renewing flag.
- `cancelledAt` (TIMESTAMP): Time when user triggered cancellation.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).
- `updatedAt` (TIMESTAMP, DEFAULT NOW()).

#### `SubscriptionEvent`
Immutable log of external webhook notifications and state transitions.
- `id` (VARCHAR(36), PK): UUID.
- `subscriptionId` (VARCHAR(36), FK $\rightarrow$ Subscription.id, NULL).
- `eventType` (VARCHAR(100), NOT NULL): e.g., `payment.succeeded`, `payment.failed`, `subscription.cancelled`.
- `eventId` (VARCHAR(255), UNIQUE, NOT NULL): Webhook idempotency key.
- `provider` (VARCHAR(50), DEFAULT 'SANDBOX_GATEWAY'): `STRIPE`, `RAZORPAY`, `SANDBOX_GATEWAY`.
- `rawPayload` (TEXT, NOT NULL): Original webhook JSON.
- `timestamp` (TIMESTAMP, DEFAULT NOW()).

#### `PaymentRecord`
Transactional log of incoming customer payments.
- `id` (VARCHAR(36), PK): UUID.
- `userId` (VARCHAR(36), FK $\rightarrow$ User.id, NOT NULL).
- `planId` (VARCHAR(36), FK $\rightarrow$ Plan.id, NOT NULL).
- `billingPeriod` (VARCHAR(20), NOT NULL).
- `amount` (FLOAT, NOT NULL).
- `currency` (VARCHAR(10), DEFAULT 'INR').
- `status` (VARCHAR(20), DEFAULT 'PENDING'): `PENDING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `REFUNDED`.
- `provider` (VARCHAR(50), DEFAULT 'SANDBOX_GATEWAY').
- `transactionRef` (VARCHAR(255)): Gateway reference ID.
- `idempotencyKey` (VARCHAR(255), UNIQUE, NOT NULL): Client-generated check ID.
- `errorReason` (TEXT): Failure code/message if rejected.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).
- `updatedAt` (TIMESTAMP, DEFAULT NOW()).

#### `RefundRecord`
Tracks administrative or automated refund disbursements.
- `id` (VARCHAR(36), PK): UUID.
- `paymentRecordId` (VARCHAR(36), FK $\rightarrow$ PaymentRecord.id, NOT NULL).
- `amount` (FLOAT, NOT NULL).
- `currency` (VARCHAR(10), DEFAULT 'INR').
- `reason` (TEXT, NOT NULL): e.g., "7-Day Money-Back Guarantee request".
- `status` (VARCHAR(20), DEFAULT 'COMPLETED'): `PENDING`, `COMPLETED`, `REJECTED`.
- `providerRefundId` (VARCHAR(255)): Gateway refund tracking ID.
- `createdAt` (TIMESTAMP, DEFAULT NOW()).
- `updatedAt` (TIMESTAMP, DEFAULT NOW()).
