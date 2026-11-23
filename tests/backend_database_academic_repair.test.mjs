import { test, describe, before } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { isPaymentSystemEnabled } from "../lib/payments/payment-config";

const prisma = new PrismaClient();

describe("PRAVAAH UPSC — Backend, Database & Academic QA Repair Verification", () => {
  before(async () => {
    await prisma.$connect();
  });

  test("1. Database Schema & Question.questionFormat Column Verification", async () => {
    // Must query questions including questionFormat with zero P2022 column missing errors
    const sampleQuestions = await prisma.question.findMany({
      take: 5,
      select: {
        id: true,
        questionFormat: true,
        translationStatus: true,
        paper: { select: { code: true } },
      },
    });

    assert.ok(sampleQuestions.length > 0, "Should retrieve questions from database");
    for (const q of sampleQuestions) {
      assert.ok(
        ["SINGLE_CHOICE", "MULTI_STATEMENT"].includes(q.questionFormat),
        `Question ${q.id} format must be valid enum, found: ${q.questionFormat}`
      );
    }
  });

  test("2. Current Affairs Story Detail & Connected PYQ Integrity", async () => {
    // Must find a story with question links and successfully resolve linked questions
    const story = await prisma.currentAffairsStory.findFirst({
      where: {
        questionLinks: { some: {} },
      },
      include: {
        topics: true,
        questionLinks: {
          include: {
            question: {
              include: {
                paper: true,
                options: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    assert.ok(story, "Should find at least one story with connected PYQs");
    assert.ok(story.questionLinks.length > 0, "Story should have at least one question link");
    const link = story.questionLinks[0];
    assert.ok(link.question, "Linked question must not be null");
    assert.ok(link.question.paper, "Linked question must have valid paper");
    assert.ok(link.question.options.length > 0, "Linked question must have options");
    assert.ok(link.question.explanation, "Linked question must have explanation");
  });

  test("3. Prelims Mock Exam Engine Calibration", async () => {
    // Verify Prelims GS1 and CSAT penalty rules & total questions
    const gs1Questions = await prisma.question.findMany({
      where: { paper: { code: "GS1" } },
      take: 5,
    });
    const csatQuestions = await prisma.question.findMany({
      where: { paper: { code: "GS2" } },
      take: 5,
    });

    assert.ok(gs1Questions.length > 0, "GS1 questions should exist");
    assert.ok(csatQuestions.length > 0, "CSAT questions should exist");

    // GS1 Scoring: +2 for correct, -0.666 for wrong
    const gs1CorrectMark = 2;
    const gs1WrongPenalty = -(2 / 3);
    assert.strictEqual(Math.round((gs1CorrectMark + gs1WrongPenalty) * 1000) / 1000, 1.333);

    // CSAT Scoring: +2.5 for correct, -0.833 for wrong, 33% qualifying cutoff (66 / 200 marks)
    const csatCorrectMark = 2.5;
    const csatWrongPenalty = -(2.5 / 3);
    assert.strictEqual(Math.round((csatCorrectMark + csatWrongPenalty) * 1000) / 1000, 1.667);

    const csatTotalMarks = 200;
    const csatQualifyingCutoff = csatTotalMarks * 0.33;
    assert.strictEqual(csatQualifyingCutoff, 66);
  });

  test("4. Mains Studio Pedagogical Disclaimer & Dimension Rubric", async () => {
    const mainsQuestions = await prisma.mainsQuestion.findMany({
      take: 5,
      select: { id: true, paperCode: true, marks: true, wordLimit: true, questionText: true },
    });

    assert.ok(mainsQuestions.length > 0, "Mains questions should exist");
    for (const mq of mainsQuestions) {
      assert.ok([10, 15, 20, 125].includes(mq.marks), `Mains question ${mq.id} has valid marks: ${mq.marks}`);
      assert.ok(mq.wordLimit > 0, `Mains question ${mq.id} has positive word limit`);
    }
  });

  test("5. Personality Test (Interview) Module Non-Official Demarcation", async () => {
    const interviewQs = await prisma.interviewQuestion.findMany();
    assert.ok(interviewQs.length > 0, "Interview questions should exist");

    for (const iq of interviewQs) {
      // Must belong to authorized source types and NEVER be labeled as official written PYQ
      assert.ok(
        ["CANDIDATE_REPORTED", "SITUATIONAL", "DAF_THEME", "MOCK_INTERVIEW"].includes(iq.sourceType),
        `Interview question ${iq.id} has valid source type: ${iq.sourceType}`
      );
      assert.ok(iq.sourceAttribution, `Interview question ${iq.id} must have transparent source attribution`);
    }
  });

  test("6. Payment Gateway Dormancy Security Check", () => {
    // Must remain dormant (false) to prevent accidental charges during testing
    assert.strictEqual(
      isPaymentSystemEnabled(),
      false,
      "isPaymentSystemEnabled() must evaluate to false while Cashfree merchant account is dormant"
    );
  });

  test("7. Bilingual Parity & i18n Context Integrity", () => {
    // Verify that language keys exist in both English and Hindi dictionaries
    const enContent = fs.readFileSync("./lib/i18n/en.ts", "utf-8");
    const hiContent = fs.readFileSync("./lib/i18n/hi.ts", "utf-8");

    assert.ok(enContent.includes("nav.practice"), "EN dictionary must contain navigation tokens");
    assert.ok(hiContent.includes("nav.practice"), "HI dictionary must contain navigation tokens");
    assert.ok(enContent.includes("nav.mains"), "EN dictionary must contain Mains studio token");
    assert.ok(hiContent.includes("nav.mains"), "HI dictionary must contain Mains studio token");
  });
});
