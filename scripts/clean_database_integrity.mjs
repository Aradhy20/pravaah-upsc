import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=========================================");
  console.log("🧹 PRAVAAH UPSC: DATABASE DEDUPLICATION & INTEGRITY REPAIR");
  console.log("=========================================");

  // 1. Repair Canonical Question for Servants of India Society
  const canonicalId = "cmvqybrjf002614n9z4s4mntd";
  const canonical = await prisma.question.findUnique({
    where: { id: canonicalId },
    include: { options: true },
  });

  if (canonical) {
    console.log("🔧 Repairing canonical Servants of India Society question...");
    await prisma.question.update({
      where: { id: canonicalId },
      data: {
        questionNumber: 52,
        questionText:
          "With reference to Indian history, who was the founder of the 'Servants of India Society' in 1905?",
        questionTextEn:
          "With reference to Indian history, who was the founder of the 'Servants of India Society' in 1905?",
        questionTextHi:
          "भारतीय इतिहास के संदर्भ में, 1905 में 'सर्वेंट्स ऑफ इंडिया सोसाइटी' (भारत सेवक समाज) के संस्थापक कौन थे?",
        difficulty: "EASY",
        status: "PUBLISHED",
      },
    });

    // Delete broken options and create authentic 4 options
    await prisma.questionOption.deleteMany({ where: { questionId: canonicalId } });
    await prisma.questionOption.createMany({
      data: [
        {
          questionId: canonicalId,
          optionCode: "A",
          optionText: "Gopal Krishna Gokhale",
          optionTextEn: "Gopal Krishna Gokhale",
          optionTextHi: "गोपाल कृष्ण गोखले",
          optionOrder: 1,
          isCorrect: true,
        },
        {
          questionId: canonicalId,
          optionCode: "B",
          optionText: "Bal Gangadhar Tilak",
          optionTextEn: "Bal Gangadhar Tilak",
          optionTextHi: "बाल गंगाधर तिलक",
          optionOrder: 2,
          isCorrect: false,
        },
        {
          questionId: canonicalId,
          optionCode: "C",
          optionText: "Lala Lajpat Rai",
          optionTextEn: "Lala Lajpat Rai",
          optionTextHi: "लाला लाजपत राय",
          optionOrder: 3,
          isCorrect: false,
        },
        {
          questionId: canonicalId,
          optionCode: "D",
          optionText: "Dadabhai Naoroji",
          optionTextEn: "Dadabhai Naoroji",
          optionTextHi: "दादाभाई नौरोजी",
          optionOrder: 4,
          isCorrect: false,
        },
      ],
    });

    // Upsert official answer
    await prisma.questionAnswer.deleteMany({ where: { questionId: canonicalId } });
    await prisma.questionAnswer.create({
      data: {
        questionId: canonicalId,
        answerOption: "A",
        answerType: "FINAL",
        answerKeyType: "UPSC_FINAL_KEY",
        answerProvenance: "UPSC_OFFICIAL_FINAL",
        verificationStatus: "OFFICIALLY_VERIFIED",
      },
    });

    // Upsert explanation
    await prisma.explanation.upsert({
      where: { questionId: canonicalId },
      update: {
        summary:
          "Gopal Krishna Gokhale founded the Servants of India Society in 1905 in Pune, Maharashtra.",
        detailedExplanation:
          "The Servants of India Society was formed in Pune, Maharashtra, on June 12, 1905, by Gopal Krishna Gokhale. Its objective was to train national missionaries for the service of India and promote by all constitutional means the true interests of the Indian people through education and social reform.",
      },
      create: {
        questionId: canonicalId,
        summary:
          "Gopal Krishna Gokhale founded the Servants of India Society in 1905 in Pune, Maharashtra.",
        detailedExplanation:
          "The Servants of India Society was formed in Pune, Maharashtra, on June 12, 1905, by Gopal Krishna Gokhale. Its objective was to train national missionaries for the service of India and promote by all constitutional means the true interests of the Indian people through education and social reform.",
      },
    });
    console.log("✅ Canonical question repaired successfully.");
  }

  // 2. Delete the 8 duplicate stub questions
  const duplicateStubIds = [
    "cmwqso8s4004udsalbtl23q9p",
    "cmwqt47z7008sdsaly775jzkj",
    "cmwquk2ot0047yp5ucels4uyd",
    "cmwquuxm7002yde6ertxiflk3",
    "cmwquxrmj008kde6eqxue63dc",
    "cmwqv3jth005al0deqjbeqgch",
    "cmwqv4sip00c8l0de3uwzzk22",
    "cmwqy7m8000jel0del3iqxo7g",
  ];

  for (const dupId of duplicateStubIds) {
    try {
      await prisma.explanation.deleteMany({ where: { questionId: dupId } });
      await prisma.questionOption.deleteMany({ where: { questionId: dupId } });
      await prisma.questionAnswer.deleteMany({ where: { questionId: dupId } });
      await prisma.testQuestion.deleteMany({ where: { questionId: dupId } });
      await prisma.question.delete({ where: { id: dupId } });
      console.log(`🗑️ Deleted duplicate stub question: ${dupId}`);
    } catch (e) {
      console.warn(`Could not delete stub ${dupId}:`, e.message);
    }
  }

  // 3. Deduplicate Mains Questions
  // Keep authentic unique year for each theme, delete identical cloned records
  const mainsDups = await prisma.mainsQuestion.findMany({
    orderBy: { createdAt: "asc" },
  });

  const seenMains = new Set();
  let deletedMainsCount = 0;

  for (const mq of mainsDups) {
    const key = mq.questionText.trim().toLowerCase();
    if (seenMains.has(key)) {
      // Duplicate clone -> delete
      try {
        await prisma.mainsDraft.deleteMany({ where: { mainsQuestionId: mq.id } });
        await prisma.mainsQuestion.delete({ where: { id: mq.id } });
        deletedMainsCount++;
      } catch (e) {
        console.warn(`Could not delete duplicate mains question ${mq.id}:`, e.message);
      }
    } else {
      seenMains.add(key);
    }
  }
  console.log(`✅ Deduplicated Mains questions: removed ${deletedMainsCount} cloned duplicates.`);

  // 4. Verification Counts
  const totalQuestions = await prisma.question.count();
  const totalMains = await prisma.mainsQuestion.count();
  const gs1Count = await prisma.question.count({ where: { paper: { code: "GS1" } } });
  const gs2Count = await prisma.question.count({ where: { paper: { code: "GS2" } } });

  console.log("=========================================");
  console.log(`📊 Total Prelims Questions: ${totalQuestions} (GS1: ${gs1Count}, GS2: ${gs2Count})`);
  console.log(`📊 Total Unique Mains Questions: ${totalMains}`);
  console.log("=========================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
