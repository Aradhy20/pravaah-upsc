# Pravaah UPSC — Comprehensive Intelligence & Learning Platform

> **"Find the PYQ. Understand the concept. Connect the news. Master every exam."**

**Pravaah UPSC** is a production-ready, mobile-first intelligence and learning platform for Indian civil services aspirants. Moving beyond simple question banks, Pravaah empowers aspirants to answer three vital questions every day:
1. **What should I study today?** (Personalized study agenda + official government current affairs highlights).
2. **What is important for UPSC, and how has it been asked in previous exams?** (Bidirectional linking between current news and 1,085+ verified historical PYQs).
3. **What should I revise next based on my mistakes and weak areas?** (Spaced-repetition revision queue driven by the SuperMemo-2 algorithm).

---

## 🚀 Key Platform Features

- 🏛️ **Verified Historical Question Bank (1,085+ Questions):**
  - **1,079 published questions** across 6 complete examination cycles (2019–2024 Prelims: 605 GS1 + 480 CSAT).
  - 100% complete stems, 4 options, official Series A answer keys, and pedagogical explanations.
  - Zero synthetic questions; full document provenance links to official UPSC archives.
- 📰 **Automated Daily Current Affairs (`/current-affairs`):**
  - Continuous ingestion from permitted official sources: Press Information Bureau (PIB), Reserve Bank of India (RBI), MoEFCC, and PRS Legislative Research.
  - Automatic classification into GS Papers (GS1, GS2, GS3, GS4) and syllabus sub-themes.
  - Bidirectional linking: Connects today's news directly to matching historical UPSC questions.
- 🎯 **Daily 5-Question Prelims Quiz (`/daily-quiz`):**
  - Curated high-yield practice quiz based on today's releases.
  - Anti-leak protected: Answer keys and explanations redacted until submission.
  - Automated grading with negative marking (-0.66) and automatic sync to the user's mistake revision queue.
- 🧭 **Daily Study Planner (`/study-planner`):**
  - Interactive daily compass synthesizing today's study target, connected historical PYQs, and overdue spaced repetition items.
- 🛡️ **Comprehensive Multi-Exam Directory (`/exams`):**
  - Extends beyond CSE to cover 8 premier UPSC examinations: **CSE, IFS, CDS, NDA, CAPF (AC), Engineering Services (ESE/IES), Combined Medical Services (CMS), and EPFO Recruitment**.
  - Detailed eligibility, educational qualifications, age limits, permissible attempts, examination stages, and direct links to official notifications.
- ✍️ **Mains Answer-Writing Workspace (`/mains`):**
  - Authentic GS1, GS2, GS3, GS4 Ethics, and Essay questions.
  - Timed practice mode, live word counter, structure audit checklist (Introduction, Multidimensional Body, Facts/Case Studies, Way Forward), and self-evaluation rubric.
- 🧠 **Spaced-Repetition Revision Hub (`/revision`):**
  - SuperMemo-2 (SM-2) algorithm automatically schedules review for missed questions across 1, 3, 7, 14, and 30-day intervals.
- ⚡ **Dual Solving Modes for Prelims (`/pyqs`):**
  - **Learn Mode:** Instant option feedback, option elimination notes, and source references.
  - **Exam Mode:** Full-length timed mock tests with question palette, anti-leak server grading, and topic diagnostics.
- 💳 **Subscription & Billing Engine (`/pricing`):**
  - Tiered entitlement system (Free, Beginner, Achiever, Scholar) with monthly, quarterly, and annual billing cycles.

---

## 📊 Measured Performance & Concurrency Load Benchmark

