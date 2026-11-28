# Pravaah UPSC — Post-Launch 30-Day Operational Roadmap
**Target Period:** 1 December 2026 – 31 December 2026  
**Focus:** Platform Stability, User Feedback, Payment Gateway Activation, Content Enrichment  

---

## 1. Week-by-Week Operational Milestones

```
+─────────────────────────────────────────────────────────────────────────────+
|                          DECEMBER 2026 RELEASE TIMELINE                      |
+─────────────────────────────────────────────────────────────────────────────+
| Week 1 (Dec 1 - Dec 7): Controlled Beta Onboarding & Student Feedback       |
|   - Onboard initial cohort of 500 Civil Services aspirants                   |
|   - Monitor error telemetry, session stability, and database latency         |
|   - Process academic errata reports submitted through the feedback button    |
+─────────────────────────────────────────────────────────────────────────────+
| Week 2 (Dec 8 - Dec 14): Bilingual Gazette Digitization Expansion          |
|   - Expand verified Devanagari translations from official UPSC gazettes      |
|   - Reconcile the 10 quarantined multi-statement staging questions           |
|   - Add 50 new Mains GS4 Ethics case study frameworks                       |
+─────────────────────────────────────────────────────────────────────────────+
| Week 3 (Dec 15 - Dec 21): Cashfree Production Payment Go-Live               |
|   - Complete regulatory KYC verification with Cashfree Payments              |
|   - Run end-to-end sandbox-to-production transaction smoke test              |
|   - Toggle `ENABLE_PAYMENTS=true` to enable Aspirant Plus and Pro tiers      |
+─────────────────────────────────────────────────────────────────────────────+
| Week 4 (Dec 22 - Dec 31): AI Personal Mentor & Mission Control 2.0          |
|   - Expand Gemini 1.5 RAG corpus across 50,000 pages of standard UPSC texts  |
|   - Release automated weekly progress diagnostic reports to student inboxes  |
|   - Prepare January 2027 Prelims Crash Course mock test calendar             |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Key Metrics & Observability SLA

- **Platform Uptime:** > 99.9% availability on Vercel Serverless + Neon PostgreSQL.
- **P95 API Latency:** < 250ms on question querying and mock test submission.
- **Academic Accuracy:** 100% adherence to official UPSC revised answer keys.
- **Errata Resolution Time:** < 24 hours for verified question errata.
