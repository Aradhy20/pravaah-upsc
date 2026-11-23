# PHASE 3: BILINGUAL COVERAGE & HINDI-ENGLISH LEARNING ENGINE REPORT
**Application:** Pravaah UPSC  
**Live Platform:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Version:** 3.0  
**Audit Date:** November 23, 2026  
**Auditor:** Bilingual Product Architect & Content Reliability Engineer  

---

## 1. Executive Summary

Bilingual capability (Hindi & English) is a first-class architectural requirement for Pravaah UPSC, catering to both English-medium and Hindi-medium Civil Services aspirants. 

Rather than deploying automated machine translation (which frequently introduces fatal errors in legal, constitutional, and economic terminology), Pravaah strictly enforces authentic bilingual provenance:
- **41 Prelims questions (33.9%)** possess authentic Devanagari Hindi question stems, 164 authentic Hindi options, and 40 pedagogical Hindi explanations transcribed directly from official UPSC bilingual question booklets.
- **80 questions (66.1%)** are preserved in authentic English with status `TRANSLATION_MISSING`, completely eliminating artificial hallucinations or misleading mistranslations.

---

## 2. Quantitative Bilingual Inventory

| Language / Stage | English-Only | Authentic Bilingual (EN + HI) | Total Questions | Authentic Bilingual Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Prelims GS Paper I** | 43 | 31 | 74 | **41.9%** |
| **Prelims CSAT Paper II** | 37 | 10 | 47 | **21.3%** |
| **Total Prelims** | **80** | **41** | **121** | **33.9%** |
| **Mains Question Bank (GS1–4, Essay)** | 32 | 0 | 32 | 0.0% (English Sourced) |

### Option & Explanation Coverage Breakdown
- **English Options:** 484 / 484 (100.0%)
- **Authentic Hindi Options:** 164 / 484 (33.9% — exactly 4 options for each of the 41 bilingual questions)
- **English Explanations:** 121 / 121 (100.0%)
- **Authentic Hindi Explanations:** 40 / 121 (33.1%)

---

## 3. Translation Status Classification

Every question, option, and explanation is annotated with a formal translation lifecycle status:

| Status Code | Count | Quality & Presentation Policy |
| :--- | :---: | :--- |
| `HUMAN_VERIFIED` | 41 | Sourced directly from official bilingual UPSC question papers or vetted by academic faculty. Fully active for student practice. |
| `TRANSLATION_MISSING` | 80 | Question is currently available only in authentic English. Displayed clearly without artificial placeholders. |
| `MACHINE_TRANSLATED_REVIEW_REQUIRED` | 0 | Machine translations awaiting expert verification. **Strictly prohibited from public display.** |
| `ORIGINAL_SOURCE` | 121 | Authoritative canonical source language version. |

---

## 4. Student UI Bilingual Experience

### 4.1 Frictionless Question-Level Language Switching
In `components/QuestionCard.tsx`:
- Aspirants can toggle between **`EN`** (English), **`हि`** (Hindi), and **`Both`** (Parallel bilingual view) on any bilingual question.
- **Answer Progress Persistence:** Switching languages modifies only the visible text container. The student's `selectedOption`, response timer, bookmarks, private study notes, and explanation drawer status remain 100% uninterrupted.

### 4.2 Devanagari Typography & Mobile Rendering
- Question text, options, and explanations utilize native system Devanagari font stacks (`Nirmala UI`, `Kohinoor Devanagari`, `Noto Sans Devanagari`, system-ui), ensuring crisp rendering across Android, iOS, Windows, and macOS devices.
- Technical terms (e.g. *"Miyawaki method"*, *"Barasingha"*, *"Mitakshara & Dayabhaga"*) retain both Devanagari and transliterated roman script where appropriate.
