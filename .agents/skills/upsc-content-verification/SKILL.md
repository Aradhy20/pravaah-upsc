---
name: upsc-content-verification
description: Rigorous verification protocol for UPSC CSE Prelims and Mains questions, official answer keys, syllabus mapping, and academic citations.
---

# UPSC Academic Content Verification Skill

## Core Protocol
1. **Official Source Authority**:
   - Every UPSC Civil Services Preliminary Examination (CSE Prelims) question must originate from official UPSC question paper booklets (Series A, B, C, or D).
   - Answer keys must be verified against the official Union Public Service Commission Final Answer Key published after the examination cycle concludes.
   - Where UPSC has dropped or modified questions (e.g., questions with multiple valid options or cancelled questions), this status must be explicitly recorded (`DROPPED`, `AMBIGUOUS`).
2. **Provenance & Booklet Mapping**:
   - Each question record must store:
     - `examYear`: (e.g., 2024, 2023, 2022...)
     - `paper`: (`GS1` or `CSAT`)
     - `bookletSeries`: (`A`, `B`, `C`, `D`)
     - `bookletQuestionNumber`: Exact number in the official booklet.
     - `sourceReference`: Canonical citation (e.g., "UPSC CSE Prelims 2024 GS Paper 1, Series A, Q42").
3. **Academic Integrity & Explanation Quality**:
   - Never generate hallucinated explanations.
   - Explanations must cite foundational academic references:
     - Polity: Constitution of India, M. Laxmikanth, Supreme Court judgments.
     - History: NCERT (Themes in Indian History I-III), Bipan Chandra, Spectrum (Rajiv Ahir).
     - Geography: NCERT Class 11-12 (Physical & Human), G.C. Leong, Survey of India maps.
     - Economy: Economic Survey, Union Budget, NCERT Macroeconomics, Ramesh Singh / Vivek Singh.
     - Environment: PMFIAS, Shankar IAS, MoEFCC official reports, Wildlife Protection Act 1972.
     - Science & Technology: The Hindu / Indian Express Science pages, ISRO, DRDO, DST publications.
4. **Staging Promotion Verification Gate**:
   - Before promoting any record from `QuestionStagingRecord` to the active `Question` table:
     1. Text and all 4 options (A, B, C, D) must be non-empty and well-formed.
     2. Exactly one canonical `correctOption` must be designated.
     3. Official answer key alignment must be validated.
     4. Syllabus micro-theme and subject must be correctly mapped.
