# Pravaah UPSC — Civil Services Examination PYQ Learning Platform

> **"Find the PYQ. Understand the concept. Learn from every mistake."**

**Pravaah UPSC** is a production-ready, high-fidelity learning platform for UPSC Civil Services Examination (CSE) aspirants. Inspired by the useful information architecture of IASBoard and the rigorous subject categorization of Human Peritus, Pravaah delivers an uncluttered, light-academic experience for mastering Previous Year Questions (PYQs) across General Studies Paper I and Paper II (CSAT).

---

## 🚀 Key Highlights & Features

- 🏛️ **Prelims PYQ Explorer (`/pyqs`):** Filter 10+ years of UPSC questions across **GS Paper 1** and **GS Paper 2 (CSAT)**, individual years with live question counts, subjects, and topics.
- ⚡ **Dual Solving Modes:**
  - **Learn Mode:** Instant option feedback, detailed concept analysis, why alternatives are wrong, and official UPSC citations.
  - **Exam Mode:** Full-length timed simulation with a 2-hour countdown timer, question status palette, server-side anti-leak grading, and instant performance diagnostics.
- 🔍 **Exact & Conceptual Search:** Search by exact keywords (e.g., `Article 123`) or conceptual topics (e.g., `Presidential Ordinance`).
- 🧠 **Personal Revision & Mistake Queue (`/revision`):** Automatically logs missed questions to a dedicated revision queue for spaced re-testing.
- 📊 **Diagnostic Analytics Dashboard (`/dashboard`):** Real metrics on attempts, overall accuracy %, subject-by-subject strengths, and speed per question.
- 💳 **Transparent Pricing & Subscriptions (`/pricing`):** Monthly, Quarterly, and Annual billing cycles with 4 tiers (Free, Beginner, Achiever, Scholar). Includes server-side entitlement enforcement, 7-day money-back guarantee, and self-serve renewal management.
- ⚙️ **Administrative Plan & Revenue Ledger (`/admin/plans`, `/admin/subscriptions`):** Real-time price updates, active tier toggling, subscriber roster inspection, and webhook transaction monitoring.

---

## 📚 Complete Technical & Product Documentation

Comprehensive engineering documents are located in [`/docs`](file:///docs):
1. [Product Requirements Document (PRD)](file:///docs/PRD.md)
2. [Technical Requirements Document (TRD)](file:///docs/TRD.md)
3. [Application Flow & User Journeys (Mermaid Flowcharts)](file:///docs/USER_FLOWS.md)
4. [UI/UX Design Brief & Component System](file:///docs/UI_UX_BRIEF.md)
5. [Database Schema & ER Data Dictionary](file:///docs/DATABASE_SCHEMA.md)
6. [RESTful API Specification](file:///docs/API_SPECIFICATION.md)
7. [Phased Implementation Plan](file:///docs/IMPLEMENTATION_PLAN.md)
8. [Content Ingestion & Verification Plan](file:///docs/CONTENT_INGESTION_PLAN.md)
9. [QA Test Plan & Verification](file:///docs/QA_TEST_PLAN.md)
10. [Deployment & Security Manual](file:///docs/DEPLOYMENT_AND_SECURITY.md)

---

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React Icons
- **Database & ORM:** Prisma ORM with SQLite (zero-config local) & PostgreSQL (production ready)
- **State & Data Fetching:** React Hooks, Server Actions & RESTful API routes
- **Testing:** Unit, API integration, and End-to-End browser test suite
- **Authentication:** Secure cookie/JWT session auth with Role-Based Access Control (Aspirant vs. Admin)
- **Billing & Subscriptions:** Server-authoritative entitlement engine, HMAC-SHA256 verified webhooks, idempotency protection, and developer sandbox gateway

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- Node.js $\ge$ 18.18 (Node.js 20+ recommended)
- npm $\ge$ 10.0

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd upsc-platform

# Install dependencies
npm install
```

### 3. Database Initialization & Seed Data
```bash
# Generate Prisma Client & Push SQLite schema
npx prisma db push

# Populate with verified UPSC PYQs & answer keys
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build Verification

```bash
# Run unit, API integration, and subscription entitlement tests
npm test

# Run production build check
npm run build
```

---

## 📁 Repository Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── api/v1/           # REST API endpoints (questions, tests, billing, admin)
│   ├── pricing/          # Public responsive pricing page & checkout modal
│   ├── pyqs/             # Prelims PYQ Explorer
│   ├── mock-tests/       # Timed Exam Mode simulator
│   ├── dashboard/        # Learning analytics dashboard
│   ├── revision/         # Mistake revision queue
│   ├── bookmarks/        # Saved questions
│   ├── subjects/         # Subject directory
│   ├── admin/            # Content ingestion, plan management & subscriber ledger
│   │   ├── plans/        # Admin plan & price configuration console
│   │   └── subscriptions/# Admin subscriber & payment audit ledger
│   └── page.tsx          # Scholarly academic homepage
├── components/           # Reusable UI components (QuestionCard, FilterBar, ExamPlayer, Header)
├── docs/                 # All 10 project specification documents
├── lib/                  # Utilities (prisma client, entitlements engine, scoring, auth)
├── prisma/               # Prisma schema & seeding scripts
└── public/               # Static assets & icons
```

---

## 📄 License
This platform is built with an open, educational mission for UPSC Civil Services Examination aspirants. Question texts and official answer keys remain the intellectual property of the Union Public Service Commission (UPSC).
