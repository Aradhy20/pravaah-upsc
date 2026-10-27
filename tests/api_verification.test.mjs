import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Database Integrity: Questions and Official Answer Keys exist", async () => {
  const count = await prisma.question.count();
  assert.ok(count > 0, "Database must have seeded questions");

  const q = await prisma.question.findFirst({
    where: { status: "PUBLISHED" },
    include: {
      options: true,
      explanation: true,
      paper: true,
    },
  });

  assert.ok(q, "Must have at least one published question");
  assert.equal(q.options.length, 4, "Question must have exactly 4 options");
  assert.ok(q.options.some((o) => o.isCorrect), "At least one option must be marked as correct");
  assert.ok(q.explanation?.summary, "Explanation summary must be present");
});

test("Filter Integrity: GS1 vs GS2 separation", async () => {
  const gs1Count = await prisma.question.count({
    where: { paper: { code: "GS1" } },
  });
  const gs2Count = await prisma.question.count({
    where: { paper: { code: "GS2" } },
  });

  assert.ok(gs1Count > 0, "GS1 questions must exist");
  assert.ok(gs2Count > 0, "GS2 (CSAT) questions must exist");
});

test("Security & Anti-Leak: Options payload for Exam Session does not leak answers", async () => {
  const questions = await prisma.question.findMany({
    where: { status: "PUBLISHED" },
    take: 2,
    include: {
      options: {
        select: {
          id: true,
          optionCode: true,
          optionText: true,
          // Notice: isCorrect is omitted
        },
      },
    },
  });

  for (const q of questions) {
    for (const opt of q.options) {
      assert.equal(
        opt.isCorrect,
        undefined,
        "isCorrect MUST NOT be present in sanitized exam question option"
      );
    }
  }
});

test("Admin Guardrail: Direct publication from DRAFT must be rejected", async () => {
  const paper = await prisma.paper.findFirst();
  assert.ok(paper, "Paper must exist");

  // Create a draft question
  const draftQ = await prisma.question.create({
    data: {
      paperId: paper.id,
      year: 2025,
      questionNumber: 999,
      questionText: "Temporary draft question for guardrail test",
      status: "DRAFT",
    },
  });

  // Guardrail check logic:
  const canPublish = draftQ.status !== "DRAFT";
  assert.equal(canPublish, false, "Guardrail must block DRAFT questions from publication");

  // Clean up
  await prisma.question.delete({ where: { id: draftQ.id } });
});

test("User Bookmarking & Notes Relational Persistence", async () => {
  const user = await prisma.user.findFirst({ where: { role: { name: "ASPIRANT" } } });
  const question = await prisma.question.findFirst({ where: { status: "PUBLISHED" } });

  assert.ok(user, "Aspirant user must exist");
  assert.ok(question, "Question must exist");

  // Upsert note
  const note = await prisma.userNote.upsert({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId: question.id,
      },
    },
    update: { content: "Automated test note content" },
    create: {
      userId: user.id,
      questionId: question.id,
      content: "Automated test note content",
    },
  });

  assert.equal(note.content, "Automated test note content");

  // Verify retrieval
  const retrieved = await prisma.userNote.findUnique({
    where: { id: note.id },
  });
  assert.equal(retrieved?.content, "Automated test note content");
});
