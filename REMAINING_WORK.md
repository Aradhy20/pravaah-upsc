# REMAINING WORK & POST-LAUNCH ROADMAP — PRAVAAH UPSC 2.0
**Document Version:** 2.0.0  
**Generated At:** 2026-11-28  
**Audit Purpose:** Transparent Backlog & Scope Clarification for Production Release Gate  

---

## 1. Scope Realism & Current Production Inventory

In strict accordance with our commitment to transparency, the current production capabilities are distinguished from post-launch enhancements:

### What is COMPLETE & Production Live (December 1, 2026 Launch)
- **Prelims Question Bank:** **2,562 questions** with 100% option completeness (10,248 options), 100% correct answer mapping, and 100% detailed explanations.
- **CSAT Paper 2 Coverage:** **482 questions** with rectified Paper 2 official answer keys.
- **Bilingual Devanagari Content:** **1,100 questions** with 1:1 English-Hindi parity.
- **Syllabus Classification:** **100%** mapped across all 9 canonical GS1 and CSAT subjects.
- **Productivity & Evaluation Features:** All 12 modules (Sprint Board, Habit Tracker, Smart Multi-domain Search, Prelims Simulator, Mains Evaluator, Topper Copies, Map Lab, Interview Simulator) are functional and connected to live PostgreSQL tables.
- **Payment Safety:** Cashfree integration is locked in safe mode (`ENABLE_PAYMENTS=false`) to prevent accidental unauthorized charges until merchant credentials go live.

---

## 2. Documented Gaps & Backlog for Future Iterations

### 1. Mains Question Bank Expansion (Current: 32 Questions)
- **Current State:** 32 representative Mains questions (covering GS1, GS2, GS3, GS4, and Essay) are seeded to power the Mains Evaluator and answer writing workflows.
- **Future Milestone (Sprint 1):** Ingest historical year-wise Mains papers (2013–2024: ~20 questions per paper * 4 papers = 80 questions/year * 12 years = ~960 Mains questions).

### 2. Optional Subjects Coverage (Current: 0 Questions)
- **Current State:** 0 optional subject questions are in the database.
- **Reason:** The primary focus of Pravaah UPSC 2.0 is the common foundational syllabus (Prelims GS1, CSAT, and Mains General Studies GS1–GS4).
- **Future Milestone (Sprint 2):** Ingest previous year questions for high-enrollment optional subjects (PSIR, Sociology, Geography, History, Public Administration, Anthropology).

### 3. Hindi Translation Backfill for Legacy 1995–2020 Questions (Current: 1,100 / 2,562)
- **Current State:** 1,100 questions have human-verified Devanagari Hindi text (all 2021–2026 papers and high-yield topic sets). The remaining 1,462 older questions (1995–2020) currently display English original text.
- **Future Milestone (Sprint 3):** Utilize the bilingual ingestion engine with UPSC official Hindi papers from the archive to achieve 100% bilingual parity across the entire 30-year archive.

### 4. Cashfree Merchant Production Onboarding
- **Current State:** Pure Cashfree payment architecture is implemented, tested, and guarded by the `ENABLE_PAYMENTS` feature flag. Legacy manual UPI routes have been permanently decommissioned.
- **Action Required on Launch Day:** Once production Cashfree API credentials (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`) and webhook secrets are verified in Vercel environment settings, toggle `ENABLE_PAYMENTS=true`.

---

## 3. Final Release Gate Verdict

| Gate Criterion | Target Standard | Verified State | Verdict |
| :--- | :--- | :--- | :--- |
| **Verified Question Bank** | >= 2,500 questions | 2,562 questions | **PASS** |
| **CSAT Depth** | >= 400 questions | 482 questions | **PASS** |
| **Bilingual Hindi Coverage** | >= 1,000 questions | 1,100 questions | **PASS** |
| **Answer Key Reliability** | 100% verified keys | 2,562 / 2,562 (100.0%) | **PASS** |
| **Syllabus Mapping** | 100% mapped | 0 unassigned | **PASS** |
| **Automated Tests** | 100% passing | 35 / 35 tests passing | **PASS** |
| **Production Build** | Clean build | `next build` code 0 | **PASS** |

### OVERALL STATUS: **VERIFIED COMPLETE (READY FOR CONTROLLED BETA LAUNCH)**
