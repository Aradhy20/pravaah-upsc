# Pravaah UPSC — Browser QA & End-to-End Journey Audit
**Audit Date:** 28 November 2026  
**Scope:** Responsive Layouts, Interactive State Machines, Bilingual Toggles, Authentication Flows  
**Viewports Tested:** Desktop (1440px), Tablet (768px), Mobile (375px)  

---

## 1. End-to-End Journey Verification Matrix

| Route | User Journey Tested | Verification Standard | Result |
|---|---|---|:---:|
| `/` | Homepage Hero & Navigation | "Controlled Beta" badge visible, dynamic "2,095+ Verified PYQs" stat displayed, Search bar operates cleanly, "Report Academic Errata" button functional. | 🟢 PASS |
| `/register` | New Aspirant Account Creation | Name, email, password, target year (2025/2026/2027), optional subject. Creates `User`, `UserProfile`, and `Subscription` (Free) atomically. | 🟢 PASS |
| `/login` | Aspirant Sign In | Validates HMAC-signed session cookie (`pravaah_user_id`), redirects to `/dashboard`. Unauthenticated access handled gracefully. | 🟢 PASS |
| `/onboarding` | Preference & Stage Setting | Captures daily study hours, stage (Beginner/Intermediate/Advanced), weak/strong subjects. Serializes properly without schema errors. | 🟢 PASS |
| `/dashboard` | Mission Control Dashboard | Displays student target year, daily questions goal, streak tracker, and quick navigation cards to study engines. | 🟢 PASS |
| `/pyqs` | Authentic Question Bank | 2,095 questions load with year and subject filters. Instant bilingual toggle (`EN \| हि \| Both`) renders Devanagari with `leading-relaxed`. | 🟢 PASS |
| `/mock-tests` | Timed Examination Simulator | Standard UPSC 2-hour countdown timer, question palette (Answered, Unanswered, Marked for Review), +2.0 / -0.666 scoring rubric. | 🟢 PASS |
| `/csat-coach` | CSAT Survival Practice | Reading Comprehension & Analytical Reasoning drills (+2.5 / -0.833) calibrated for 33% (66.7 marks) qualifying threshold. | 🟢 PASS |
| `/mains` | Mains Writing Studio | Distraction-free text editor with real-time word counter. Submits to `/api/v1/mains/evaluate` for 4-dimension rubric feedback. | 🟢 PASS |
| `/revision` | Spaced Mistake Notebook | Incorrect answers automatically captured; SM-2 schedule prompts review; "Mark as Mastered" removes from queue. | 🟢 PASS |
| `/pricing` | Canonical Pricing Presentation | Plus ₹149/mo, Pro ₹299/mo, Elite ₹499/mo. Checkout displays safe "Payments Dormant Pending Verification" state. | 🟢 PASS |
