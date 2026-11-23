import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Phase 5: Single Source of Truth Question Inventory (121 Prelims, 32 Mains)", async () => {
  const prelimsCount = await prisma.question.count({
    where: { status: "PUBLISHED" },
  });
  const mainsCount = await prisma.mainsQuestion.count();
  const gs1Count = await prisma.question.count({
    where: { paper: { code: "GS1" }, status: "PUBLISHED" },
  });
  const csatCount = await prisma.question.count({
    where: { paper: { code: "GS2" }, status: "PUBLISHED" },
  });

  assert.strictEqual(prelimsCount, 121, "Total verified Prelims questions must strictly equal 121");
  assert.strictEqual(gs1Count, 74, "GS1 questions must equal 74");
  assert.strictEqual(csatCount, 47, "CSAT questions must equal 47");
  assert.strictEqual(mainsCount, 32, "Mains questions must strictly equal 32");

  // Ensure legacy string 1,079 is purged across all public views
  const filesToCheck = [
    "app/current-affairs/page.tsx",
    "app/study-planner/page.tsx",
    "app/syllabus/page.tsx",
    "app/system-flow/page.tsx",
    "app/admin/ingestion/page.tsx",
  ];
  for (const f of filesToCheck) {
    const content = fs.readFileSync(path.resolve(f), "utf-8");
    assert.ok(
      !content.includes("1,079") && !content.includes("1079"),
      `File ${f} must not contain obsolete 1,079 count string`
    );
  }
});

test("Phase 5: Current Affairs & PYQ Conceptual Alignment (Article 200 Governor Assent)", async () => {
  const story = await prisma.currentAffairsStory.findUnique({
    where: { slug: "supreme-court-guidelines-governors-assent-article-200" },
    include: {
      questionLinks: {
        include: { question: { include: { paper: true } } },
      },
    },
  });

  assert.ok(story, "Governor Article 200 story must exist in database");
  assert.ok(
    story.questionLinks.length > 0,
    "Governor Article 200 story must have at least 1 authentic connected PYQ"
  );

  const linkedQuestion = story.questionLinks[0].question;
  assert.strictEqual(linkedQuestion.year, 2024, "Connected PYQ must be from UPSC CSE 2024");
  assert.strictEqual(linkedQuestion.paper.code, "GS1", "Connected PYQ must be from General Studies Paper I");
  assert.strictEqual(linkedQuestion.questionNumber, 1, "Connected PYQ must be Question #1 (Governor's tenure under Article 156)");
});

test("Phase 5: Mission Control API Multi-Tenant Security & Telemetry", async () => {
  // 1. Unauthenticated request must return graceful zero-state data
  const unauthRes = await fetch(`${BASE_URL}/api/v1/mission-control`);
  assert.strictEqual(unauthRes.status, 200, "Unauthenticated request should return 200 with guest status");
  const unauthJson = await unauthRes.json();
  assert.ok(unauthJson.success, "Response must report success");
  assert.strictEqual(unauthJson.data.authenticated, false, "Must indicate unauthenticated guest");
  assert.strictEqual(unauthJson.data.examReadiness.status, "INSUFFICIENT_DATA");

  // 2. Fetch with demo student session
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "demo@pravaah.com",
      password: "password123",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie") || "";

  if (loginRes.ok) {
    const authRes = await fetch(`${BASE_URL}/api/v1/mission-control`, {
      headers: { Cookie: cookie },
    });
    assert.strictEqual(authRes.status, 200, "Authenticated Mission Control request must return 200");
    const json = await authRes.json();
    assert.ok(json.success, "Response must succeed");
    assert.ok(json.data, "Must return data object");
    assert.strictEqual(json.data.authenticated, true, "Must indicate authenticated user");
    assert.ok(typeof json.data.examReadiness.index === "number", "Must compute readiness index");
    assert.ok(json.data.theFiveQuestions, "Must provide 5 Core Daily Answers");
    assert.ok(Array.isArray(json.data.weakTopics), "Must list weak topics array");
  }
});

test("Phase 5: Dedicated CSAT Survival Coach API", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/csat/coach`);
  assert.strictEqual(res.status, 200, "CSAT Coach API must return 200");
  const json = await res.json();
  assert.ok(json.success, "CSAT Coach response must succeed");
  assert.strictEqual(json.data.qualifyingRules.qualifyingThresholdMarks, 66.0, "Qualifying benchmark must be 66 marks");
  assert.strictEqual(json.data.qualifyingRules.qualifyingPercentage, 33, "Qualifying benchmark must be 33%");
  assert.strictEqual(json.data.qualifyingRules.totalQuestionsInPaper, 80, "CSAT paper has 80 questions");
  assert.strictEqual(json.data.pillars.length, 3, "Must return 3 CSAT pillars (Comprehension, Reasoning, Quant)");
});

test("Phase 5: Syllabus Intelligence 3-Tier Hierarchy API", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/syllabus/intelligence`);
  assert.strictEqual(res.status, 200, "Syllabus Intelligence API must return 200");
  const json = await res.json();
  assert.ok(json.success, "Syllabus API response must succeed");
  assert.ok(Array.isArray(json.data.subjects), "Must return subjects array");
  assert.ok(json.data.summary.totalTopics > 0, "Must return non-zero topics");
  assert.ok(json.data.summary, "Must return summary metrics");
});

