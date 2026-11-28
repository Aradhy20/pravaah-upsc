# PRAVAAH UPSC — MULTI-EXAM TAXONOMY & EXPANSION AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Principal Public Sector Examination Architect  
**Scope:** Assessment of 14 Official UPSC Examinations & State PSC Expansion Readiness  
**Source Code Baseline:** `lib/taxonomy.ts` (14 Exam Tracks Modeled), PostgreSQL `Exam`, `ExamStage`, `Paper` Models  

---

## 1. Executive Summary: Taxonomy Modeled vs. Data Implemented

The long-term vision of Pravaah is to expand beyond the flagship Civil Services Examination (UPSC CSE) to serve aspirants preparing for defense, paramilitary, specialized economic, medical, and engineering civil examinations.

Our codebase audit reveals a critical distinction:
- **The Examination Taxonomy Architecture is 100% complete in TypeScript and PostgreSQL schema.** All 14 examination tracks, stages, papers, eligibility criteria, and marking schemes are formally defined in `lib/taxonomy.ts` and seeded into PostgreSQL tables `Exam`, `ExamStage`, and `Paper`.
- **However, actual question papers, previous year questions (PYQs), and syllabus nodes are 100% absent for all 13 non-CSE examinations.**

```
┌────────────────────────────────────────────────────────────────────────┐
│               MULTI-EXAM READINESS IN PRAVAAH UPSC                     │
├─────────────────────────┬──────────────┬──────────────┬────────────────┤
│ Examination Track       │ Metadata &   │ Syllabus     │ PYQ Question   │
│                         │ Pattern Model│ Nodes Seeded │ Data Ingested  │
├─────────────────────────┼──────────────┼──────────────┼────────────────┤
│ 1. UPSC CSE             │ 🟢 Complete  │ 🟢 53 Nodes  │ 🟡 121 Active  │
│ 2. UPSC IFoS (Forest)   │ 🟢 Complete  │ 🟡 Prelims   │ 🔴 0 Mains Qs  │
│ 3. CAPF (AC)            │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 4. CDS                  │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 5. NDA / NA             │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 6. Combined Medical     │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 7. Engineering Services │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 8. Indian Economic (IES)│ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 9. Indian Statistical   │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 10. EPFO (EO/AO/APFC)   │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 11. Geo-Scientist       │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 12. Central Armed Police│ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 13. CISF AC (Exe) LDCE  │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
│ 14. SO / Steno (GD-B/1) │ 🟢 Complete  │ 🔴 Missing   │ 🔴 0 Questions │
└─────────────────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 2. Examination Track Analysis Across 14 Official UPSC Examinations

### 1. UPSC Civil Services Examination (CSE)
- **Status:** **Primary Focus (Partially Ready).**
- **Pattern:** Prelims (GS1 100Q/200M + CSAT 80Q/200M), Mains (Essay + GS1–GS4 + 2 Optionals), Interview (275M).
- **Available Data:** 121 published questions, 2,052 staging questions, 32 Mains questions, 10 interview prompts.

### 2. UPSC Indian Forest Service (IFoS)
- **Status:** **Prelims Shared with CSE; Mains Missing.**
- **Pattern:** Uses UPSC CSE Prelims as its screening exam. Mains features General English (300M), General Knowledge (300M), and 2 optional scientific subjects (Forestry, Agriculture, Geology, Botany, Zoology).
- **Available Data:** Prelims shared; 0 IFoS-specific forestry/botany subjective questions.

### 3. Central Armed Police Forces (CAPF - Assistant Commandant)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** Paper I: General Ability & Intelligence (125 MCQs, 250M, -0.833 penalty); Paper II: General Studies, Essay & Comprehension (200M subjective).
- **Gap:** CAPF requires specific internal security, border management, and paramilitary history questions.

### 4. Combined Defence Services (CDS)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** IMA/INA/AFA: English (100M), General Knowledge (100M), Elementary Mathematics (100M). OTA: English (100M), General Knowledge (100M). Marking: +0.833 / -0.27 per question.
- **Gap:** Mathematics syllabus in CDS includes high-frequency arithmetic, algebra, trigonometry, and geometry that are completely distinct from CSE CSAT.

### 5. National Defence Academy (NDA / NA)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** Mathematics (120 MCQs, 300M, +2.5 / -0.833); General Ability Test (150 MCQs, 600M, +4.0 / -1.333).
- **Gap:** Target demographic is 10+2 students (Classes 11–12). Mathematics covers 11th/12th calculus, matrices, determinants, and coordinate geometry.

### 6. Employees' Provident Fund Organisation (EPFO - EO / AO & APFC)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** Single-stage Recruitment Test (RT) (120 MCQs, 300M, +2.5 / -0.833) + Interview (100M).
- **Gap:** High-yield niche topics: Industrial Relations & Labour Laws, Social Security in India, General Accounting Principles, Insurance. None exist in Pravaah today.

### 7. Engineering Services Examination (ESE / IES)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** Stage I: Paper I (General Studies & Engineering Aptitude, 200M) + Paper II (Technical discipline, 300M).
- **Gap:** Requires Ethics in Engineering, Project Management, Material Science, and Environmental Pollution questions.

### 8. Combined Medical Services (CMS)
- **Status:** **Taxonomy Modeled; Zero Questions.**
- **Pattern:** Computer-Based Examination. Paper I: General Medicine (96Q) & Paediatrics (24Q); Paper II: Surgery (40Q), Gynaecology & Obstetrics (40Q), Preventive & Social Medicine (40Q).
- **Gap:** Pure medical syllabus; 0 clinical questions.

---

## 3. State Public Service Commission (State PSC) Expansion Potential

Many UPSC aspirants simultaneously appear for prestigious state civil services:
- **UPPSC (Uttar Pradesh Combined State / Upper Subordinate Exam):** Highly aligned with UPSC CSE after the removal of optional subjects and introduction of GS Paper V & VI (Uttar Pradesh General Knowledge).
- **BPSC (Bihar Public Service Commission):** 150 MCQs in Prelims with -0.333 negative marking.
- **MPPSC & RAS (Rajasthan):** Similar general studies core with state-specific history, art, and geography.

### Architectural Recommendation:
The relational schema `Exam -> ExamStage -> Paper -> Subject -> Topic -> Question` in `prisma/schema.prisma` is completely agnostic and fully capable of hosting state PSC papers. However, **no state PSC data should be introduced until the core UPSC CSE database is fully populated and verified**.

---

## 4. Product Recommendations Regarding Multi-Exam Marketing

1. **Remove False Impressions on `/exams`:** The public page `app/exams/page.tsx` currently displays badges suggesting support for all 14 examinations. When a student clicks into `/exams/NDA` or `/exams/CAPF`, they find an empty question bank with zero papers.
2. **Add "Upcoming Track" Badges:** Clearly label all 13 non-CSE examination tracks as **"Roadmap Track — Curriculum Modeled (Question Bank Ingestion in Progress)"** to maintain academic transparency and avoid misleading prospective students.
