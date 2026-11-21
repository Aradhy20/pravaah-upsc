# PRAVAAH UPSC — EXTERNAL PYQ SOURCE INTELLIGENCE REPORT
**Document Reference:** `DOCS-EXT-PYQ-SRC-001`  
**Date:** 2026-11-22  
**ETL Status:** Sources Inspected & Categorized  

---

## 1. SOURCE CATALOGUE & PERMISSION AUDIT

| Source ID | Platform / Entity | Canonical URL | Category | Availability | Reuse Permission & Licensing Policy |
|---|---|---|---|---|---|
| **SRC-01** | **ExamGOAL PDF Archive** | https://pdf.questions.examgoal.com/past-years/year-wise/civil-services/upsc-civil-service | PDF Question Archive | 12 Papers (2021–2026) | **Authorized for Official Question Records Only.** Original question papers are public domain Union gazettes. Proprietary QR solutions and watermark overlays are strictly excluded. |
| **SRC-02** | **ExamSIDE Year-Wise** | https://questions.examside.com/past-years/year-wise/civil-services/upsc-civil-service | Year-Wise Practice | 1995–2024 Practice Web | **Authorized for Public Question Mapping.** Platform UI and private answer write-ups are proprietary. Underlying question stems are mapped against official UPSC Series A keys. |
| **SRC-03** | **ExamSIDE Chapter-Wise** | https://questions.examside.com/past-years/civil-services/upsc-civil-service | Educational Taxonomy | 8 Main Categories, 60+ Subtopics | **Metadata & Taxonomy Cross-Referencing Only.** Reused to crosswalk topics (Science, Ecology, Economy, Numeracy, Reasoning) into Pravaah's 24-subject syllabus schema. |
| **SRC-04** | **Human Peritus CSAT** | https://humanperitus.in/ & https://humanperitus.in/upsc-csat/ | Coaching Institute | Public Syllabus Coverage | **Strictly Restricted Commercial Material.** Public syllabus coverage and topic distribution reused for taxonomy benchmarking only. All paid test series, mock papers, and video course materials are strictly excluded. |

---

## 2. EXAMGOAL ARCHIVE INVENTORY (12 Master Papers)

The ExamGOAL archive hosts 12 primary papers across 2021 to 2026:
- 2026: Prelims Paper I (General Studies) & Paper II (CSAT)
- 2025: Prelims Paper I (General Studies) & Paper II (CSAT)
- 2024: Prelims Paper I (General Studies) & Paper II (CSAT)
- 2023: Prelims Paper I (General Studies) & Paper II (CSAT)
- 2022: Prelims Paper I (General Studies) & Paper II (CSAT)
- 2021: Prelims Paper I (General Studies) & Paper II (CSAT)

Dual-language PDFs are distributed via CDN:
- English Master: `/download/paper/civil-services/upsc-civil-service/{slug}/en.pdf`
- Hindi Master: `/download/paper/civil-services/upsc-civil-service/{slug}/hi.pdf`
- Integrity Hashing: Verified via SHA-256 fingerprinting stored in `data/pyq/paper_manifest.json`.

---

## 3. EXAMSIDE TAXONOMY DISCOVERY

Discovered 8 primary categories with 60+ granular subtopics:
1. **Science and Technology (10 subtopics):** Basic Biology, Chemistry, Physics, Biotechnology, Nanotechnology, Space, Disease, Electronics, Defence, Miscellaneous.
2. **Ecology and Environment (6 subtopics):** Ecology, Biodiversity, Government Legislature, Government Initiatives, International Conventions, Miscellaneous.
3. **Economy (13 subtopics):** Fiscal Policy, Monetary Policy, Inflation, International Institutions, Planning, Public Finance, Basic Concepts, Market, External Sector, Poverty, Industry, Agriculture.
4. **Current Affairs (3 subtopics):** International Relations, Government Programs, Miscellaneous.
5. **Comprehension (1 subtopic):** Verbal Ability.
6. **Basic Numeracy (13 subtopics):** Number System, Sets, Geometry, Sequences, Arithmetic, Permutations & Combinations, Algebra, Clocks & Calendars, HCF/LCM, Statistics, Probability, Mensuration, Fractions.
7. **Logical Reasoning & Mental Ability (12 subtopics):** Coding-Decoding, Blood Relations, Directions, Seating Arrangement, Puzzles, Syllogisms, Series, Classification.
8. **Data Interpretation (4 subtopics):** Tabulation, Pie Charts, Data Sufficiency, Numerical Ability.
