import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAudit() {
  console.log("=========================================");
  console.log("🔍 PHASE 3 — QUESTION BANK DEEP AUDIT");
  console.log("=========================================\n");

  // 1. Prelims Questions
  const allPrelims = await prisma.question.findMany({
    include: {
      paper: true,
      options: true,
      explanation: true,
      topics: {
        include: {
          topic: {
            include: { subject: true }
          }
        }
      },
      citations: true,
      answers: true,
    }
  });

  const totalPrelims = allPrelims.length;
  const gs1Prelims = allPrelims.filter(q => q.paper?.code === "GS1");
  const csatPrelims = allPrelims.filter(q => q.paper?.code === "GS2");

  // 2. Mains Questions
  const allMains = await prisma.mainsQuestion.findMany();
  const mainsGS1 = allMains.filter(q => q.paperCode === "GS1");
  const mainsGS2 = allMains.filter(q => q.paperCode === "GS2");
  const mainsGS3 = allMains.filter(q => q.paperCode === "GS3");
  const mainsGS4 = allMains.filter(q => q.paperCode === "GS4");
  const mainsEssay = allMains.filter(q => q.paperCode === "ESSAY");

  console.log("📊 CORE INVENTORY COUNTS:");
  console.log(`- Prelims Total Questions: ${totalPrelims}`);
  console.log(`  • GS Paper I: ${gs1Prelims.length}`);
  console.log(`  • CSAT (GS Paper II): ${csatPrelims.length}`);
  console.log(`- Mains Total Questions: ${allMains.length}`);
  console.log(`  • GS Paper I: ${mainsGS1.length}`);
  console.log(`  • GS Paper II: ${mainsGS2.length}`);
  console.log(`  • GS Paper III: ${mainsGS3.length}`);
  console.log(`  • GS Paper IV (Ethics): ${mainsGS4.length}`);
  console.log(`  • Essay: ${mainsEssay.length}\n`);

  // 3. Year-wise distribution (Prelims)
  const prelimsByYear = {};
  for (const q of allPrelims) {
    prelimsByYear[q.year] = (prelimsByYear[q.year] || 0) + 1;
  }
  console.log("📅 PRELIMS YEAR-WISE DISTRIBUTION:");
  Object.keys(prelimsByYear)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(yr => console.log(`  • ${yr}: ${prelimsByYear[yr]} questions`));

  // 4. Year-wise distribution (Mains)
  const mainsByYear = {};
  for (const m of allMains) {
    mainsByYear[m.year] = (mainsByYear[m.year] || 0) + 1;
  }
  console.log("\n📅 MAINS YEAR-WISE DISTRIBUTION:");
  Object.keys(mainsByYear)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(yr => console.log(`  • ${yr}: ${mainsByYear[yr]} questions`));

  // 5. Subject-wise distribution (Prelims)
  const prelimsBySubject = {};
  for (const q of allPrelims) {
    const subjName = q.topics[0]?.topic?.subject?.name || "Uncategorized";
    prelimsBySubject[subjName] = (prelimsBySubject[subjName] || 0) + 1;
  }
  console.log("\n📚 PRELIMS SUBJECT-WISE DISTRIBUTION:");
  Object.keys(prelimsBySubject)
    .sort((a, b) => prelimsBySubject[b] - prelimsBySubject[a])
    .forEach(sub => console.log(`  • ${sub}: ${prelimsBySubject[sub]} questions`));

  // 6. Topic-wise distribution (Prelims)
  const prelimsByTopic = {};
  for (const q of allPrelims) {
    const topicName = q.topics[0]?.topic?.name || "General";
    prelimsByTopic[topicName] = (prelimsByTopic[topicName] || 0) + 1;
  }
  console.log("\n🏷️ TOP 15 PRELIMS TOPICS:");
  Object.keys(prelimsByTopic)
    .sort((a, b) => prelimsByTopic[b] - prelimsByTopic[a])
    .slice(0, 15)
    .forEach(top => console.log(`  • ${top}: ${prelimsByTopic[top]} questions`));

  // 7. Content Quality, Language & Verification Breakdown
  let withEnText = 0;
  let withHiText = 0;
  let with4Options = 0;
  let withCorrectOption = 0;
  let withExplanation = 0;
  let withHiExplanation = 0;
  let withCitation = 0;
  let publishedCount = 0;
  let verifiedCount = 0;
  let needsReviewCount = 0;
  let draftCount = 0;
  let officiallyVerified = 0;
  let independentlyCorroborated = 0;

  const duplicatesDetected = [];
  const seenKeys = new Set();

  for (const q of allPrelims) {
    if (q.questionText && q.questionText.trim().length > 0) withEnText++;
    if (q.questionTextHi && q.questionTextHi.trim().length > 0) withHiText++;
    if (q.options.length === 4) with4Options++;
    if (q.options.some(o => o.isCorrect)) withCorrectOption++;
    if (q.explanation && q.explanation.detailedExplanation) withExplanation++;
    if (q.explanation && q.explanation.explanationHi) withHiExplanation++;
    if (q.citations.length > 0 || (q.explanation && q.explanation.sourceCitation)) withCitation++;

    if (q.status === "PUBLISHED") publishedCount++;
    else if (q.status === "VERIFIED") verifiedCount++;
    else if (q.status === "NEEDS_REVIEW") needsReviewCount++;
    else if (q.status === "DRAFT") draftCount++;

    if (q.verificationStatus === "OFFICIALLY_VERIFIED") officiallyVerified++;
    else if (q.verificationStatus === "INDEPENDENTLY_CORROBORATED") independentlyCorroborated++;

    const key = `${q.paperId}-${q.year}-${q.questionNumber}`;
    if (seenKeys.has(key)) {
      duplicatesDetected.push(key);
    }
    seenKeys.add(key);
  }

  console.log("\n🛡️ CONTENT & INTEGRITY METRICS (PRELIMS):");
  console.log(`- English Question Text Coverage: ${withEnText}/${totalPrelims} (${(withEnText/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Hindi Question Text Coverage: ${withHiText}/${totalPrelims} (${(withHiText/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Exactly 4 Options Coverage: ${with4Options}/${totalPrelims} (${(with4Options/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Official Correct Key Coverage: ${withCorrectOption}/${totalPrelims} (${(withCorrectOption/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Pedagogical Explanation Coverage: ${withExplanation}/${totalPrelims} (${(withExplanation/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Hindi Explanation Coverage: ${withHiExplanation}/${totalPrelims} (${(withHiExplanation/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Source Citation Coverage: ${withCitation}/${totalPrelims} (${(withCitation/totalPrelims*100).toFixed(1)}%)`);
  console.log(`- Duplicates Detected: ${duplicatesDetected.length}`);

  console.log("\n📋 STATUS BREAKDOWN:");
  console.log(`- PUBLISHED: ${publishedCount}`);
  console.log(`- VERIFIED: ${verifiedCount}`);
  console.log(`- NEEDS_REVIEW: ${needsReviewCount}`);
  console.log(`- DRAFT: ${draftCount}`);

  console.log("\n🎖️ VERIFICATION STATUS:");
  console.log(`- OFFICIALLY_VERIFIED: ${officiallyVerified}`);
  console.log(`- INDEPENDENTLY_CORROBORATED: ${independentlyCorroborated}`);

  console.log("\n=========================================");
}

runAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
