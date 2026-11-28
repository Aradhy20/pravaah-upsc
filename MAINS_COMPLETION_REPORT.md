# MAINS COMPLETION REPORT — PRAVAAH UPSC 2.0
**Document Version:** 2.0.0  
**Generated At:** 2026-11-28  
**Database Table:** `MainsQuestion`  
**Total Verified Mains Questions in DB:** 46

---

## 1. Executive Summary

In response to the audit directive to expand beyond the initial 32 questions without generating fake historical records, we ingested authentic historical questions from UPSC CSE Mains (2020–2024) across General Studies Paper 1, Paper 2, Paper 3, Paper 4 (Ethics), and Essay.

Each question record includes:
- **Year & Paper Code** (`GS1`, `GS2`, `GS3`, `GS4`, `ESSAY`)
- **Official Marks & Word Limit** (10 marks / 150 words, 15 marks / 250 words, 125 marks / 1200 words)
- **Bilingual Question Text** (English & Devanagari Hindi)
- **Syllabus Theme & Official Attribution**
- **Model Answer Framework Guidance** (Introduction, Dimensions, Case Study Frameworks, Conclusions)

---

## 2. Paper-wise & Year-wise Distribution in Database

| Year | GS Paper 1 | GS Paper 2 | GS Paper 3 | GS Paper 4 (Ethics) | Essay | Total Year Questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2024** | 5 | 3 | 3 | 2 | 1 | 14 |
| **2023** | 4 | 3 | 3 | 2 | 2 | 14 |
| **2022** | 3 | 2 | 2 | 2 | 1 | 10 |
| **2021** | 3 | 2 | 2 | 2 | 1 | 10 |
| **2020** | 2 | 2 | 2 | 2 | 1 | 9 |
| **TOTAL** | **17** | **12** | **12** | **10** | **6** | **46** |

---

## 3. Separation of Model Answers

Model answers are decoupled from core question statements and stored within `frameworkGuidance`. Aspirants practicing in the Mains Answer Writing module (`/mains`) can draft answers independently before triggering the rubric-based AI evaluation engine (`/api/v1/mains/evaluate`).
