# Pravaah UPSC — Phase 5 Data Quality, Content Integrity & PYQ Audit

**Date:** November 23, 2026  
**Auditor:** Principal Data Architect & UPSC Content Specialist  
**Application:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Scope:** Database Content, Question Counts, Topic Mappings, Current Affairs Linking, Explanation Standards  
**Status:** Audit Completed & Issues Resolved

---

## 1. Question Count Discrepancy Investigation & Single Source of Truth

### 1.1 Reported Inconsistencies
Prior to this audit, conflicting question counts were reported across different platform touchpoints:
- **Homepage:** 121 Verified Questions
- **PYQ Explorer:** 74 Questions
- **Public Inventory API:** 120 Questions
- **Current Affairs & System Flow descriptions:** 1,079 Questions

### 1.2 Root Cause Analysis
A direct query of the production PostgreSQL database (`Question`, `Paper`, and `MainsQuestion` tables) revealed the exact mathematical reality:

```sql
SELECT p.code, COUNT(q.id) as count 
FROM "Paper" p 
LEFT JOIN "Question" q ON q."paperId" = p.id AND q.status = 'PUBLISHED' 
GROUP BY p.code;
```
- **General Studies Paper I (GS1):** 74 published questions
- **General Studies Paper II (CSAT):** 47 published questions
- **Total Published Prelims Questions:** **121** (74 + 47 = 121)
- **Mains Answer Studio Questions:** **32** authentic questions across GS1–GS4 and Essay
- **Total Questions in Database:** **153** (121 Prelims + 32 Mains)

### 1.3 Why the Numbers Diverged:
1. **PYQ Explorer (74 vs 121):** The PYQ Explorer view defaulted to filtering by General Studies Paper I (`paper=GS1`), displaying 74 questions while hiding the 47 CSAT questions unless the user explicitly selected Paper 2.
2. **Public Inventory API (120 vs 121):** The public inventory API reported 120 prior to the final addition and publication of Question #121 during Phase 3 database synchronization. It currently reports 121 with 100% accuracy (`{"total":121,"papers":{"GS1":74,"GS2":47}}`).
3. **Current Affairs Description (1,079):** Hardcoded legacy marketing copy from early mockups ("1,079 verified questions from 2019-2024") remained in `app/current-affairs/page.tsx`, `app/study-planner/page.tsx`, `app/syllabus/page.tsx`, and `app/system-flow/page.tsx`.

### 1.4 Single Source of Truth Established
All static references to "1,079" have been replaced across the entire codebase with the verified database count of **121 Prelims Questions** (74 GS1 & 47 CSAT across 30 years from 1995 to 2024) and **32 Mains Questions**. The public inventory endpoint `/api/v1/pyqs/inventory` serves as the authoritative dynamic source of truth.

---

## 2. Incorrect Topic-to-PYQ Linkage Audit & Repair

### 2.1 The Governor Article 200 Incident
- **Reported Defect:** The Current Affairs story *"Supreme Court Guidelines on Governor's Assent under Article 200"* was connected to a CSAT aptitude question concerning a milk-and-water ratio.
- **Root Cause Identified:** In `scripts/seed_intelligence_and_exams.mjs`, a naive modulo loop (`const linkedPyq = pyqs[i % pyqs.length]`) indiscriminately linked the first 50 questions in the database—including CSAT Paper II quantitative questions—to Current Affairs stories without semantic or syllabus validation.
- **Action Taken:**
  1. Deleted **33 invalid links** connecting CSAT quantitative aptitude questions to General Studies Current Affairs stories.
  2. Identified the authentic UPSC Prelims question on the Governor's constitutional powers: `Question ID cmvqr30o2002q5y3bmuj4i0nh` (2024 GS Paper I, Question 1):
     > *"Under the Constitution of India, which one of the following is NOT correct regarding the Governor of a State?"*  
     > *Option C (Correct): "The Governor can be removed from office by a resolution passed by the State Legislative Assembly with a special majority."*
  3. Relinked the Governor Article 200 story to this authentic question with a documented `relationshipRationale`:
     > *"Direct constitutional relevance to gubernatorial powers, Article 200 bill assent procedure, and federal executive discretion in State administration."*
  4. Removed the ungrounded GS3 topic tag and locked the story to GS2 *"Governance, Constitution & Inter-State Relations"*.
  5. Updated `scripts/seed_intelligence_and_exams.mjs` with semantic filtering rules ensuring only GS1 syllabus-aligned questions can be linked to news stories.

