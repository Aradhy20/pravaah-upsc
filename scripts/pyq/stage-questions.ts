import { PrismaClient } from "@prisma/client";

export interface StagingInput {
  importJobId?: string;
  sourceReference?: string;
  examCategory?: string;
  examStage?: string;
  year: number;
  paperCode: string;
  questionNumber: number;
  questionFormat?: string;
  questionTextEn: string;
  questionTextHi?: string | null;
  options: Array<{
    code: string;
    textEn: string;
    textHi?: string | null;
    isCorrect: boolean;
  }>;
  officialAnswer?: string;
  explanationEn?: string;
  explanationHi?: string | null;
  sourceCitation?: string;
  subjectSlug?: string;
  topicSlug?: string;
  difficulty?: string;
  translationStatus?: string;
}

export async function stageQuestionRecord(prisma: PrismaClient, input: StagingInput) {
  const optionsJson = JSON.stringify(input.options);
  const translationStatus =
    input.translationStatus ||
    (input.questionTextHi && input.questionTextHi.trim().length > 0
      ? "HUMAN_VERIFIED"
      : "TRANSLATION_MISSING");

  const validationErrors: string[] = [];

  // Automated Ingestion Validation Rules
  if (!input.questionTextEn || input.questionTextEn.trim().length < 10) {
    validationErrors.push("Question English stem must be at least 10 characters.");
  }
  if (!input.options || input.options.length !== 4) {
    validationErrors.push(`Options count must be exactly 4, found ${input.options?.length || 0}.`);
  } else {
    const codes = input.options.map((o) => o.code);
    if (!["A", "B", "C", "D"].every((c) => codes.includes(c))) {
      validationErrors.push("Options must strictly contain codes A, B, C, and D.");
    }
    const correctCount = input.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      validationErrors.push(`Question must contain exactly 1 correct answer option, found ${correctCount}.`);
    }
  }
  if (!input.year || input.year < 1995 || input.year > 2026) {
    validationErrors.push(`Exam year ${input.year} is out of permitted range (1995–2026).`);
  }
  if (input.paperCode !== "GS1" && input.paperCode !== "GS2") {
    validationErrors.push(`Paper code must be GS1 or GS2, found '${input.paperCode}'.`);
  }

  const initialStatus = validationErrors.length === 0 ? "VERIFIED" : "AWAITING_VERIFICATION";

  const record = await prisma.questionStagingRecord.upsert({
    where: {
      paperCode_year_questionNumber_examCategory: {
        paperCode: input.paperCode,
        year: input.year,
        questionNumber: input.questionNumber,
        examCategory: input.examCategory || "CSE",
      },
    },
    update: {
      sourceReference: input.sourceReference,
      questionFormat: input.questionFormat || "SINGLE_CHOICE",
      questionTextEn: input.questionTextEn,
      questionTextHi: input.questionTextHi,
      optionsJson,
      officialAnswer: input.officialAnswer || input.options.find((o) => o.isCorrect)?.code || "A",
      explanationEn: input.explanationEn,
      explanationHi: input.explanationHi,
      sourceCitation: input.sourceCitation,
      subjectSlug: input.subjectSlug,
      topicSlug: input.topicSlug,
      difficulty: input.difficulty || "MEDIUM",
      translationStatus,
      validationErrorsJson: validationErrors.length > 0 ? JSON.stringify(validationErrors) : null,
      workflowStatus: initialStatus,
    },
    create: {
      importJobId: input.importJobId,
      sourceReference: input.sourceReference,
      examCategory: input.examCategory || "CSE",
      examStage: input.examStage || "PRELIMS",
      year: input.year,
      paperCode: input.paperCode,
      questionNumber: input.questionNumber,
      questionFormat: input.questionFormat || "SINGLE_CHOICE",
      questionTextEn: input.questionTextEn,
      questionTextHi: input.questionTextHi,
      optionsJson,
      officialAnswer: input.officialAnswer || input.options.find((o) => o.isCorrect)?.code || "A",
      explanationEn: input.explanationEn,
      explanationHi: input.explanationHi,
      sourceCitation: input.sourceCitation,
      subjectSlug: input.subjectSlug,
      topicSlug: input.topicSlug,
      difficulty: input.difficulty || "MEDIUM",
      translationStatus,
      validationErrorsJson: validationErrors.length > 0 ? JSON.stringify(validationErrors) : null,
      workflowStatus: initialStatus,
    },
  });

  return { record, validationErrors };
}

