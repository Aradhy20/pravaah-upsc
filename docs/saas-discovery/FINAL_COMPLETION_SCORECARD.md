# PRAVAAH UPSC — FINAL PRODUCT COMPLETION SCORECARD

**Audit Date:** November 28, 2026  
**Auditor:** Chief Technology Officer & Principal SaaS Architect  
**Evaluation Standard:** Empirical Code, Database, Network & Functional Verification  
**Evaluation Scale:**  
- `0%`: Not implemented  
- `1–20%`: Initial structure only  
- `21–40%`: Partial implementation  
- `41–60%`: Major functionality missing  
- `61–80%`: Mostly implemented, but important gaps remain  
- `81–95%`: Functionally complete with limited outstanding issues  
- `96–100%`: Verified against acceptance criteria in production  

---

## 1. Executive Master Scorecard (19 Core Dimensions)

| # | Dimension | Code Implementation | Functional Reality | Data Readiness | Prod Readiness | Overall Score | Confidence | Justification & Primary Evidence |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **Frontend UI & Pages** | **90%** | **85%** | **40%** | **85%** | **75%** | 🟢 Very High | 59 routes render with zero layout shifts; lean 87.3 KB bundle; 4 routes crash due to backend table drift. |
| **2** | **Backend Route Handlers** | **88%** | **75%** | **35%** | **70%** | **67%** | 🟢 Very High | 72 endpoints implemented; 54 working live; 4 crashing on prod due to Neon drift; 1 blocked by payment creds. |
| **3** | **Database Schema Design** | **95%** | **90%** | **30%** | **65%** | **70%** | 🟢 Very High | 87 Prisma models cleanly designed; relational many-to-many syllabus mappings; remote Neon table drift. |
| **4** | **Question-Bank Data** | **40%** | **25%** | **15%** | **15%** | **24%** | 🟢 Absolute | Exactly 121 published questions; 2,052 verified questions sit unpromoted in staging buffer. |
| **5** | **Content Quality & Keys** | **95%** | **95%** | **95%** | **95%** | **95%** | 🟢 Very High | 100% of published questions have verified UPSC final keys, elimination explanations, and syllabus nodes. |
| **6** | **Authentication & Profile** | **92%** | **90%** | **90%** | **90%** | **91%** | 🟢 Very High | PBKDF2 hashing, HMAC session cookies, duplicate email guard (409), transactional registration (201). |
| **7** | **Learning Engine & Scoring** | **90%** | **88%** | **50%** | **85%** | **78%** | 🟢 Very High | Exact UPSC scoring rules (+2.0/-0.666, CSAT +2.5/-0.833); session management works end-to-end. |
| **8** | **Dashboard & Cockpit** | **85%** | **80%** | **40%** | **80%** | **71%** | 🟢 High | Readiness index and streak tracking functional; limited by student activity history. |
| **9** | **Current Affairs System** | **50%** | **30%** | **25%** | **20%** | **31%** | 🟢 Very High | 56 static articles seeded; dates are null; no automated daily PIB ingestion running in production. |
| **10** | **AI Mentorship & Copilot** | **80%** | **60%** | **35%** | **50%** | **56%** | 🟢 High | RAG query logic and Gemini bridge coded; silently falls back to heuristic if API key is absent. |
| **11** | **Mock Test Simulation** | **85%** | **80%** | **25%** | **80%** | **68%** | 🟢 Very High | Exam player with timer, palette, and scorecard works; only 3 pre-configured mock test presets available. |
| **12** | **Mains Subjective Practice** | **65%** | **45%** | **35%** | **20%** | **41%** | 🟢 Very High | 32 descriptive questions with word limits; AI evaluation crashes on live production (HTTP 500). |
| **13** | **Subscription Architecture** | **90%** | **85%** | **60%** | **80%** | **79%** | 🟢 Very High | Feature gating and tier allowances cleanly enforced in `lib/entitlements.ts`. |
| **14** | **Payment Gateway (Cashfree)**| **85%** | **60%** | **60%** | **25%** | **58%** | 🟢 Very High | Order creation throws HTTP 500 on live prod (`authentication Failed`); webhook verification logic passes unit tests. |
| **15** | **Admin Operations** | **85%** | **80%** | **70%** | **75%** | **78%** | 🟢 High | 14 admin pages managing ingestion, integrity, plans, revenue, and subscriptions. |
| **16** | **Security & Authorization** | **88%** | **85%** | **85%** | **75%** | **83%** | 🟢 Very High | Parameterized queries, role checks, HMAC cookies; missing rate limiting on auth and AI routes. |
| **17** | **Mobile Responsiveness** | **88%** | **85%** | **80%** | **85%** | **85%** | 🟢 Very High | Responsive layouts across 375px–1440px; collapsible mobile drawer and touch-friendly exam palette. |
| **18** | **Production Reliability** | **75%** | **65%** | **30%** | **45%** | **54%** | 🟢 Very High | 58 pages build cleanly; serverless Neon database table drift causes 4 public routes to crash. |
| **19** | **Commercial SaaS Readiness** | **60%** | **40%** | **15%** | **15%** | **33%** | 🟢 Very High | Broken checkout, 121 published questions, and stale current affairs prevent commercial readiness. |

---

## 2. Separate High-Level Architectural Dimensions

To provide complete transparency to leadership, the platform is summarized across five fundamental operational dimensions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FIVE-DIMENSIONAL MATURITY PROFILE                    │
├────────────────────────────────┬──────────────┬────────────────────────┤
│ Dimension                      │ Score (%)    │ Maturity Assessment    │
├────────────────────────────────┼──────────────┼────────────────────────┤
│ 1. Code Implementation         │ **79.6%**    │ Functionally Mature    │
│ 2. Functional Completeness     │ **69.7%**    │ Advanced Alpha         │
│ 3. Data Readiness              │ **43.9%**    │ Severely Constrained   │
│ 4. Production Reliability      │ **57.4%**    │ Impaired by DB Drift   │
│ 5. Commercial SaaS Readiness   │ **32.5%**    │ NOT READY FOR SALE     │
└────────────────────────────────┴──────────────┴────────────────────────┘
```

---

## 3. Scorecard Synthesis & Verdict

Pravaah UPSC has **solved the hardest architectural and technical engineering challenges**:
- The Next.js 14 codebase is modular, type-safe, and builds cleanly.
- The authentication, session signing, and role gating are production-grade.
- The exam player and scoring engine accurately mimic official UPSC conditions.
- The pedagogical explanations and syllabus taxonomy are authentic and academically rigorous.

**The failure is almost entirely operational and data-driven:**
- The remote database was never migrated, breaking 4 routes.
- The Cashfree environment variables on Vercel are misconfigured, breaking checkout.
- The 2,052 verified staging questions were never promoted, starving the student experience.

Fixing these three operational levers will instantly elevate the platform's commercial readiness score from **32.5% to 80%+**.