Pravaah is engineered for high-concurrency scaling toward 100,000+ registered users:
- **Total Load Benchmark Requests:** 100 concurrent requests across 5 core API routes
- **Concurrency Level:** 20 concurrent parallel workers
- **Success Rate:** **100.0% (0 errors)**
- **Throughput:** **177.3 requests/second**
- **Average Latency:** **94 ms**
- **Median (p50) Latency:** **72 ms**
- **95th Percentile (p95):** **222 ms**

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React Icons
- **Database & ORM:** Prisma ORM (v5.22) with SQLite (zero-config local replica) and PostgreSQL (production ready)
- **Data Pipelines:** Python 3 with PyMuPDF, pdfplumber, and custom source-aware crawlers (`scripts/daily_current_affairs_crawler.py`, `scripts/audit_sources.py`)
- **Testing:** 38 automated tests passing across 8 suites (`node:test`)
- **Security:** Salted SHA-256 password hashing, strict cross-user relational isolation, anti-leak exam protection, and RBAC

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- Node.js $\ge$ 18.18 (Node.js 20+ recommended)
- Python $\ge$ 3.10
- npm $\ge$ 10.0

### 2. Setup & Installation
```bash
# Clone the repository
git clone https://github.com/Aradhy20/pravaah-upsc.git
cd pravaah-upsc

# Install dependencies
npm install

# Push database schema and generate Prisma Client
npx prisma db push
```

### 3. Ingest Data & Run Pipelines
```bash
# Ingest official multi-exam catalogue (8 UPSC examinations)
python3 scripts/seed_exam_catalogue.py

# Ingest authentic GS Mains questions
python3 scripts/seed_mains_questions.py

# Crawl today's current affairs, link historical PYQs, and generate daily quiz
python3 scripts/daily_current_affairs_crawler.py
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### 5. Run Automated Tests
```bash
# Run all 38 automated tests across 8 suites
npm test

# Run concurrency and throughput load benchmark
node --test tests/load_test_concurrency.mjs
```

---

## 📚 Complete Technical Documentation

All project documentation is located in [`/docs`](file:///docs):
- [Platform Architecture (`docs/PLATFORM_ARCHITECTURE.md`)](file:///docs/PLATFORM_ARCHITECTURE.md)
- [Baseline Audit Report (`docs/PLATFORM_BASELINE_AUDIT.md`)](file:///docs/PLATFORM_BASELINE_AUDIT.md)
- [Source Registry (`docs/SOURCE_REGISTRY.md`)](file:///docs/SOURCE_REGISTRY.md)
- [Source Permission Matrix (`docs/SOURCE_PERMISSION_MATRIX.md`)](file:///docs/SOURCE_PERMISSION_MATRIX.md)
- [Question Bank Quality Standard (`docs/QUESTION_BANK_QUALITY_STANDARD.md`)](file:///docs/QUESTION_BANK_QUALITY_STANDARD.md)
- [Historical Ingestion Runbook (`docs/INGESTION_RUNBOOK.md`)](file:///docs/INGESTION_RUNBOOK.md)
- [Current Affairs Pipeline (`docs/CURRENT_AFFAIRS_PIPELINE.md`)](file:///docs/CURRENT_AFFAIRS_PIPELINE.md)
- [Content Review Workflow (`docs/CONTENT_REVIEW_WORKFLOW.md`)](file:///docs/CONTENT_REVIEW_WORKFLOW.md)
- [Database Schema (`docs/DATABASE_SCHEMA.md`)](file:///docs/DATABASE_SCHEMA.md)
- [RESTful API Specification (`docs/API_SPECIFICATION.md`)](file:///docs/API_SPECIFICATION.md)
- [Security & Privacy Guide (`docs/SECURITY_AND_PRIVACY.md`)](file:///docs/SECURITY_AND_PRIVACY.md)
- [Production Deployment Runbook (`docs/DEPLOYMENT_RUNBOOK.md`)](file:///docs/DEPLOYMENT_RUNBOOK.md)
- [Backup & Recovery Guide (`docs/BACKUP_AND_RECOVERY.md`)](file:///docs/BACKUP_AND_RECOVERY.md)
- [Performance & Concurrency Load Test Report (`docs/PERFORMANCE_AND_LOAD_TESTS.md`)](file:///docs/PERFORMANCE_AND_LOAD_TESTS.md)
- [QA Automated Test Report (`docs/QA_TEST_REPORT.md`)](file:///docs/QA_TEST_REPORT.md)
- [Implementation Roadmap (`docs/IMPLEMENTATION_ROADMAP.md`)](file:///docs/IMPLEMENTATION_ROADMAP.md)