export async function approveStagedRecord(prisma: PrismaClient, stagingId: string, adminId: string) {
  const staged = await prisma.questionStagingRecord.findUnique({
    where: { id: stagingId },
  });
  if (!staged) throw new Error(`Staging record not found: ${stagingId}`);

  if (staged.validationErrorsJson) {
    const errors = JSON.parse(staged.validationErrorsJson);
    if (errors.length > 0) {
      throw new Error(`Cannot approve record with unresolved validation errors: ${errors.join(", ")}`);
    }
  }

  return prisma.questionStagingRecord.update({
    where: { id: stagingId },
    data: {
      workflowStatus: "APPROVED_FOR_PUBLICATION",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });
}

export async function rejectStagedRecord(
  prisma: PrismaClient,
  stagingId: string,
  reason: string,
  adminId: string
) {
  return prisma.questionStagingRecord.update({
    where: { id: stagingId },
    data: {
      workflowStatus: "REJECTED_OR_ARCHIVED",
      rejectionReason: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });
}

export async function publishStagedRecord(prisma: PrismaClient, stagingId: string, adminId: string) {
  const staged = await prisma.questionStagingRecord.findUnique({
    where: { id: stagingId },
  });
  if (!staged) throw new Error(`Staging record not found: ${stagingId}`);

  if (staged.workflowStatus !== "APPROVED_FOR_PUBLICATION" && staged.workflowStatus !== "VERIFIED") {
    throw new Error(`Only VERIFIED or APPROVED questions can be published. Current status: ${staged.workflowStatus}`);
  }

  const paper = await prisma.paper.findFirst({
    where: { code: staged.paperCode },
  });
  if (!paper) throw new Error(`Paper with code ${staged.paperCode} not found in database.`);

  const options: Array<{ code: string; textEn: string; textHi?: string; isCorrect: boolean }> = JSON.parse(
    staged.optionsJson
  );

  // Upsert canonical Question
  const question = await prisma.question.upsert({
    where: {
      paperId_year_questionNumber: {
        paperId: paper.id,
        year: staged.year,
        questionNumber: staged.questionNumber,
      },
    },
    update: {
      questionText: staged.questionTextEn,
      questionTextEn: staged.questionTextEn,
      questionTextHi: staged.questionTextHi,
      questionFormat: staged.questionFormat,
      translationStatus: staged.translationStatus,
      difficulty: staged.difficulty,
      marks: staged.paperCode === "GS1" ? 2.0 : 2.5,
      negativeMarks: staged.paperCode === "GS1" ? 0.666 : 0.833,
      sourceReference: staged.sourceReference,
      status: "PUBLISHED",
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
    create: {
      paperId: paper.id,
      year: staged.year,
      questionNumber: staged.questionNumber,
      questionText: staged.questionTextEn,
      questionTextEn: staged.questionTextEn,
      questionTextHi: staged.questionTextHi,
      questionFormat: staged.questionFormat,
      translationStatus: staged.translationStatus,
      difficulty: staged.difficulty,
      marks: staged.paperCode === "GS1" ? 2.0 : 2.5,
      negativeMarks: staged.paperCode === "GS1" ? 0.666 : 0.833,
      sourceReference: staged.sourceReference,
      status: "PUBLISHED",
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  // Upsert QuestionOptions
  for (const opt of options) {
    await prisma.questionOption.upsert({
      where: {
        questionId_optionCode: {
          questionId: question.id,
          optionCode: opt.code,
        },
      },
      update: {
        optionText: opt.textEn,
        optionTextEn: opt.textEn,
        optionTextHi: opt.textHi || null,
        isCorrect: opt.isCorrect,
      },
      create: {
        questionId: question.id,
        optionCode: opt.code,
        optionText: opt.textEn,
        optionTextEn: opt.textEn,
        optionTextHi: opt.textHi || null,
        isCorrect: opt.isCorrect,
      },
    });
  }

  // Upsert Explanation if present
  if (staged.explanationEn) {
    await prisma.explanation.upsert({
      where: { questionId: question.id },
      update: {
        summary: staged.explanationEn.slice(0, 200),
        detailedExplanation: staged.explanationEn,
        explanationEn: staged.explanationEn,
        explanationHi: staged.explanationHi || null,
        sourceCitation: staged.sourceCitation || staged.sourceReference,
        translationStatus: staged.explanationHi ? "HUMAN_VERIFIED" : "ORIGINAL_SOURCE",
      },
      create: {
        questionId: question.id,
        summary: staged.explanationEn.slice(0, 200),
        detailedExplanation: staged.explanationEn,
        explanationEn: staged.explanationEn,
        explanationHi: staged.explanationHi || null,
        sourceCitation: staged.sourceCitation || staged.sourceReference,
        translationStatus: staged.explanationHi ? "HUMAN_VERIFIED" : "ORIGINAL_SOURCE",
      },
    });
  }

  // Update Staging Record
  await prisma.questionStagingRecord.update({
    where: { id: stagingId },
    data: {
      workflowStatus: "PUBLISHED",
      publishedQuestionId: question.id,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });

  return question;
}
