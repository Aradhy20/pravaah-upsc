# PRAVAAH UPSC — EXECUTIVE PROJECT STATUS & SAAS DISCOVERY AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Principal SaaS Architect, CTO & UPSC EdTech Advisory Team  
**Live Production URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**GitHub Repository:** [https://github.com/Aradhy20/pravaah-upsc](https://github.com/Aradhy20/pravaah-upsc)  
**Latest Production Commit:** `39fdcb1`  
**Deployment Platform:** Vercel (Edge + Serverless Node.js 20)  
**Database Stack:** PostgreSQL 17 (Local Replication: 88 tables; Remote Neon Production Cluster: partial drift)  
**ORM:** Prisma 5.22.0  
**Audit Directive:** Discovery, Inspection & Truthful Evaluation ONLY (Zero Code/Database Modifications)  

---

## 1. Executive Summary: What Pravaah UPSC Actually Is Today

Pravaah UPSC was conceived as a bilingual, AI-augmented Civil Services Examination (UPSC CSE) SaaS platform designed to guide aspirants through Prelims (GS1 & CSAT), Mains (GS1–GS4, Essay), and Interview stages.

Over multiple iterations, significant frontend scaffolding, complex database models (87 Prisma entities), and robust preliminary engines have been constructed. However, our rigorous discovery reveals a stark divergence between **what the platform promises on its marketing pages** versus **what is operational for a paying aspirant today**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRAVAAH UPSC REALITY AT A GLANCE                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ Claimed / Marketed Vision      │ Reality Found in Code & Database      │
├────────────────────────────────┼───────────────────────────────────────┤
│ "9,500+ Question Master Bank"  │ 121 Published Series A Questions;     │
│                                │ 2,052 Staged records awaiting review  │
├────────────────────────────────┼───────────────────────────────────────┤
│ "Live Automated Current News"  │ 56 Static seeded stories (dates null) │
├────────────────────────────────┼───────────────────────────────────────┤
│ "Production Cashfree Gateway"  │ Disabled locally; Production failing  │
│                                │ with HTTP 500 Authentication Error    │
├────────────────────────────────┼───────────────────────────────────────┤
│ "Comprehensive Mains AI Eval"  │ Rule-based heuristic fallback active; │
│                                │ Fails on Prod due to Neon table drift │
├────────────────────────────────┼───────────────────────────────────────┤
│ "CBSE Class 6-12 NCERT Bridge" │ 9 books, 44 chapters, but only 2      │
│                                │ questions linked in database          │
├────────────────────────────────┼───────────────────────────────────────┤
│ "14 Official UPSC Exam Tracks" │ Taxonomy metadata modeled, but zero   │
│                                │ non-CSE question papers ingested      │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. High-Level Completion Breakdown

Pravaah UPSC is **not ready for commercial public launch**. It is currently an **advanced alpha prototype** with high-quality architectural foundations, excellent frontend design, and a working core Prelims practice loop, but with critical content bottlenecks and broken production integrations.

| Platform Dimension | Implementation Completeness | Functional Reality | Production Readiness | Commercial Viability |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend UI & Pages** | **85%** | 59 routes render cleanly | 🟢 High (Clean build) | 🟡 Over-promises features |
| **Authentication & Profile** | **90%** | Register/Login working (201/200) | 🟢 Solid (Secure HMAC cookies) | 🟢 Ready |
| **Prelims Practice Engine** | **85%** | Sessions, timer, +2/-0.666 score | 🟢 Functional for 121 Qs | 🔴 Severely data-constrained |
| **Published Question Bank** | **15%** | Exactly 121 Series A questions | 🟢 100% verified authentic | 🔴 Aspirant exhausts in 2 days |
| **Syllabus & Taxonomy** | **80%** | 53 micro-nodes mapped | 🟢 Canonical coverage | 🟢 Solid architecture |
| **Mains Answer Evaluation** | **45%** | Heuristic rubric implemented | 🔴 Prod HTTP 500 (Drift) | 🔴 Untested at scale |
| **Interview & DAF Prep** | **40%** | DAF simulation logic coded | 🔴 Prod HTTP 500 (Drift) | 🔴 Missing live tables |
| **NCERT Foundational Hub** | **35%** | Metadata for 9 books/44 chapters| 🟡 Functional deep-links only | 🔴 Only 2 questions linked |
| **Current Affairs** | **30%** | 56 static articles | 🔴 No automated daily pipeline | 🔴 Stale content |
| **Cashfree & Monetization** | **40%** | Secure order/webhook coded | 🔴 Prod HTTP 500 (Auth fail) | 🔴 Cannot collect revenue |
| **Admin Operations** | **65%** | Rich ingestion & quality pages | 🟡 Local scripts work; UI raw | 🟡 Internal use only |

---

## 3. The Ten Most Serious Production Problems

1. **Severe Content Starvation (121 vs 9,500 Claim):** The active published bank has only 121 authentic questions. A student practicing 50 questions a day will completely exhaust the platform in less than 3 days. While 2,052 questions sit in staging, they have not been promoted to students.
2. **Production Database Schema Drift (Remote Neon vs Local PostgreSQL):** Recent Prisma migrations were deployed to local PostgreSQL, but NOT synchronized to the live Neon production database. Consequently, `/api/v1/interview`, `/api/v1/map-lab`, `/api/v1/search`, and `/api/v1/mains/evaluate` crash on live production with **HTTP 500** (`relation "InterviewQuestion" does not exist`, `relation "MapFeature" does not exist`, `relation "UserUsageLedger" does not exist`).
3. **Cashfree Order Creation Failure on Production (`HTTP 500`):** Live checkout returns `ORDER_CREATION_FAILED - authentication Failed`. Production Cashfree client credentials (`cfsk_ma_prod_...`) are either pointing to Cashfree's sandbox endpoint or are mismatched in Vercel environment variables, making it impossible for any aspirant to purchase a subscription.
4. **Pricing Catalog Disconnect on Live Production:** Live `/api/v1/plans` still returns legacy un-synchronized database rows (Aspirant Plus at ₹399/₹999/₹2,999, Pro at ₹799/₹1,899/₹5,499) rather than the canonical single-source-of-truth prices (Plus at ₹149/₹399/₹999, Pro at ₹299/₹799/₹1,999).
5. **No Live Current Affairs Pipeline:** The "Daily Current Affairs" section is backed by 56 static database rows seeded weeks ago. There is no working daily automated crawler, cron execution, or RSS parser running in production. Articles have null publication dates (`sourceDate: null`).
6. **NCERT Learning Void (Only 2 Linked Questions):** While marketed as a comprehensive foundational bridge for school and college aspirants, only **2 questions in the entire database** are linked to NCERT chapters (`NCERTChapterQuestionLink: 2`). The remaining 42 chapters provide external deep-links to NCERT PDF URLs with zero interactive practice questions.
7. **Bilingual Parity Deficit (80 of 121 Questions Lack Hindi):** Only 41 published questions have verified Hindi translations. 80 questions are English-only (`TRANSLATION_MISSING`). While ethically sound not to serve machine hallucinations, a Hindi-medium aspirant cannot complete full test papers in Hindi.
8. **Universal Search Broken on Production (`HTTP 500`):** Querying `/api/v1/search?q=polity` crashes on production because the search route executes parallel multi-domain queries across `Question`, `VideoLesson`, `TopperCopy`, `NCERTChapter`, `Glossary`, `InterviewQuestion`, and `MapFeature`—the latter two failing due to missing Neon tables.
9. **Fake AI Mentorship / Fallback Dependency:** If an administrator does not configure a funded Google Gemini API key (`GEMINI_API_KEY`), the AI Assistant and Mains Evaluator silently degrade to a simple regex-based heuristic template (`Heuristic Response`). It provides generic study advice rather than true evaluation.
10. **Zero Multi-Exam Ingestion:** Despite an elaborate 14-exam taxonomy (CAPF, CDS, NDA, EPFO, etc.), there are **zero questions, zero papers, and zero syllabus nodes** in the database for any examination other than UPSC CSE.

---

## 4. Key Strengths to Preserve

Despite the gaps, the codebase has several enterprise-grade assets:
- **Clean Next.js 14 App Router Architecture:** All 58 routes compile with zero TypeScript errors.
- **Robust Security & Session Handling:** HMAC-SHA256 signed session cookies (`pravaah_user_id`) with 30-day expiry, constant-time verification, and `HttpOnly; Secure; SameSite=Lax` protection.
- **Prelims Practice Engine Reliability:** Real test sessions (`TestSession`), precise UPSC CSE marking formulas (+2.0 for correct, -0.666 for wrong, CSAT +2.5 / -0.833), and automated scorecard generation work reliably.
- **Zero Hallucination Standards:** The architecture strictly refuses to label machine translations as official UPSC text, maintains traceable source gazettes, and stores answer keys in dedicated relational models.
- **High-Yield Aspirant Media Collections:** 25 curated YouTube video masterclasses, 13 authentic annotated topper answer scripts (AIR 1, 2, 3), and 16 high-yield geographic map features are beautifully structured in the schema.

---

## 5. Can a Real Student Prepare Using Pravaah Today?

### The Verdict: **NO, NOT FOR A COMPLETE JOURNEY.**

- **What they CAN do today:** A student can register, log in, browse the syllabus, review 121 high-quality UPSC Prelims questions with explanations, take 3 practice test sessions, watch 25 curated strategy videos, review 13 topper scripts, and look up 30 constitutional terms in the bilingual glossary.
- **Why they CANNOT prepare fully:**
  1. The question bank runs dry after ~120 questions.
  2. Mains evaluation crashes with HTTP 500 on live production.
  3. Interactive interview drills and map features crash with HTTP 500 on live production.
  4. Universal search crashes with HTTP 500 on live production.
  5. Current affairs are weeks old and static.
  6. CSAT practice has only 47 questions.
  7. There are no full-length 100-question timed mock test simulations.

---

## 6. Should a Student Pay for Pravaah Today?

### The Verdict: **ABSOLUTELY NOT.**

1. **Transaction Impossibility:** The payment gateway crashes with `ORDER_CREATION_FAILED - authentication Failed` upon clicking "Upgrade Plan".
2. **Value Mismatch:** Charging ₹149/mo, ₹299/mo, or ₹499/mo when competitor platforms (such as Vision IAS, ForumIAS, or Testbook) offer 10,000+ questions, live daily current affairs, and working mentors would immediately trigger chargebacks, consumer complaints, and reputational damage.
3. **The ethical imperative:** Pravaah must remain in a free, transparent public beta until its database contains at least 2,500+ published questions and its production serverless database is fully migrated and healthy.