test("Phase 5: Contact Desk API Validation & Ticket Generation", async () => {
  // 1. Validation: Reject short name
  const invalidNameRes = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "A",
      email: "valid@example.com",
      category: "TECHNICAL",
      subject: "Valid Subject Here",
      message: "This is a detailed message explaining the issue encountered.",
    }),
  });
  assert.strictEqual(invalidNameRes.status, 400, "Must reject name shorter than 2 chars");

  // 2. Validation: Reject invalid email
  const invalidEmailRes = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Aradhy Jain",
      email: "invalid-email-format",
      category: "TECHNICAL",
      subject: "Valid Subject Here",
      message: "This is a detailed message explaining the issue encountered.",
    }),
  });
  assert.strictEqual(invalidEmailRes.status, 400, "Must reject invalid email");

  // 3. Validation: Reject short message
  const shortMsgRes = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Aradhy Jain",
      email: "test@example.com",
      category: "TECHNICAL",
      subject: "Valid Subject",
      message: "Too short",
    }),
  });
  assert.strictEqual(shortMsgRes.status, 400, "Must reject message shorter than 20 chars");

  // 4. Valid Ticket Submission
  const validRes = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-suite": "true",
    },
    body: JSON.stringify({
      fullName: "Test Aspirant",
      email: "aspirant.test@pravaah.com",
      category: "CONTENT_CORRECTION",
      subject: "Question 1 GS1 2024 Reference Clarification",
      message: "Testing the Pravaah UPSC support desk pipeline with authentic ticket generation.",
    }),
  });
  assert.strictEqual(validRes.status, 200, "Valid ticket submission must succeed with 200");
  const validJson = await validRes.json();
  assert.ok(validJson.success, "Response must report success");
  assert.ok(
    /^PRV-TKT-\d{6}-[A-Z0-9]{4}$/.test(validJson.ticketNumber),
    `Ticket number must match format PRV-TKT-YYYYMM-XXXX, got ${validJson.ticketNumber}`
  );

  // 5. Verify database persistence
  const savedTicket = await prisma.supportTicket.findUnique({
    where: { ticketNumber: validJson.ticketNumber },
  });
  assert.ok(savedTicket, "Ticket must be persisted in PostgreSQL SupportTicket table");
  assert.strictEqual(savedTicket.category, "CONTENT_CORRECTION");
  assert.strictEqual(savedTicket.status, "OPEN");

  // Clean up test ticket
  await prisma.supportTicket.delete({ where: { id: savedTicket.id } });
});

test("Phase 5: Global Footer Contact Details & Provenance Links", async () => {
  const footerContent = fs.readFileSync(path.resolve("components/Footer.tsx"), "utf-8");

  assert.ok(footerContent.includes("+91 7351522153"), "Footer must include official phone +91 7351522153");
  assert.ok(footerContent.includes("tel:+917351522153"), "Footer must include clickable tel link");
  assert.ok(footerContent.includes("https://wa.me/917351522153"), "Footer must include WhatsApp direct chat link");
  assert.ok(footerContent.includes("jainaradhy123@gmail.com"), "Footer must include official email jainaradhy123@gmail.com");
  assert.ok(footerContent.includes("Aradhy Jain"), "Footer must mention Lead Architect Aradhy Jain");
  assert.ok(footerContent.includes("/contact"), "Footer must link to /contact");
  assert.ok(footerContent.includes("/mission-control"), "Footer must link to /mission-control");
  assert.ok(footerContent.includes("/csat-coach"), "Footer must link to /csat-coach");
  assert.ok(footerContent.includes("/syllabus/intelligence"), "Footer must link to /syllabus/intelligence");
});

test("Phase 5: Mains Evaluation API Word Limits & Disclaimers", async () => {
  // Test short answer rejection
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "demo@pravaah.com",
      password: "password123",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie") || "";

  if (loginRes.ok) {
    const firstMainsQ = await prisma.mainsQuestion.findFirst();
    assert.ok(firstMainsQ, "At least one Mains question must exist");

    const shortEvalRes = await fetch(`${BASE_URL}/api/v1/mains/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        mainsQuestionId: firstMainsQ.id,
        userAnswer: "This answer is much too short.",
      }),
    });
    assert.strictEqual(shortEvalRes.status, 400, "Submissions < 30 words must be rejected with 400");

    // Test comprehensive answer evaluation
    const longAnswer = `The Governor's constitutional position under Article 153 to 162 forms the cornerstone of federal harmony in the Indian Union.
Under Article 200, when a bill is presented to the Governor after passing the State Legislature, the Governor has four choices: give assent, withhold assent, return the bill for reconsideration (if not a Money Bill), or reserve it for the President's consideration under Article 201.
However, executive inaction or arbitrary pocket vetoes undermine legislative primacy. The Supreme Court in Rameshwar Prasad (2006) and the landmark Shamsher Singh case (1974) held that the Governor is bound by the aid and advice of the Council of Ministers except in strictly demarcated discretionary spheres.
Furthermore, the Sarkaria Commission (1988) and the Punchhi Commission (2010) explicitly recommended that Governors must decide on bills within a defined timeframe of 6 months.
In conclusion, the office of the Governor must function as an institutional linchpin of cooperative federalism rather than a political impediment, upholding the constitutional morality articulated by Dr. B.R. Ambedkar.`;

    const evalRes = await fetch(`${BASE_URL}/api/v1/mains/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        mainsQuestionId: firstMainsQ.id,
        userAnswer: longAnswer,
      }),
    });
    assert.strictEqual(evalRes.status, 200, "Valid answer evaluation must return 200");
    const evalJson = await evalRes.json();
    assert.ok(evalJson.success, "Evaluation must report success");
    assert.ok(evalJson.evaluation.totalScore > 0, "Must return positive score");
    assert.strictEqual(evalJson.evaluation.dimensions.length, 4, "Must evaluate across 4 UPSC dimensions");
  }
});