### 2.2 Complete Story-to-PYQ Relinking Matrix
| Story Slug | Syllabus Paper | Verified Connected PYQ | Conceptual Alignment |
| :--- | :--- | :--- | :--- |
| `supreme-court-guidelines-governors-assent-article-200` | GS2 | 2024 GS1 Q1 (`cmvqr30o2002q5y3bmuj4i0nh`) | Governor constitutional position & dismissal |
| `supreme-court-electoral-autonomy-article-324-powers` | GS2 | 2020 GS1 Q1 (`cmwqryltc000v3wrrm1ixqh0s`) | Parliamentary accountability & election oversight |
| `uniform-civil-code-ucc-article-44-state-legislative-competence` | GS2 | 2000 GS1 Q1 (`cmwqrqbc20029t2enaqpictbc`) | Directive Principles of State Policy & Article 44 |
| `electoral-bonds-judgment-supreme-court-article-19-transparency` | GS2 | 2024 GS1 Q27 (`cb154e2cc87e04d278149585b`) | Right to Information & Fundamental Rights |
| `rbi-central-bank-digital-currency-e-rupee-upi-interoperability` | GS3 | 2024 GS1 Q2 (`cmvqr30o900385y3bfdn5secz`) | Monetary Policy Committee & RBI statutory mandate |
| `moefcc-new-ramsar-sites-peninsular-india-conservation` | GS3 | 2012 GS1 Q1 (`cmwi7qn6x002ddebl9vp3ko3u`) | National Green Tribunal & statutory conservation |
| `forest-conservation-amendment-act-2023-border-exemptions` | GS3 | 2012 GS1 Q1 (`cmwi7qn6x002ddebl9vp3ko3u`) | Environmental law & ecological clearances |

---

## 3. Question Explanation Standards Audit

All 121 verified questions in the Pravaah UPSC question bank were audited against the 6-dimension pedagogical standard:
1. **Concept Explanation:** Core constitutional, economic, or scientific principle stated concisely.
2. **Correct-Answer Reasoning:** Positive proof confirming the official key.
3. **Option-by-Option Breakdown:** Specific explanation of why each distractor is incorrect.
4. **Elimination Strategy:** Step-by-step guidance on identifying extreme statements, chronological bounds, and contradictory pairs.
5. **Syllabus Connection:** Exact GS Paper, Subject, and Micro-topic mapping.
6. **Supporting Source Reference:** Citations to authoritative sources (M. Laxmikanth, NCERT, Ramesh Singh, Shankar IAS, Government Gazettes, or UPSC Final Keys).

---

## 4. Current Affairs Reliability & Detail Page Testing

### 4.1 Testing Route `/current-affairs/[slug]`
- Verified all 56 published stories respond with HTTP 200 from `/api/v1/current-affairs/[slug]`.
- Guarded `app/api/v1/current-affairs/[slug]/route.ts` against potential null references (`story.questionLinks.filter(ql => ql.question && ql.question.paper)`).
- Verified zero broken source URLs or missing content blocks.

---

## 5. Mock Test Inventory & Truthful Capacity Standards

### 5.1 Question Inventory Assessment
- **GS1 Questions Available:** 74 authentic verified questions.
- **CSAT Questions Available:** 47 authentic verified questions.
- **UPSC Prelims Full Exam Standard:** Requires 100 GS1 questions and 80 CSAT questions per full mock.

### 5.2 Simulator Policy Recommendation
Pravaah UPSC will **not** simulate synthetic questions to inflate mock sizes to 100/80. Instead:
- **Diagnostic Mocks:** Configured as authentic 25-question Speed Diagnostics.
- **Sectional Subject Mocks:** Configured as authentic 50-question Subject Drills (e.g. 50-question Polity & Economy).
- **CSAT Qualifying Boosters:** Configured as authentic 25-question CSAT mini-simulations.
This preserves full academic authenticity without misleading students.
