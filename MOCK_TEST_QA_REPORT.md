# PRAVAAH UPSC — PRELIMS MOCK TEST ENGINE QA REPORT

**Date:** November 24, 2026  
**Status:** Calibrated, Tested & Verified  
**Auditor:** Principal Full-Stack QA Engineer  

---

## 1. Official Examination Structure vs Practice Set Inventory

Pravaah UPSC strictly distinguishes between the official UPSC Civil Services Examination architecture and the available question count in individual practice sets:

| Exam Paper | Official Full Paper Standard | Positive Marks | Negative Penalty | Qualifying Benchmark | Pravaah Inventory Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GS Paper I** | 100 Questions / 200 Marks / 120 Mins | +2.000 | -0.666 (-1/3rd) | Competitive Cutoff (88–98) | Displays exact count (e.g., 36 Questions / 72 Marks Pro-Rated). Clearly badged as *Curated Practice Set*. |
| **CSAT Paper II** | 80 Questions / 200 Marks / 120 Mins | +2.500 | -0.833 (-1/3rd) | Mandatory 33% (66.0 Marks) | Displays exact count (e.g., 41 Questions / 102.5 Marks Pro-Rated). Badged with CSAT 33% threshold. |

> **Critical Academic Guarantee:** No test set is advertised as a complete 100-question or 80-question paper unless that exact quantity of published questions is present in the database.

---

## 2. Interactive Testing Engine Capabilities

The `ExamPlayer` (`components/ExamPlayer.tsx`) and Session APIs (`/api/v1/tests/session/*`) implement the following verified workflow:

1. **Question Navigation:** Smooth Previous / Next controls with boundary protection (`currentIndex === 0` and `currentIndex === questions.length - 1`).
2. **Mark for Review:** Toggle flag marking questions for secondary review; highlighted in amber on both question card and palette.
3. **Clear Choice:** "Clear Choice" button allows candidates to unselect an option, preventing accidental negative marking.
4. **Interactive Question Palette:** 5-column palette displaying color-coded status badges:
   - Emerald: Answered
   - Amber: Marked for Review
   - Purple: Answered & Marked for Review
   - Slate: Unvisited / Unattempted
5. **Autosave & Interruption Recovery:** Continuous synchronization to `localStorage` (`pravaah_mock_session_${sessionId}`) including answers, flags, and elapsed time. Interrupted tests resume without loss of progress.
6. **Dynamic Time-per-Question Telemetry:** Real-time tracking of seconds spent on each individual question (`timePerQuestion[q.id]`) transmitted on final submission.
7. **Submit Confirmation Dialog:** Modal reporting exact counts of Answered, Unattempted, and Marked questions before finalizing.
8. **Auto-Submit on Timeout:** Automatic submission triggered when countdown timer reaches `00:00:00`.
9. **Server-Side Anti-Leak Protection:** Client session start payload strips `isCorrect` and explanations. Correct keys are strictly withheld until final submission.
10. **Comprehensive Scorecard & Solutions:** Instant score generation with net marks, accuracy %, raw positive marks, negative penalties, subject-wise breakdown, and full statement-by-statement pedagogical solutions.
