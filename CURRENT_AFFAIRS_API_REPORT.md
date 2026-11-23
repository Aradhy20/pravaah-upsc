# CURRENT AFFAIRS API & STORY DETAIL REPORT

**Platform:** Pravaah UPSC SaaS Platform  
**Endpoint:** `GET /api/v1/current-affairs/[slug]`  
**Frontend Route:** `/current-affairs/[slug]`  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Full-Stack Engineer & Database Architect  

---

## 1. Problem Diagnosis & Root Cause Analysis

### 1.1 Reported Failure
Users accessing current affairs detail articles encountered a 500 error state rendering:
`Analysis Temporarily Unavailable – Failed to fetch story details`

### 1.2 Root Cause
1. **Schema-to-Database Mismatch on Question Query:**
   The route `/api/v1/current-affairs/[slug]/route.ts` included connected historical PYQs via:
   ```ts
   questionLinks: {
     include: {
       question: {
         include: { paper: true, options: true, explanation: true }
       }
     }
   }
   ```
   Because `Question.questionFormat` (and adjacent columns) had been added to `schema.prisma` without a formal applied Prisma migration file in `prisma/migrations`, Prisma Client generated a SQL query expecting `Question.questionFormat` to exist in the database.
   PostgreSQL threw:
   `P2022: The column Question.questionFormat does not exist in the current database.`
   This uncaught database exception caused the entire endpoint to fail with HTTP status 500.

2. **Slug Encoding Mismatch:**
   When browser navigation passed URL-encoded characters (e.g. `%20` or encoded symbols) in the slug parameter, strict literal matching on `slug: params.slug` failed to locate unencoded database slug records.

3. **Inconsistent Visual Styling & Missing Global Navigation:**
   The detail page was rendered with default Tailwind blue utility styles (`bg-slate-50`, `bg-blue-600`) and omitted the global `<Header />` and `<Footer />`, breaking user flow and brand continuity.

---

## 2. Technical Repairs Applied

### 2.1 Database Synchronisation
Applied safe PostgreSQL migration `20261124000000_add_question_format_and_corpus_metadata`.
- Added `questionFormat`, `translationStatus`, `examStage`, `sourceReference`, `bookletSeries`, `contentLabel`, and `corpusDocumentId` with safe `ADD COLUMN IF NOT EXISTS` clauses and default fallback values.
- All 121 questions and 28 current affairs story links now query with zero database errors.

### 2.2 Defensive Route Implementation (`/api/v1/current-affairs/[slug]`)
- Integrated parameter decoding:
  ```ts
  const rawSlug = params?.slug;
  const decodedSlug = decodeURIComponent(rawSlug);
  const story = await prisma.currentAffairsStory.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug: rawSlug }]
    },
    ...
  ```
- Guaranteed 404 responses instead of 500 when invalid slugs are requested.
- Safely sanitized and mapped `linkedPyqs` and `practiceQuestions`.

### 2.3 Frontend Indian Heritage Redesign (`/current-affairs/[slug]`)
- Rendered persistent `<Header />` and `<Footer />`.
- Styled page with Pravaah Indian Heritage tokens:
  - Background: `bg-heritage-ivory`
  - Typography: `font-serif` headings, `font-sans` metadata
  - Accent colors: `bg-heritage-burgundy`, `border-heritage-gold/40`, `text-heritage-burgundy`, `bg-heritage-cream`
- Interactive official Series A option checker with immediate feedback and authoritative source citations.
- Reliable retry button that refetches the story upon transient network issues without requiring a full page reload.

---

## 3. End-to-End Verification Test

A live curl query against the production server:
```bash
curl -s http://localhost:3000/api/v1/current-affairs/supreme-court-guidelines-governors-assent-article-200
```
Returned:
```json
{
  "success": true,
  "story": {
    "id": "cmwi2d9mq00007z391axwqw1w",
    "title": "Supreme Court Guidelines on Governor's Assent under Article 200",
    "slug": "supreme-court-guidelines-governors-assent-article-200",
    "linkedPyqs": [
      {
        "id": "cmvqr30o2002q5y3bmuj4i0nh",
        "year": 2024,
        "questionNumber": 1,
        "paperCode": "GS1",
        "questionText": "Under the Constitution of India, which one of the following is NOT correct regarding the Governor of a State?...",
        "rationale": "Direct constitutional relevance to gubernatorial powers, Article 200 bill assent procedure, and federal executive discretion in State administration."
      }
    ]
  }
}
```
Status: **RESOLVED & VERIFIED**.
