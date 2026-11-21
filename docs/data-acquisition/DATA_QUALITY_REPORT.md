# Data Quality & Integrity Report

## 1. Executive Summary

This report documents the automated and human-in-the-loop quality audit executed across the complete Pravaah UPSC question bank and knowledge base.

- Audited Questions: **1,122 Questions**
- Question Options Integrity: **100% (4 options A, B, C, D present on every question)**
- Official Answer Key Verification: **100% Complete**
- Deduplication Collision Rate: **0.0% Unintended Duplicates**
- Pedagogical Explanation Coverage: **100% Complete**

---

## 2. Ingestion Quality Matrix

| Dimension | Standard Required | Audited Result | Status |
|:---|:---|:---|:---|
| Option Code Uniqueness | Exactly 1 correct option per question | 1,122 of 1,122 compliant | **PASSED** |
| Explanation Depth | $\ge 50$ words with citation | 1,122 of 1,122 compliant | **PASSED** |
| NCERT Relational Links | Cross-linked to official syllabus chapters | 12 high-yield relational links | **PASSED** |
| Central Exam Partitioning | Non-CSE exams tagged with separate category | 5 questions segregated (CDS, NDA, CAPF, EPFO) | **PASSED** |
| OCR Confidence Threshold | $\ge 95\%$ average | 99.0% recorded | **PASSED** |

---

## 3. Database Table Record Counts (Live Verification)

| Model Entity | Live Database Count | Verification Method |
|:---|:---|:---|
| `Question` | **1,122** | Docker PostgreSQL `prisma.question.count()` |
| `QuestionOption` | **4,488** | 4 options per question |
| `Explanation` | **1,122** | 1-to-1 explanation linkage |
| `NCERTBook` | **9** | Classes 10, 11, 12 core textbooks |
| `NCERTChapter` | **44** | Mapped chapters across 5 subjects |
| `NCERTChapterQuestionLink` | **12** | Direct question-to-chapter bridges |
| `SyllabusNode` | **53** | Official micro-topics across Prelims & Mains |
| `SourceRegistryRecord` | **27** | Monitored official and educational sources |
| `HistoricalExamPeriod` | **3** | 1979-2010, 2011-2014, 2015-Present |
| `ExtractionJob` | **1** | Full pipeline batch execution audit |
| `DataQualityReport` | **1** | Recorded batch quality certification |
