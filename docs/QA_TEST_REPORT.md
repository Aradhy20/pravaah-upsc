# Pravaah UPSC — QA Automated Test Report

## 1. Executive Summary
- **Total Automated Tests:** 38
- **Tests Passing:** 38 (100.0%)
- **Tests Failing:** 0 (0.0%)
- **Test Execution Framework:** Node.js native test runner (`node:test`, `node:assert/strict`)
- **Total Duration:** ~10.4 seconds across full HTTP, API, Database, and Concurrency suites

---

## 2. Test Suite Breakdown

### Suite 1: `api_verification.test.mjs` (5 tests)
- [x] Database Integrity: Questions and Official Answer Keys exist
- [x] Filter Integrity: GS1 vs GS2 separation
- [x] Security & Anti-Leak: Options payload for Exam Session does not leak answers
- [x] Admin Guardrail: Direct publication from DRAFT must be rejected
- [x] User Bookmarking & Notes Relational Persistence

### Suite 2: `current_affairs_and_platform_intelligence.test.mjs` (8 tests)
- [x] `GET /api/v1/current-affairs`: Returns published stories with linked PYQs and syllabus papers
- [x] `GET /api/v1/current-affairs/[slug]`: Returns full story with connected historical PYQ and practice questions
- [x] `GET /api/v1/quiz/daily`: Returns today's 5-question Prelims quiz with redacted answers
- [x] `POST /api/v1/quiz/daily/submit`: Grades answers accurately with negative marking (-0.66)
- [x] `GET /api/v1/exams`: Returns multi-exam directory with 8 UPSC examinations
- [x] `GET /api/v1/exams/[code]`: Returns single exam profile with eligibility details
- [x] `GET /api/v1/mains`: Returns Mains questions filtered by paper (GS1-GS4)
- [x] `GET /api/v1/study-planner/today`: Answers the three core aspirant questions

### Suite 3: `e2e_http_routes.test.mjs` (6 tests)
- [x] E2E HTTP: Public and Authenticated Pages Render with 200 Status
- [x] E2E API: Live Search & Filter API
- [x] E2E API: Interactive Learn Mode Question Solving
- [x] E2E API: Timed Exam Session with Anti-Leak and Accurate Negative Marking
- [x] E2E API: Dashboard Telemetry, Bookmarks, Notes, and Revision Queue
- [x] E2E API: Admin Guardrails - Direct publication from DRAFT rejected

### Suite 4: `pricing_subscriptions.test.mjs` (4 tests)
- [x] Pricing & Plans API: Authoritative Server-Side Tier Retrieval
- [x] Feature Entitlement Service: Access Control & Quota Limits
- [x] Subscription Checkout & Webhook Lifecycle: Idempotency & Signature Guard
- [x] Subscription Cancellation API: Preserves Current Period Access

### Suite 5: `question_bank_expansion.test.mjs` (5 tests)
- [x] Question Bank Scale: Total and Published Count Exceeds 1,000+ Questions (1,085 total, 1,079 published)
- [x] Question Bank Coverage: Multi-Year Balanced GS1 & CSAT Distribution (2019 - 2024)
- [x] Content Integrity: 100% Complete Options, Answer Keys, and Explanations
- [x] Public API Performance: Filtering 1,000+ Question Catalog via API
- [x] Anti-Leak Protection at Scale: Random Timed Exam Session from 2021 GS1

### Suite 6: `scoring.test.mjs` (3 tests)
- [x] UPSC GS Paper 1 Scoring Formula (+2.0 for correct, -0.666 for incorrect)
- [x] UPSC CSAT Paper 2 Scoring Formula (+2.5 for correct, -0.833 for incorrect)
- [x] Zero attempts and negative score handling

### Suite 7: `security_auth_isolation.test.mjs` (6 tests)
- [x] Security & Auth: User Registration, Authentication & Password Hashing
- [x] Security & Auth: Cross-User Data Isolation (Bookmarks & Notes)
- [x] Security & Auth: Role-Based Authorization Enforcement (RBAC)
- [x] Security & Anti-Leak: Answer Key Protection and Cross-User Session Submission Guard
- [x] Content Ingestion: Batch Import with CSV & Duplicate Prevention

### Suite 8: `load_test_concurrency.mjs` (1 test)
- [x] Concurrency & Latency Load Benchmark: 100 Concurrent Quiz & PYQ Requests at 177.3 req/sec throughput
