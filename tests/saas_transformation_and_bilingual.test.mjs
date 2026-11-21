import assert from "node:assert";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadDict(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const braceIdx = content.indexOf("{");
  const lastBraceIdx = content.lastIndexOf("}");
  const jsonStr = content.slice(braceIdx, lastBraceIdx + 1);
  return Function(`"use strict"; return (${jsonStr});`)();
}

const en = loadDict(path.join(process.cwd(), "lib/i18n/en.ts"));
const hi = loadDict(path.join(process.cwd(), "lib/i18n/hi.ts"));

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("PRAVAAH UPSC - Master SaaS Transformation & Bilingual Parity Verification", async (t) => {
  let testUser;
  let testSessionCookie;

  await t.test("Setup: Create test user and obtain authentication session", async () => {
    const studentRole = await prisma.role.findFirst({
      where: { name: "ASPIRANT" },
    });
    assert.ok(studentRole, "ASPIRANT role must exist in database");

    const email = `aspirant_bilingual_${Date.now()}@test.pravaah.com`;
    testUser = await prisma.user.create({
      data: {
        email,
        fullName: "Aspirant Rahul Sharma",
        passwordHash: "$2b$10$ep5zJb6v4M.F.Wb2f8aO0.dummyhashforautomatedtestingonly",
        role: { connect: { id: studentRole.id } },
        profile: {
          create: {
            targetYear: 2026,
            targetExam: "UPSC_CSE",
            optionalSubject: "PSIR",
            dailyGoalMinutes: 90,
            dailyStudyHours: 1.5,
            preferredLanguage: "hi",
            weakSubjects: "CSAT, Economy",
          },
        },
      },
      include: { profile: true },
    });

    assert.ok(testUser.id, "Test user created");
    assert.strictEqual(testUser.profile.preferredLanguage, "hi");
  });

  await t.test("1. Bilingual Dictionary Parity: All keys exist in both EN and HI", () => {
    const enKeys = Object.keys(en);
    const hiKeys = Object.keys(hi);

    assert.ok(enKeys.length > 20, "EN dictionary must have core keys");
    assert.ok(hiKeys.length > 20, "HI dictionary must have core keys");

    // Every key in EN must exist in HI
    for (const key of enKeys) {
      assert.ok(
        hi[key] !== undefined,
        `Missing Hindi translation for dictionary key: "${key}"`
      );
      assert.ok(
        hi[key].trim().length > 0,
        `Empty Hindi translation for dictionary key: "${key}"`
      );
    }
  });

  await t.test("2. Video Academy API: GET /api/v1/videos returns seeded high-yield lessons", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/videos`);
    assert.strictEqual(res.status, 200, "GET /api/v1/videos must return 200 OK");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data), "data must be an array");
    assert.ok(json.data.length >= 5, "At least 5 curated video lessons must be seeded");

    // Verify properties of seeded videos
    const first = json.data[0];
    assert.ok(first.title, "Video must have title");
    assert.ok(first.youtubeId, "Video must have youtubeId");
    assert.ok(first.paperCode, "Video must have paperCode");
    assert.ok(first.durationMinutes > 0, "Video must have positive duration");

    // Filter by paperCode: GS2
    const resGs2 = await fetch(`${BASE_URL}/api/v1/videos?paperCode=GS2`);
    const jsonGs2 = await resGs2.json();
    assert.strictEqual(jsonGs2.success, true);
    assert.ok(jsonGs2.data.every((v) => v.paperCode === "GS2"), "All returned videos must be GS2");
  });

  await t.test("3. Topper Copies API: GET /api/v1/topper-copies returns annotated copies", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/topper-copies`);
    assert.strictEqual(res.status, 200, "GET /api/v1/topper-copies must return 200 OK");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data), "data must be an array");
    assert.ok(json.data.length >= 5, "At least 5 curated topper copies must be seeded");

    // Verify Ishita Kishore AIR 1
    const ishita = json.data.find((c) => c.rank === 1 && c.year === 2022);
    assert.ok(ishita, "Ishita Kishore AIR 1 must be present");
    assert.ok(ishita.keyTakeaways, "Topper copy must include keyTakeaways annotations");
    assert.ok(ishita.scoreMarks, "Topper copy must include scoreMarks");
  });

  await t.test("4. User Profile API: GET and PUT /api/v1/user/profile with new bilingual fields", async () => {
    // GET Profile
    const getRes = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      headers: { "x-user-id": testUser.id },
    });
    assert.strictEqual(getRes.status, 200, "GET /api/v1/user/profile must return 200");
    const getJson = await getRes.json();
    assert.strictEqual(getJson.success, true);
    assert.strictEqual(getJson.data.preferredLanguage, "hi");
    assert.strictEqual(getJson.data.targetExam, "UPSC_CSE");

    // PUT Profile to update to English & new target
    const putRes = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUser.id,
      },
      body: JSON.stringify({
        targetYear: 2027,
        preferredLanguage: "en",
        weakSubjects: "Ethics, CSAT",
        dailyGoalMinutes: 120,
        dailyStudyHours: 2.0,
      }),
    });
    assert.strictEqual(putRes.status, 200, "PUT /api/v1/user/profile must return 200");
    const putJson = await putRes.json();
    assert.strictEqual(putJson.success, true);
    assert.strictEqual(putJson.data.preferredLanguage, "en");
    assert.strictEqual(putJson.data.targetYear, 2027);
  });

  await t.test("5. Pravaah AI Mentor: POST /api/v1/ai/assistant grounds in syllabus & NCERT", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Fundamental Rights Article 21",
        examFamily: "CSE",
      }),
    });
    assert.strictEqual(res.status, 200, "POST /api/v1/ai/assistant must return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.answer, "AI Mentor must generate grounded answer");
    assert.ok(json.data.groundingConfidence > 0, "Grounding confidence must be > 0");
    assert.ok(Array.isArray(json.data.syllabusNodes), "Syllabus nodes must be returned");
  });

  await t.test("6. Mains Answer Evaluation: POST /api/v1/mains/evaluate produces 4-dimension feedback", async () => {
    // Find or create a MainsQuestion
    let mainsQ = await prisma.mainsQuestion.findFirst();
    if (!mainsQ) {
      mainsQ = await prisma.mainsQuestion.create({
        data: {
          paperCode: "GS2",
          year: 2023,
          questionNumber: 1,
          questionText: "Discuss the constitutional role of the Election Commission of India in ensuring free and fair elections.",
          marks: 10,
          wordLimit: 150,
          theme: "Governance & Elections",
          frameworkGuidance: "Article 324, Model Code of Conduct, appointment reforms (Anoop Baranwal case), EVM-VVPAT integrity.",
        },
      });
    }

    const testAnswer = `The Election Commission of India (ECI), established under Article 324 of the Constitution, is an independent constitutional authority tasked with administering free and fair elections to Parliament, State Legislatures, and the offices of President and Vice-President.
Key constitutional mechanisms and executive powers:
1. Constitutional Mandate (Article 324): Vests superintendence, direction, and control of elections in the ECI. In the Mohinder Singh Gill (1978) case, the Supreme Court affirmed that Article 324 confers reservoir powers to act in situations where statutory law is silent.
2. Model Code of Conduct (MCC): Enforces moral and operational guidelines to prevent misuse of official machinery by ruling parties during campaigns.
3. Emerging Challenges: Independence in appointments as discussed in the Anoop Baranwal case (2023), regulation of digital advertising, and electoral bonds disclosure.
Way Forward: Implementing the recommendations of the 2nd Administrative Reforms Commission (ARC) and Law Commission 255th Report to grant statutory teeth to MCC and safeguard appointment autonomy.`;

    const res = await fetch(`${BASE_URL}/api/v1/mains/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUser.id,
      },
      body: JSON.stringify({
        mainsQuestionId: mainsQ.id,
        userAnswer: testAnswer,
      }),
    });

    assert.strictEqual(res.status, 200, "POST /api/v1/mains/evaluate must return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.evaluation, "Evaluation object must be returned");
    assert.ok(json.evaluation.totalScore > 0, "Score must be positive");
    assert.ok(Array.isArray(json.evaluation.dimensions), "Dimensions array must be returned");
    assert.strictEqual(json.evaluation.dimensions.length, 4, "Must have 4 standard rubric dimensions");

    // Verify persistence in MainsDraft
    const draft = await prisma.mainsDraft.findUnique({
      where: {
        userId_mainsQuestionId: {
          userId: testUser.id,
          mainsQuestionId: mainsQ.id,
        },
      },
    });
    assert.ok(draft, "Draft must be saved in DB");
    assert.strictEqual(draft.isSubmitted, true);
    assert.ok(draft.aiFeedbackJson, "Feedback must be saved in aiFeedbackJson");
  });

  await t.test("Cleanup: Delete test user and records", async () => {
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });
});
