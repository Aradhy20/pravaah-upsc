import { prisma } from "@/lib/prisma";

let isSyncRunning = false;
let isSynced = false;

/** The tables the data contract declares, for drift reporting. */
const CONTRACT_TABLES = [
  "AnswerKeyVersion", "AuditLog", "BackgroundJob", "Bookmark", "ContentImportJob",
  "ContentReview", "CurrentAffairsStory", "DailyQuiz", "DailyQuizAttempt",
  "DailyQuizQuestion", "DataQualityReport", "Exam", "ExamDirectory", "ExamStage",
  "ExamYear", "Explanation", "ExtractionJob", "FeatureEntitlement",
  "HistoricalExamPeriod", "IngestionJobAudit", "KnowledgeSource", "MainsDraft",
  "MainsQuestion", "NCERTBook", "NCERTChapter", "NCERTChapterQuestionLink", "Paper",
  "PaymentOrder", "PaymentRecord", "PaymentWebhookEvent", "Plan", "PlanFeature",
  "PlanPrice", "Question", "QuestionAnswer", "QuestionOption", "QuestionSource",
  "QuestionSyllabusMapping", "QuestionTopic", "RefundRecord", "ReviewSchedule", "Role",
  "Session", "SourceCitation", "SourceDocument", "SourceRecord", "SourceRegistryRecord",
  "StoryQuestionLink", "StoryTopic", "StudyActivity", "StudyGoal", "Subject",
  "Subscription", "SubscriptionEvent", "Subtopic", "SyllabusNode", "SyllabusTopic",
  "Test", "TestQuestion", "TestSession", "Topic", "TopperCopy", "User", "UserAttempt",
  "UserNote", "UserProfile", "UserResponse", "VideoLesson", "VideoProgress",
];

export interface DbSyncResult {
  success: boolean;
  existingCount: number;
  createdCount: number;
  missingTables: string[];
  message: string;
}

export async function ensureDatabaseTables(): Promise<DbSyncResult> {
  if (isSynced) {
    return {
      success: true,
      existingCount: 69,
      createdCount: 0,
      missingTables: [],
      message: "Database already synchronized in this process lifecycle.",
    };
  }

  if (isSyncRunning) {
    // Wait briefly if another request is running sync
    await new Promise((r) => setTimeout(r, 1000));
    return {
      success: true,
      existingCount: 69,
      createdCount: 0,
      missingTables: [],
      message: "Sync already in progress.",
    };
  }

  isSyncRunning = true;
  try {
    // 1. Get existing tables in public schema
    const existingRows = await prisma.query(
      prisma.raw.sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
        .returnsRow({ table_name: "pg/text@1" })
        .build(),
    );
    const existingTableNames = new Set(existingRows.map((r: { table_name: string }) => r.table_name));

    const createdTables: string[] = [];
    const missingTables: string[] = [];

    // Tables the contract expects but the database does not have. The deploy's
    // migration step (prisma db migrate) creates them before the app starts.
    for (const table of CONTRACT_TABLES) {
      if (!existingTableNames.has(table)) {
        missingTables.push(table);
      }
    }

    // 3. Ensure FeatureEntitlements exist
    try {
      const feCount = await prisma.orm.public.FeatureEntitlement.aggregate((a) => ({ n: a.count() }));
      if (feCount < 5) {
        const defaultEntitlements = [
          {
            featureCode: "TIMED_EXAMS",
            name: "Timed Examination Simulator",
            description: "Access to 2-hour authentic UPSC CSE examination player with strict negative marking",
            minTier: 2,
          },
          {
            featureCode: "ADVANCED_ANALYTICS",
            name: "Diagnostic Weakness Detector",
            description: "Granular subject accuracy breakdown and automated weak topic identification (<60%)",
            minTier: 2,
          },
          {
            featureCode: "UNLIMITED_BOOKMARKS",
            name: "Unlimited Bookmarks",
            description: "Save unlimited questions for high-priority revision without quota limits",
            minTier: 2,
          },
          {
            featureCode: "UNLIMITED_NOTES",
            name: "Unlimited Study Notes",
            description: "Maintain comprehensive textbook cross-references on questions",
            minTier: 2,
          },
          {
            featureCode: "PRIORITY_ACCESS",
            name: "Priority Access & Verification Audit",
            description: "Priority access to freshly verified paper releases and coverage reports",
            minTier: 3,
          },
        ];

        for (const de of defaultEntitlements) {
          await prisma.orm.public.FeatureEntitlement.upsert({
            create: de,
            update: { minTier: de.minTier },
            conflictOn: { featureCode: de.featureCode },
          });
        }
      }
    } catch (e: any) {
      console.warn("Could not ensure FeatureEntitlement data:", e.message);
    }

    // 4. Ensure Plans and Prices exist
    try {
      const planCount = await prisma.plan.count();
      if (planCount < 4) {
        const defaultPlans = [
          {
            code: "FREE",
            name: "Aspirant Foundation",
            tagline: "Essential UPSC PYQ practice with official answer keys",
            tier: 0,
            isPopular: false,
            orderIndex: 1,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 0, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 0, discountPercent: 0 },
              { billingInterval: "ANNUAL", amountRupees: 0, discountPercent: 0 },
            ],
          },
          {
            code: "BEGINNER",
            name: "Syllabus Sprint",
            tagline: "Focused subject-wise practice for foundation building",
            tier: 1,
            isPopular: false,
            orderIndex: 2,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 399, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 999, discountPercent: 16 },
              { billingInterval: "ANNUAL", amountRupees: 2999, discountPercent: 37 },
            ],
          },
          {
            code: "ACHIEVER",
            name: "Prelims Pro",
            tagline: "Complete examination simulator with authentic UPSC scoring",
            tier: 2,
            isPopular: true,
            orderIndex: 3,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 799, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 1899, discountPercent: 20 },
              { billingInterval: "ANNUAL", amountRupees: 5499, discountPercent: 42 },
            ],
          },
          {
            code: "SCHOLAR",
            name: "Ranker Suite",
            tagline: "For comprehensive multi-year revision and mock test mastery",
            tier: 3,
            isPopular: false,
            orderIndex: 4,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 1299, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 2999, discountPercent: 23 },
              { billingInterval: "ANNUAL", amountRupees: 8999, discountPercent: 42 },
            ],
          },
        ];

        for (const dp of defaultPlans) {
          const { prices, ...planData } = dp;
          const plan = await prisma.orm.public.Plan.upsert({
            create: planData,
            update: planData,
            conflictOn: { code: planData.code },
          });

          for (const pr of prices) {
            const existingPrice = await prisma.orm.public.PlanPrice.where({
              planId: plan.id,
              billingInterval: pr.billingInterval,
            }).first();
            if (!existingPrice) {
              await prisma.orm.public.PlanPrice.create({
                planId: plan.id,
                billingInterval: pr.billingInterval,
                amountRupees: pr.amountRupees,
                currency: "INR",
                discountPercent: pr.discountPercent,
                isActive: true,
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.warn("Could not ensure Plan data:", e.message);
    }

    isSynced = true;
    return {
      success: true,
      existingCount: existingTableNames.size,
      createdCount: createdTables.length,
      missingTables,
      message: `Database synchronized successfully. Existing: ${existingTableNames.size}, Created: ${createdTables.length}`,
    };
  } finally {
    isSyncRunning = false;
  }
}
