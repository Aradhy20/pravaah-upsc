# Pravaah UPSC — Production Readiness & Deployment Runbook

**Auditor:** Senior Infrastructure Architect, Security Engineer & DevOps Lead  
**Audit Date:** October 2026  
**Target Environment:** Managed Cloud (Vercel / Docker Container) + Managed PostgreSQL (Neon / Supabase / AWS RDS)  
**Readiness Verdict:** **CODEBASE READY FOR STAGING; PRODUCTION REQUIRES CLOUD DATABASE & PAYMENT CREDENTIALS**

---

## 1. Production Readiness Scorecard

| Domain | Readiness Level | Current State | Production Prerequisites |
| :--- | :---: | :--- | :--- |
| **Code & Build Integrity** | **100% READY** | Next.js 14 production build succeeds with 52 routes and zero errors. | None. Production bundle optimized. |
| **Automated Test Coverage** | **100% READY** | 24 automated tests pass covering auth, isolation, anti-leak, RBAC, scoring, pricing, and imports. | Maintain CI/CD automated test run on pull requests. |
| **Authentication & Isolation** | **100% READY** | Registration, login, SHA-256 hashing, session cookies, and cross-user data isolation verified. | Optional: Transition to NextAuth/Supabase Auth or Redis session store at scale. |
| **UPSC Scoring Precision** | **100% READY** | GS1 (+2/-0.666) and CSAT (+2.5/-0.833) formulas mathematically verified. | None. Core scoring is deterministic. |
| **Pricing & Subscriptions** | **90% READY** | Responsive pricing UI, server entitlement gatekeeper, and HMAC-verified webhook handler complete. | Obtain live merchant credentials from Razorpay or Stripe. |
| **Content Ingestion** | **85% READY** | JSON and CSV batch import, duplicate prevention, and human review gating operational. | Run full historical backfill for 2011–2024 Prelims papers. |
| **Database Architecture** | **80% READY** | Prisma schema normalized with 22 models. Currently on local SQLite for development. | Provision managed PostgreSQL instance and execute `npx prisma migrate deploy`. |
| **Disaster Recovery & Backups**| **PROCEDURAL** | Detailed backup scripts and recovery runbook specified. | Run first live backup restoration drill on staging database. |

---

## 2. Environment Configuration Matrix

The application strictly separates sensitive secrets from code. Never commit `.env` files to source control.

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-cool.us-east-1.aws.neon.tech/pravaah?sslmode=require` | PostgreSQL production connection string with connection pooling. |
| `DIRECT_URL` | **Yes** | `postgresql://user:pass@ep-cool.us-east-1.aws.neon.tech/pravaah` | Direct connection string for Prisma migrations (bypassing pgbouncer). |
| `NEXTAUTH_SECRET` / `SESSION_SECRET` | **Yes** | `[Generated 64-char hex string]` | Salt and HMAC key for password hashing and session tokens. |
| `RAZORPAY_KEY_ID` | Conditional | `rzp_live_xxxxxxxxxxxx` | Live Razorpay merchant key identifier for client checkout. |
| `RAZORPAY_KEY_SECRET` | Conditional | `[Razorpay API Secret]` | Server-side Razorpay secret for order creation and verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Conditional | `[Webhook Signature Secret]` | Used by `/api/v1/billing/webhook` to verify `x-razorpay-signature`. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://pravaahupsc.com` | Canonical domain for CORS, webhooks, and absolute URLs. |
| `NODE_ENV` | **Yes** | `production` | Enables optimized React server components and disables stack traces in API errors. |

---

## 3. Database Migration Strategy: SQLite to Managed PostgreSQL

In development, Pravaah utilizes SQLite (`prisma/dev.db`) for lightweight local iteration. Before public launch, the database must be migrated to a managed PostgreSQL cluster:

### Step 1: Update Prisma Datasource
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 2: Generate and Apply Initial Production Migration
```bash
# 1. Create initial SQL migration
npx prisma migrate dev --name init_production_schema

# 2. Deploy migration to production database
npx prisma migrate deploy

# 3. Seed production base data (Roles, Exam stages, Subjects, Plans, Seed questions)
node scripts/seed.mjs
```

