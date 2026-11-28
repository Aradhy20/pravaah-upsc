# Pravaah UPSC — Student Journey Implementation Report
**Date:** 28 November 2026  
**Target Release:** 1 December 2026 (Controlled Beta Launch)  
**Target Audience:** Hindi & English Civil Services Examination Aspirants  

---

## 1. Complete End-to-End Aspirant Lifecycle

```
[Registration & Profile] ──> [Onboarding Setup] ──> [Mission Control Dashboard]
                                                             │
         ┌───────────────────────────────────────────────────┼─────────────────────────────────┐
         ▼                                                   ▼                                 ▼
 [PYQ Explorer (2,095 Qs)]                        [Timed Mock Exam Simulator]           [Mains Writing Studio]
   - Bilingual Toggle                               - Strict 2-Hour Countdown             - Multi-Dimension Rubric
   - NCERT Chapter Links                            - +2.0 / -0.666 Scoring               - Citations & Case Laws
   - Instant Explanation & Elimination              - Complete Analysis Sheet             - Diagnostic Feedback
         │                                                   │                                 │
         └──────────────────────────┬────────────────────────┘                                 │
                                    ▼                                                          │
                         [Spaced Repetition Queue]                                             │
                           - SuperMemo-2 Schedule (Day 1, 3, 7)                                │
                           - Mistake Notebook Tracking                                         │
                           - Resolving/Mastery Cycle                                           │
                                    │                                                          │
                                    └───────────────────────────┬──────────────────────────────┘
                                                                ▼
                                                   [Daily Study Planner / Today]
```

---

## 2. Key Journey Touchpoints & Implementation Status

| Journey Stage | Primary Route | Relational Architecture | Verification Status |
|---|---|---|:---:|
| **1. Registration & Auth** | `/register`, `/login` | `User`, `UserProfile`, `Subscription` (Free Auto-Provisioning) | 🟢 100% OPERATIONAL |
| **2. Aspirant Onboarding** | `/onboarding` | Target Exam Year (2025/2026/2027), Optional Subject, Study Hours | 🟢 100% OPERATIONAL |
| **3. Mission Control Dashboard** | `/dashboard` | `DailyProgress`, `Streak`, `ReviewSchedule`, `ReadinessIndex` | 🟢 100% OPERATIONAL |
| **4. Authentic PYQ Practice** | `/pyqs`, `/pyqs/[year]` | 2,095 Published Questions, Official Keys, Elimination Notes | 🟢 100% OPERATIONAL |
| **5. Timed Mock Simulator** | `/mock-tests`, `/exam/[id]` | 120-min countdown, +2/-0.666 negative marking, session persistence | 🟢 100% OPERATIONAL |
| **6. CSAT Survival Drills** | `/mock-tests` (CSAT) | 80 questions, 200 marks (+2.5/-0.833), Reading Comprehension | 🟢 100% OPERATIONAL |
| **7. Mains Answer Studio** | `/mains`, `/api/v1/mains/evaluate` | 4-Dimension Rubric (Intro 15%, Body 50%, Citations 20%, Conclusion 15%) | 🟢 100% OPERATIONAL |
| **8. SM-2 Spaced Revision** | `/revision` | `ReviewSchedule` automatic creation on mistake; Day 1/3/7 review | 🟢 100% OPERATIONAL |
| **9. Curriculum Grounding** | Universal Search / NCERT | 235 `NCERTChapterQuestionLink` records across 44 textbook chapters | 🟢 100% OPERATIONAL |

---

## 3. Spaced Repetition (SM-2) Mechanics

1. **Automatic Ingestion:** When an aspirant answers incorrectly in either the Timed Exam Player or Learn mode, an entry is created in `ReviewSchedule` with `nextReviewDate = NOW + 1 day`.
2. **Interval Progression:** Successful reviews increment `repetitionCount` and expand `intervalDays` (1 day -> 3 days -> 7 days -> 21 days).
3. **Mastery Resolution:** Aspirants can explicitly mark a concept as "Mastered" when confidence is restored, archiving it from the active review queue.
