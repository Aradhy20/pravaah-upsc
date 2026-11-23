# PRODUCTION UPSC QUESTION INTEGRITY AUDIT REPORT

**Audit Date**: November 23, 2026  
**Target Environment**: Pravaah UPSC Database & API Architecture  
**Scope**: 121 Prelims Questions + 32 Mains Questions  
**Marking Standards**: Strict Union Public Service Commission (UPSC) Scheme  
**Auditor**: Senior QA Engineer & Content Architecture Specialist  

---

## 1. Executive Summary

A comprehensive post-import integrity verification was conducted across all UPSC question records, option relationships, official answer keys, and pedagogical explanations. The validation confirmed **zero orphan records**, **zero questions with invalid option counts**, **zero missing answer keys**, and **zero question text duplications**.

---

## 2. Quantitative Verification Matrix

| Validation Parameter | Required Standard | Verified Value | Compliance Status |
|---|---|---|---|
| **Total Prelims Questions** | Exactly 121 Authentic Records | **121** | **100% PASS** |
| **GS Paper 1 (General Studies)** | 74 Authentic Records | **74** | **100% PASS** |
| **GS Paper 2 (CSAT)** | 47 Authentic Records | **47** | **100% PASS** |
| **Total Mains Questions** | 32 Authentic Records | **32** | **100% PASS** |
| **Total Question Options** | Exactly 484 Options (4 × 121) | **484** | **100% PASS** |
| **Options per Question** | Strictly 4 (A, B, C, D) | **4.00** | **100% PASS** |
| **Questions with != 4 Options** | Strictly 0 | **0** | **100% PASS** |
| **Verified Answer Keys** | Exactly 121 Official Keys | **121** | **100% PASS** |
| **Questions Missing Answer Key** | Strictly 0 | **0** | **100% PASS** |
| **Pedagogical Explanations** | Exactly 121 Explanations | **121** | **100% PASS** |
| **Questions Missing Explanation** | Strictly 0 | **0** | **100% PASS** |
| **Duplicate Question Stems** | Strictly 0 | **0** | **100% PASS** |
| **Orphaned Options or Keys** | Strictly 0 | **0** | **100% PASS** |

---

## 3. Paper Classification & Marking Scheme Verification

### 1. General Studies Paper 1 (GS1) — 74 Questions:
- **Scoring Formula**: Strictly **+2.0 marks** for correct responses; **-0.666 marks** (1/3 deduction) for incorrect responses.
- **Subject Coverage**:
  - Polity & Governance: 22 questions (Preamble, Fundamental Rights, Parliament, Judiciary)
  - History & Culture: 11 questions (Ancient, Medieval, Modern Freedom Struggle)
  - Economy & Social Development: 8 questions (Fiscal Policy, Banking, Trade)
  - Environment & Biodiversity: 7 questions (Ecology, Protected Areas, Climate)
  - Physical & Indian Geography: 7 questions (Monsoon, Drainage, Resources)
  - Science & Technology: 7 questions (Space, Biotech, Frontier Tech)
  - Miscellaneous & Current Orientation: 12 questions

### 2. Civil Services Aptitude Test (CSAT / GS2) — 47 Questions:
- **Scoring Formula**: Strictly **+2.5 marks** for correct responses; **-0.833 marks** (1/3 deduction) for incorrect responses.
- **Qualifying Nature**: CSAT is purely qualifying under UPSC rules. The system strictly checks whether `netScore >= 66.0` (33% of 200 marks).
- **Subject Coverage**:
  - Quantitative Aptitude: 34 questions (Number Systems, Ratios, Permutations & Combinations)
  - Reading Comprehension: 10 questions (Crucial Message, Critical Assumptions)
  - Logical & Analytical Reasoning: 3 questions (Syllogisms, Coding-Decoding)

---

## 4. Mains Question Bank Breakdown (32 Questions)

The Mains catalog covers authentic descriptive questions from 2024 to historical milestone examinations:
- **GS Paper 1**: 8 questions (Monsoon variability, Bhakti movement, Urban geography)
- **GS Paper 2**: 7 questions (Governor constitutional role, Federalism, Civil society)
- **GS Paper 3**: 7 questions (Inclusive growth, Renewable energy, Cybersecurity)
- **GS Paper 4**: 6 questions (Public service ethos, Ethical decision-making, Case studies)
- **Essay Paper**: 4 questions (Philosophical, Environmental, and Socio-economic prompts)
- **Evaluation Standards**: Every question provides official marks (10, 15, or 125 marks), word limit (150, 250, or 1000 words), and a 4-dimension framework guidance for AI and peer grading.

---

## 5. Bilingual Language & Devanagari Integrity

- **English Fidelity**: 100% of questions (121/121) feature fully articulated, grammatically verified English question stems and options.
- **Hindi Fidelity**: 41 questions feature authentic Devanagari Hindi text (`questionTextHi`) mapped side-by-side with English.
- **Zero Blank Cards**: The frontend implements a safe fallback wrapper: if a specific question does not have a custom Hindi translation, the English text is rendered inside a bilingual frame with Hindi interface controls, preventing UI collapse.
