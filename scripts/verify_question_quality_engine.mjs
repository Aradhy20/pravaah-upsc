import { PrismaClient } from "@prisma/client";
import assert from "node:assert";
import {
  stageQuestionRecord,
  approveStagedRecord,
  rejectStagedRecord,
  publishStagedRecord,
} from "./pyq/stage-questions";

const prisma = new PrismaClient();

async function runQualityEngineVerification() {
  console.log("=========================================");
  console.log("🛡️ PHASE 3: QUESTION QUALITY ENGINE VERIFICATION");
  console.log("=========================================\n");

  const testAdminId = "cmvqr30mz00015y3bpqyf91d4"; // seeded admin user id or admin@pravaah.in

  // 1. Test Quality Gate: Invalid Question (Short Stem)
  console.log("Test 1: Reject Question with Stem < 10 chars");
  const badStem = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 991,
    questionTextEn: "Short?",
    options: [
      { code: "A", textEn: "Opt A", isCorrect: true },
      { code: "B", textEn: "Opt B", isCorrect: false },
      { code: "C", textEn: "Opt C", isCorrect: false },
      { code: "D", textEn: "Opt D", isCorrect: false },
    ],
  });
  assert.ok(badStem.validationErrors.some((e) => e.includes("at least 10 characters")));
  assert.strictEqual(badStem.record.workflowStatus, "AWAITING_VERIFICATION");
  console.log("  ✓ Correctly flagged short stem and set status to AWAITING_VERIFICATION");

  // 2. Test Quality Gate: Invalid Option Count (< 4)
  console.log("\nTest 2: Reject Question with Option Count !== 4");
  const badOptions = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 992,
    questionTextEn: "Valid question stem explaining constitutional rights in India.",
    options: [
      { code: "A", textEn: "Opt A", isCorrect: true },
      { code: "B", textEn: "Opt B", isCorrect: false },
      { code: "C", textEn: "Opt C", isCorrect: false },
    ],
  });
  assert.ok(badOptions.validationErrors.some((e) => e.includes("must be exactly 4")));
  assert.strictEqual(badOptions.record.workflowStatus, "AWAITING_VERIFICATION");
  console.log("  ✓ Correctly flagged missing options (found 3)");

  // 3. Test Quality Gate: Missing Correct Answer
  console.log("\nTest 3: Reject Question with Zero Correct Answers");
  const noCorrect = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 993,
    questionTextEn: "Valid question stem discussing macroeconomic monetary policy.",
    options: [
      { code: "A", textEn: "Opt A", isCorrect: false },
      { code: "B", textEn: "Opt B", isCorrect: false },
      { code: "C", textEn: "Opt C", isCorrect: false },
      { code: "D", textEn: "Opt D", isCorrect: false },
    ],
  });
  assert.ok(noCorrect.validationErrors.some((e) => e.includes("exactly 1 correct answer")));
  console.log("  ✓ Correctly flagged zero correct answers");

  // 4. Test Valid Staged Question Lifecycle
  console.log("\nTest 4: Full Valid Ingestion Lifecycle (STAGE -> VERIFY -> APPROVE -> PUBLISH)");
  const validStaging = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 999,
    questionFormat: "MULTI_STATEMENT",
    questionTextEn: "Consider the following statements regarding the Finance Commission of India:\n1. It is a quasi-judicial body constituted by the President under Article 280.\n2. Its recommendations are legally binding on the Union Government.\nWhich of the statements given above is/are correct?",
    questionTextHi: "भारत के वित्त आयोग के संदर्भ में निम्नलिखित कथनों पर विचार कीजिए:\n1. यह अनुच्छेद 280 के तहत राष्ट्रपति द्वारा गठित एक अर्ध-न्यायिक निकाय है।\n2. इसकी सिफारिशें केंद्र सरकार पर कानूनी रूप से बाध्यकारी हैं।\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?",
    options: [
      { code: "A", textEn: "1 only", textHi: "केवल 1", isCorrect: true },
      { code: "B", textEn: "2 only", textHi: "केवल 2", isCorrect: false },
      { code: "C", textEn: "Both 1 and 2", textHi: "1 और 2 दोनों", isCorrect: false },
      { code: "D", textEn: "Neither 1 nor 2", textHi: "न तो 1, न ही 2", isCorrect: false },
    ],
    officialAnswer: "A",
    explanationEn: "Statement 1 is correct: Article 280 provides for the Finance Commission as a quasi-judicial body. Statement 2 is incorrect: Recommendations are advisory in nature.",
    explanationHi: "कथन 1 सही है: अनुच्छेद 280 वित्त आयोग का प्रावधान करता है। कथन 2 गलत है: सिफारिशें केवल सलाहकार प्रकृति की होती हैं।",
    sourceCitation: "Constitution of India, Article 280; Indian Polity by M. Laxmikanth",
  });

  assert.strictEqual(validStaging.validationErrors.length, 0);
  assert.strictEqual(validStaging.record.workflowStatus, "VERIFIED");
  console.log("  ✓ Valid staging record automatically achieved status: VERIFIED");

  // Approve Record
  const approved = await approveStagedRecord(prisma, validStaging.record.id, testAdminId);
  assert.strictEqual(approved.workflowStatus, "APPROVED_FOR_PUBLICATION");
  console.log("  ✓ Admin approval transitioned status to: APPROVED_FOR_PUBLICATION");

  // Publish Record to Production Question Bank
  const publishedQuestion = await publishStagedRecord(prisma, validStaging.record.id, testAdminId);
  assert.strictEqual(publishedQuestion.status, "PUBLISHED");
  assert.strictEqual(publishedQuestion.translationStatus, "HUMAN_VERIFIED");
  console.log(`  ✓ Successfully published to canonical Question table (ID: ${publishedQuestion.id})`);

  // Verify Options in Database
  const optionsInDb = await prisma.questionOption.findMany({
    where: { questionId: publishedQuestion.id },
  });
  assert.strictEqual(optionsInDb.length, 4);
  assert.strictEqual(optionsInDb.find((o) => o.optionCode === "A")?.isCorrect, true);
  console.log("  ✓ Options and answer key verified in QuestionOption table");

  // Verify Explanation in Database
  const expInDb = await prisma.explanation.findUnique({
    where: { questionId: publishedQuestion.id },
  });
  assert.ok(expInDb?.detailedExplanation.includes("Article 280"));
  assert.ok(expInDb?.explanationHi?.includes("अनुच्छेद 280"));
  console.log("  ✓ Bilingual explanations verified in Explanation table");

  // Cleanup Test Artifacts
  await prisma.question.delete({ where: { id: publishedQuestion.id } });
  await prisma.questionStagingRecord.deleteMany({
    where: { questionNumber: { in: [991, 992, 993, 999] }, year: 2026 },
  });
  console.log("  ✓ Cleaned up test staging and published records cleanly.");

  console.log("\n=========================================");
  console.log("✅ ALL QUALITY ENGINE TESTS PASSED (100%)");
  console.log("=========================================\n");
}

runQualityEngineVerification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
