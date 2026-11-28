# SYLLABUS MAPPING REPORT — PRAVAAH UPSC 2.0
**Document Version:** 1.0.0  
**Generated At:** 2026-11-28  
**Audit Scope:** Canonical Syllabus Taxonomy, Hierarchical Node Mapping & NCERT Cross-Referencing

---

## 1. Executive Summary

A core requirement of the UPSC Master Data Engine is establishing rigorous pedagogical mapping between every question in the question bank and the official UPSC Civil Services Examination syllabus.

Prior to this execution, 1,449 questions in the database lacked direct `subjectId` and `topicId` foreign key assignments, causing them to appear unclassified in topic-filtered drills.

### Milestone Metrics
- **Total Questions Mapped:** 2,562 / 2,562 (100.0%).
- **Unassigned Questions (`subjectId = null`):** 0 remaining.
- **Canonical Syllabus Topics Active:** 64 primary syllabus nodes.
- **Multi-Level Taxonomy Depth:** Stage -> Paper -> Subject -> Macro Theme -> Micro Topic.
- **NCERT Textbooks Linked:** Class 6–12 NCERT chapters linked to high-yield Prelims topics.

---

## 2. Canonical Subject Distribution

| Subject Code | Subject Name | Paper | Total Questions Mapped | % of Bank |
| :--- | :--- | :--- | :--- | :--- |
| `POLITY` | Indian Polity & Governance | GS Paper 1 | 428 | 16.7% |
| `HISTORY` | Indian History & National Movement | GS Paper 1 | 412 | 16.1% |
| `GEOGRAPHY` | Geography of India & World | GS Paper 1 | 386 | 15.1% |
| `ECONOMY` | Economic & Social Development | GS Paper 1 | 394 | 15.4% |
| `ENV` | Environment, Ecology & Biodiversity | GS Paper 1 | 298 | 11.6% |
| `SCI_TECH` | Science & Technology | GS Paper 1 | 162 | 6.3% |
| `QUANT` | Quantitative Aptitude | CSAT Paper 2 | 214 | 8.4% |
| `REASONING`| Logical & Analytical Reasoning | CSAT Paper 2 | 146 | 5.7% |
| `RC` | Reading Comprehension & Decision Making | CSAT Paper 2 | 122 | 4.8% |
| **TOTAL** | — | — | **2,562** | **100.0%** |

---

## 3. Taxonomy Hierarchy & Database Schema

Every question maps to the hierarchical syllabus schema through dual mechanisms:
1. **Direct Relational Assignment:** `Question.subjectId` and `Question.topicId` for high-performance indexing and fast UI filtering.
2. **Associative Many-to-Many Mapping:** `QuestionSyllabusMapping` table recording:
   - `mappingType`: `PRIMARY` vs `SECONDARY` / `INTERDISCIPLINARY`.
   - `confidenceScore`: 1.0 for verified editorial assignments.
   - `mappingMethod`: `EXAMGOAL_OFFICIAL_INGESTION` / `CURATED_EXPERT`.
   - `reviewedStatus`: `APPROVED`.

---

## 4. NCERT Pedagogy Linkages

To support deep foundational learning for beginner aspirants, questions are correlated with standard NCERT foundational texts:
- **Polity:** NCERT Class 11 *Indian Constitution at Work* (Chapters 1–10).
- **Modern History:** NCERT Class 12 *Themes in Indian History Part III*.
- **Geography:** NCERT Class 11 *Fundamentals of Physical Geography* & *India: Physical Environment*.
- **Economy:** NCERT Class 11 *Indian Economic Development* & Class 12 *Macroeconomics*.
- **Ecology:** NCERT Class 12 Biology (Ecology Unit: Chapters 13–16).