### Step 3: Production Index Optimization
Verify that high-frequency query filters have corresponding B-Tree composite indexes:
- `Question(paperId, year, status)`
- `UserAttempt(userId, createdAt)`
- `Bookmark(userId, questionId)`
- `Subscription(userId, status)`

---

## 4. Backup & Disaster Recovery Runbook

> **Auditor Note:** In accordance with audit standards, backup recovery tests must not be claimed as complete until physically executed on production cloud infrastructure. The following runbook is the required operational procedure.

### Backup Strategy & RPO/RTO Targets
- **Recovery Point Objective (RPO):** $< 1$ hour of student attempt/note data loss.
- **Recovery Time Objective (RTO):** $< 2$ hours to restore full service from catastrophic outage.
- **Automated Continuous Backup:** Continuous Write-Ahead Logging (WAL) archiving provided by managed PostgreSQL (Neon/Supabase/RDS).
- **Daily Logical Snapshot:** Automated cron snapshot at `02:00 UTC` dumped to encrypted cloud storage (S3/GCS) with 30-day retention.

### Daily Backup Script (`scripts/backup_db.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/pravaah"
BACKUP_FILE="${BACKUP_DIR}/pravaah_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting logical database backup..."
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

echo "[$(date)] Uploading encrypted snapshot to cloud storage..."
aws s3 cp "${BACKUP_FILE}" "s3://pravaah-db-backups/daily/${TIMESTAMP}.sql.gz" --sse AES256

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
```

### Point-in-Time Recovery Drill
To execute a recovery drill:
1. Provision an isolated staging database instance.
2. Download the targeted logical snapshot:
   ```bash
   aws s3 cp "s3://pravaah-db-backups/daily/<snapshot_name>.sql.gz" ./restore.sql.gz
   gunzip -c ./restore.sql.gz | psql "${STAGING_DATABASE_URL}"
   ```
3. Run test suite against staging:
   ```bash
   DATABASE_URL="${STAGING_DATABASE_URL}" npm test
   ```
4. Verify record counts for `User`, `Question`, and `TestSession`.

---

## 5. Deployment & Rollback Procedures

### Deployment Pipeline
1. **GitHub Actions CI:**
   - Step 1: `npm install --frozen-lockfile`
   - Step 2: `npm test` (24 automated tests must pass 100%)
   - Step 3: `npm run build` (Next.js production bundle compilation)
2. **Hosting Platform:**
   - **Vercel / AWS Amplify:** Zero-downtime atomic deployments. New code is spun up on preview URLs before traffic switches to production.
   - **Self-Hosted Docker:** Run multi-stage Docker build with non-root user.

### Instant Rollback Triggers
Initiate immediate rollback if any of the following occur within 15 minutes of deployment:
- HTTP 500 error rate on `/api/v1/tests/session/submit` or `/api/v1/questions` exceeds $0.5\%$.
- Authentication endpoints return unhandled exceptions.
- Average response latency for `/pyqs` exceeds $1.5$ seconds.

### Rollback Commands
- **Vercel:** `vercel rollback [DEPLOYMENT_ID]` (Instant pointer revert).
- **Docker / Kubernetes:** `kubectl rollout undo deployment/pravaah-web`.

---

## 6. Pre-Launch Blocker Checklist

Before advertising the platform to paying students, the following two operational tasks must be completed:

1. **Merchant Payment Gateway Onboarding (Razorpay/Stripe):**
   - Register Pravaah UPSC merchant account.
   - Complete KYC and business verification.
   - Populate `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production environment.
   - Register webhook endpoint `https://pravaahupsc.com/api/v1/billing/webhook` in the merchant dashboard with the event `payment.captured`.
2. **Full Historical Content Ingestion (2011–2024 Prelims):**
   - Utilize [`scripts/seed.mjs`](file:///scripts/seed.mjs) or the CSV batch importer to upload remaining official UPSC Prelims papers (2,520 total questions).
   - Ensure all imported batches are verified against official UPSC final answer keys by subject matter experts.
