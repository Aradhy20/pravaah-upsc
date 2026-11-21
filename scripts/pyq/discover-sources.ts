import fs from 'node:fs';
import path from 'node:path';

export interface SourceDiscoveryResult {
  id: string;
  name: string;
  url: string;
  category: 'PDF_ARCHIVE' | 'YEAR_WISE_PRACTICE' | 'CHAPTER_TAXONOMY' | 'INSTITUTE_SYLLABUS';
  status: 'ACCESSIBLE' | 'PARTIALLY_RESTRICTED' | 'UNREACHABLE';
  httpStatus: number;
  availableYears: number[];
  discoveredItemsCount: number;
  licenseTerms: string;
  reusePermissionStatus: 'AUTHORIZED_OFFICIAL_RECORDS_ONLY' | 'METADATA_AND_TAXONOMY_ONLY' | 'RESTRICTED_PAID_CONTENT';
  discoveredMetadata: Record<string, any>;
  lastRetrievedAt: string;
}

export async function discoverAllSources(): Promise<SourceDiscoveryResult[]> {
  console.log('🔍 [Pravaah PYQ ETL] Initiating external intelligence source discovery...\n');

  const sourcesToProbe = [
    {
      id: 'examgoal_pdf_archive',
      name: 'ExamGOAL UPSC Civil Services PDF Archive',
      url: 'https://pdf.questions.examgoal.com/past-years/year-wise/civil-services/upsc-civil-service',
      category: 'PDF_ARCHIVE' as const,
      licenseTerms: 'Free PDF distribution of official past papers with QR codes. Derivative solutions are proprietary; original question papers are official public domain examination records.',
      reusePermissionStatus: 'AUTHORIZED_OFFICIAL_RECORDS_ONLY' as const,
    },
    {
      id: 'examside_year_wise',
      name: 'ExamSIDE UPSC CSE Year-Wise Practice',
      url: 'https://questions.examside.com/past-years/year-wise/civil-services/upsc-civil-service',
      category: 'YEAR_WISE_PRACTICE' as const,
      licenseTerms: 'Web practice platform. Practice interface and custom explanations are proprietary; underlying UPSC questions and syllabus mapping reference official gazettes.',
      reusePermissionStatus: 'AUTHORIZED_OFFICIAL_RECORDS_ONLY' as const,
    },
    {
      id: 'examside_chapter_wise',
      name: 'ExamSIDE UPSC CSE Chapter-Wise Classification',
      url: 'https://questions.examside.com/past-years/civil-services/upsc-civil-service',
      category: 'CHAPTER_TAXONOMY' as const,
      licenseTerms: 'Publicly visible educational taxonomy and topic categorization for UPSC CSE. Used for academic cross-referencing and topic tagging.',
      reusePermissionStatus: 'METADATA_AND_TAXONOMY_ONLY' as const,
    },
    {
      id: 'human_peritus_csat',
      name: 'Human Peritus UPSC CSAT Strategic Analysis & Public Syllabus',
      url: 'https://humanperitus.in/upsc-csat/',
      category: 'INSTITUTE_SYLLABUS' as const,
      licenseTerms: 'Strictly proprietary commercial test series and coaching material. Public syllabus coverage and topic distribution reused for taxonomy guidance only. Paid mock tests and course notes are strictly excluded.',
      reusePermissionStatus: 'RESTRICTED_PAID_CONTENT' as const,
    },
  ];

  const results: SourceDiscoveryResult[] = [];

  for (const src of sourcesToProbe) {
    console.log(`Checking ${src.name} (${src.url})...`);
    try {
      const res = await fetch(src.url, {
        headers: {
          'User-Agent': 'Pravaah-UPSC-ETL/1.0 (+https://pravaah-upsc.vercel.app/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const text = await res.text();
      const yearsFound = [...new Set([...text.matchAll(/20[0-2][0-9]/g)].map((m) => parseInt(m[0])))].sort((a, b) => b - a);

      let discoveredItemsCount = 0;
      const discoveredMetadata: Record<string, any> = {
        contentLength: text.length,
        contentType: res.headers.get('content-type'),
      };

      if (src.id === 'examgoal_pdf_archive') {
        const paperLinks = [...text.matchAll(/\/past-years\/year-wise\/civil-services\/upsc-civil-service\/([a-z0-9-]+)/g)].map((m) => m[1]);
        const unique = [...new Set(paperLinks)];
        discoveredItemsCount = unique.length;
        discoveredMetadata.papersDiscovered = unique;
      } else if (src.id === 'examside_chapter_wise') {
        const categories = [...text.matchAll(/\/past-years\/civil-services\/upsc-civil-service\/([a-z0-9-]+)/g)].map((m) => m[1]);
        const unique = [...new Set(categories)];
        discoveredItemsCount = unique.length;
        discoveredMetadata.categoriesDiscovered = unique;
      } else if (src.id === 'examside_year_wise') {
        const yearLinks = [...text.matchAll(/\/past-years\/year-wise\/civil-services\/upsc-civil-service\/[0-9]+/g)].map((m) => m[0]);
        discoveredItemsCount = [...new Set(yearLinks)].length;
        discoveredMetadata.yearLinksCount = discoveredItemsCount;
      } else if (src.id === 'human_peritus_csat') {
        const headings = [...text.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
        discoveredItemsCount = headings.length;
        discoveredMetadata.publicSectionHeadings = headings.slice(0, 8);
      }

      results.push({
        id: src.id,
        name: src.name,
        url: src.url,
        category: src.category,
        status: res.ok ? 'ACCESSIBLE' : 'UNREACHABLE',
        httpStatus: res.status,
        availableYears: yearsFound.filter((y) => y >= 1995 && y <= 2026),
        discoveredItemsCount,
        licenseTerms: src.licenseTerms,
        reusePermissionStatus: src.reusePermissionStatus,
        discoveredMetadata,
        lastRetrievedAt: new Date().toISOString(),
      });

      console.log(`  ✓ Status: ${res.status} | Discovered items: ${discoveredItemsCount} | Years: ${yearsFound.slice(0, 5).join(', ')}...\n`);
    } catch (e: any) {
      console.error(`  ✗ Error probing ${src.name}: ${e.message}\n`);
      results.push({
        id: src.id,
        name: src.name,
        url: src.url,
        category: src.category,
        status: 'UNREACHABLE',
        httpStatus: 0,
        availableYears: [],
        discoveredItemsCount: 0,
        licenseTerms: src.licenseTerms,
        reusePermissionStatus: src.reusePermissionStatus,
        discoveredMetadata: { error: e.message },
        lastRetrievedAt: new Date().toISOString(),
      });
    }
  }

  const outDir = path.join(process.cwd(), 'data', 'pyq');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'sources_discovery.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 Saved source discovery registry to: ${outPath}`);

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('discover-sources.ts')) {
  discoverAllSources().catch((err) => {
    console.error('Fatal discovery error:', err);
    process.exit(1);
  });
}
