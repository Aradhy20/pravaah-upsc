import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("UPSC ExamGOAL PDF Ingestion & Question Bank Engine Suite", async (t) => {
  await t.test("1. Source PDFs and Import Structure Integrity", async () => {
    const importDir = path.join(process.cwd(), "data", "imports", "examgoal");
    assert.ok(fs.existsSync(importDir), "data/imports/examgoal directory must exist");

    const inventoryPath = path.join(process.cwd(), "data", "imports", "reports", "pdf_source_inventory.json");
    assert.ok(fs.existsSync(inventoryPath), "PDF inventory manifest must exist");

    const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
    assert.equal(inventory.length, 145, "Must track all 145 source PDFs from untitled folder");

    const yearPapers = inventory.filter((f) => f.is_year_paper);
    assert.equal(yearPapers.length, 24, "Must identify all 24 year-wise Prelims papers (2021-2026)");

    const hindiPapers = inventory.filter((f) => f.language === "hi");
    const englishPapers = inventory.filter((f) => f.language === "en");
    assert.equal(hindiPapers.length, 72, "Must track 72 Hindi PDFs");
    assert.equal(englishPapers.length, 73, "Must track 73 English PDFs");
  });

  await t.test("2. Processed Extraction Artifacts & Bilingual Completeness", async () => {
    const extractedPath = path.join(process.cwd(), "data", "imports", "processed", "all_extracted_questions.json");
    assert.ok(fs.existsSync(extractedPath), "all_extracted_questions.json must exist");

    const questions = JSON.parse(fs.readFileSync(extractedPath, "utf-8"));
    assert.equal(questions.length, 1080, "Must extract exactly 1,080 bilingual questions across 12 papers");

    let withHindi = 0;
    let withAnswers = 0;
    let fourOptions = 0;

    for (const q of questions) {
      assert.ok(q.questionTextEn && q.questionTextEn.trim().length > 5, `Q${q.questionNumber} must have English text`);
      if (q.questionTextHi && q.questionTextHi.trim().length > 5) withHindi++;
      if (q.correctOption && ["A", "B", "C", "D"].includes(q.correctOption)) withAnswers++;
      if (q.options && q.options.length === 4) fourOptions++;
    }

    assert.equal(withHindi, 1080, "100% of extracted questions must have human-verified Devanagari text");
    assert.equal(fourOptions, 1080, "100% of extracted questions must have 4 options (A, B, C, D)");
    assert.ok(withAnswers >= 1079, "99.9%+ of extracted questions must have verified official answer keys");
  });

  await t.test("3. PostgreSQL Database Population & Schema Health", async () => {
    const totalQuestions = await prisma.question.count();
    assert.ok(totalQuestions >= 2560, `Total questions in DB (${totalQuestions}) must be >= 2,560`);

    const csatPaper = await prisma.paper.findFirst({ where: { code: "GS2" } });
    assert.ok(csatPaper, "GS2 (CSAT) paper must exist");

    const csatQuestions = await prisma.question.count({ where: { paperId: csatPaper.id } });
    assert.ok(csatQuestions >= 480, `CSAT questions (${csatQuestions}) must eliminate previous deficit`);

    const withHindiInDB = await prisma.question.count({ where: { questionTextHi: { not: null } } });
    assert.ok(withHindiInDB >= 1100, `Questions with verified Hindi text (${withHindiInDB}) must be >= 1,100`);

    const answerKeyCount = await prisma.answerKeyVersion.count();
    assert.ok(answerKeyCount >= 2600, `AnswerKeyVersion records (${answerKeyCount}) must be >= 2,600`);

    const questionAnswerCount = await prisma.questionAnswer.count();
    assert.ok(questionAnswerCount >= 2560, `QuestionAnswer records (${questionAnswerCount}) must be >= 2,560`);
  });

  await t.test("4. 1:1 English-Hindi Option Alignment & Correct Answer Integrity", async () => {
    const csatPaper = await prisma.paper.findFirst({ where: { code: "GS2" } });
    const sampleQ = await prisma.question.findUnique({
      where: {
        paperId_year_questionNumber: {
          paperId: csatPaper.id,
          year: 2024,
          questionNumber: 1,
        },
      },
      include: {
        options: { orderBy: { optionCode: "asc" } },
        answers: true,
      },
    });

    assert.ok(sampleQ, "CSAT 2024 Q1 must exist in DB");
    assert.equal(sampleQ.options.length, 4, "Must have exactly 4 options");
    assert.ok(sampleQ.questionTextEn.includes("cube into 64"), "English text must match official booklet");
    assert.ok(sampleQ.questionTextHi.includes("घन को 64"), "Hindi text must match official booklet");

    // Mathematically verified answer: 9 cuts (Option B)
    const correctOpt = sampleQ.options.find((o) => o.isCorrect);
    assert.equal(correctOpt?.optionCode, "B", "Correct option in options must be B");
    assert.equal(sampleQ.answers[0]?.answerOption, "B", "Canonical answer in QuestionAnswer must be B");
  });

  await t.test("5. Export and Provenance Audit Files", async () => {
    const csvExport = path.join(process.cwd(), "exports", "import_audit_report.csv");
    assert.ok(fs.existsSync(csvExport), "exports/import_audit_report.csv must exist");

    const content = fs.readFileSync(csvExport, "utf-8");
    const lines = content.trim().split("\n");
    assert.equal(lines.length, 1081, "CSV export must contain header + 1,080 question records");
  });
});
