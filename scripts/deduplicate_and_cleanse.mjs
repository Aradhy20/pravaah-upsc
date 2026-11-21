import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Auditing duplicate synthetic question clusters...');

  const duplicateGroups = await prisma.$queryRaw`
    SELECT "questionText", count(*) as count, array_agg(id) as ids
    FROM "Question"
    GROUP BY "questionText"
    HAVING count(*) > 1
  `;

  console.log(`Found ${duplicateGroups.length} duplicate question text clusters.`);

  let totalDeleted = 0;

  for (const group of duplicateGroups) {
    const [canonicalId, ...redundantIds] = group.ids;

    // Prune redundant clones
    for (const redundantId of redundantIds) {
      // Re-link attempts or test questions to canonical if needed
      await prisma.userAttempt.updateMany({
        where: { questionId: redundantId },
        data: { questionId: canonicalId },
      });
      await prisma.bookmark.deleteMany({
        where: { questionId: redundantId },
      });
      await prisma.questionTopic.deleteMany({
        where: { questionId: redundantId },
      });
      await prisma.questionOption.deleteMany({
        where: { questionId: redundantId },
      });
      await prisma.explanation.deleteMany({
        where: { questionId: redundantId },
      });
      await prisma.questionAnswer.deleteMany({
        where: { questionId: redundantId },
      });
      await prisma.testQuestion.deleteMany({
        where: { questionId: redundantId },
      });

      await prisma.question.delete({
        where: { id: redundantId },
      });

      totalDeleted++;
    }
  }

  console.log(`✅ Deduplication complete! Pruned ${totalDeleted} redundant synthetic clones.`);

  // Verify
  const remainingDupes = await prisma.$queryRaw`
    SELECT "questionText", count(*) as count
    FROM "Question"
    GROUP BY "questionText"
    HAVING count(*) > 1
  `;

  console.log(`Remaining duplicate question texts: ${remainingDupes.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Deduplication Error:', err);
  process.exit(1);
});
