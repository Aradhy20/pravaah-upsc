import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function normalizeFamily(family: string): string {
  const f = (family || '').trim().toUpperCase();
  if (f.includes('CIVIL SERVICES') || f === 'CSE') return 'CSE';
  if (f.includes('FOREST') || f === 'IFOS') return 'IFOS';
  if (f.includes('DEFENCE SERVICES') || f === 'CDS') return 'CDS';
  if (f.includes('DEFENCE ACADEMY') || f === 'NDA') return 'NDA';
  if (f.includes('ARMED POLICE') || f === 'CAPF') return 'CAPF';
  if (f.includes('MEDICAL') || f === 'CMS') return 'CMS';
  if (f.includes('ENGINEERING') || f === 'ESE') return 'ESE';
  if (f.includes('GEO-SCIENTIST') || f === 'CGS') return 'CGS';
  if (f.includes('ECONOMIC') || f.includes('STATISTICAL') || f.includes('IES')) return 'IES_ISS';
  if (f.includes('CISF') || f.includes('LDCE')) return 'CISF_LDCE';
  return 'OTHER';
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'data/corpus_starter_kit/corpus_dump.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Corpus dump file not found at ${jsonPath}. Run export_sqlite.py first.`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const { sources, exams, documents } = JSON.parse(rawData);

  console.log(`Starting PostgreSQL corpus sync...`);
  console.log(`Payload contains: ${sources.length} sources, ${exams.length} exams, ${documents.length} documents.`);

  const runId = `sync-registry-${Date.now()}`;
  const job = await prisma.corpusIngestionJob.create({
    data: {
      runId,
      action: 'SYNC_REGISTRY',
      status: 'RUNNING',
      recordsSeen: sources.length + exams.length + documents.length,
      startedAt: new Date(),
      note: `Syncing official UPSC registry from SQLite starter kit into PostgreSQL.`
    }
  });

  try {
    // 1. Ingest Sources
    console.log(`Syncing ${sources.length} sources...`);
    const sourceIds = new Set<string>();
    for (const s of sources) {
      await prisma.corpusSource.upsert({
        where: { id: s.source_id },
        update: {
          sourceName: s.source_name || s.source_id,
          sourceKind: s.source_kind || 'registry',
          authority: s.authority || 'UPSC',
          url: s.url || '',
          lastChecked: s.last_checked || null,
          observedCount: s.observed_count || null,
          note: s.note || null,
        },
        create: {
          id: s.source_id,
          sourceName: s.source_name || s.source_id,
          sourceKind: s.source_kind || 'registry',
          authority: s.authority || 'UPSC',
          url: s.url || '',
          lastChecked: s.last_checked || null,
          observedCount: s.observed_count || null,
          note: s.note || null,
        }
      });
      sourceIds.add(s.source_id);
    }
    console.log(`✓ Sources synced.`);

    // 2. Ingest Exams
    console.log(`Syncing ${exams.length} exams...`);
    const examIds = new Set<string>();
    for (const e of exams) {
      const year = parseInt(e.year, 10) || 2024;
      const family = normalizeFamily(e.exam_family);
      const sourceId = sourceIds.has(e.source_id) ? e.source_id : null;

      await prisma.corpusExam.upsert({
        where: { id: e.exam_id },
        update: {
          examName: e.exam_name || e.exam_id,
          year,
          examFamily: family,
          sourceId,
          registryStatus: e.registry_status || 'listed',
        },
        create: {
          id: e.exam_id,
          examName: e.exam_name || e.exam_id,
          year,
          examFamily: family,
          sourceId,
          registryStatus: e.registry_status || 'listed',
        }
      });
      examIds.add(e.exam_id);
    }
    console.log(`✓ Exams synced.`);

    // 3. Ingest Documents in batches
    console.log(`Syncing ${documents.length} documents...`);
    const batchSize = 100;
    let docsAdded = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      for (const d of batch) {
        const year = parseInt(d.year, 10) || 2024;
        const examId = examIds.has(d.exam_id) ? d.exam_id : null;
        const sourceId = sourceIds.has(d.source_ref) ? d.source_ref : null;

        await prisma.corpusDocument.upsert({
          where: { id: d.document_id },
          update: {
            examId,
            examName: d.exam_name || '',
            year,
            paper: d.paper || '',
            documentType: d.document_type || 'Question Paper',
            authority: d.authority || 'UPSC',
            sourceUrl: d.source_url || '',
            uploaded: d.uploaded || null,
            fileSize: d.file_size || null,
            verificationStatus: d.verification_status || 'OFFICIAL_REGISTRY_VERIFIED',
            sourceRef: d.source_ref || null,
            localPath: d.local_path || null,
            extractionStatus: d.extraction_status || 'NOT_EXTRACTED',
            note: d.note || null,
            sourceId,
          },
          create: {
            id: d.document_id,
            examId,
            examName: d.exam_name || '',
            year,
            paper: d.paper || '',
            documentType: d.document_type || 'Question Paper',
            authority: d.authority || 'UPSC',
            sourceUrl: d.source_url || '',
            uploaded: d.uploaded || null,
            fileSize: d.file_size || null,
            verificationStatus: d.verification_status || 'OFFICIAL_REGISTRY_VERIFIED',
            sourceRef: d.source_ref || null,
            localPath: d.local_path || null,
            extractionStatus: d.extraction_status || 'NOT_EXTRACTED',
            note: d.note || null,
            sourceId,
          }
        });
        docsAdded++;
      }
      process.stdout.write(`Processed ${docsAdded}/${documents.length} documents...\r`);
    }
    console.log(`\n✓ All ${docsAdded} documents synced successfully.`);

    // 4. Update Job status
    await prisma.corpusIngestionJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
        recordsAdded: sources.length + exams.length + docsAdded,
        note: `Successfully imported ${sources.length} sources, ${exams.length} exams, and ${docsAdded} official documents into PostgreSQL.`
      }
    });

    // 5. Verification summary
    const totalSources = await prisma.corpusSource.count();
    const totalExams = await prisma.corpusExam.count();
    const totalDocs = await prisma.corpusDocument.count();
    const qpDocs = await prisma.corpusDocument.count({ where: { documentType: 'Question Paper' } });
    const akDocs = await prisma.corpusDocument.count({ where: { documentType: 'Answer Key' } });

    console.log('\n=============================================');
    console.log('POSTGRESQL CORPUS INGESTION VERIFICATION');
    console.log('=============================================');
    console.log(`Total Corpus Sources:        ${totalSources}`);
    console.log(`Total Corpus Exams:          ${totalExams}`);
    console.log(`Total Corpus Documents:      ${totalDocs}`);
    console.log(`  - Question Papers:         ${qpDocs}`);
    console.log(`  - Official Answer Keys:    ${akDocs}`);
    console.log(`  - Other Official Docs:     ${totalDocs - qpDocs - akDocs}`);
    console.log('=============================================\n');

  } catch (err: any) {
    console.error('Error during corpus sync:', err);
    await prisma.corpusIngestionJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errors: 1,
        note: `Failed with error: ${err.message}`
      }
    });
    throw err;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
