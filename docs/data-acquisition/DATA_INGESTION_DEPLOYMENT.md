# Data Ingestion Deployment & Production Runbook

## 1. Prerequisites & Environment Setup

The ingestion pipeline runs alongside the Pravaah UPSC Next.js 14 / Prisma runtime.

Required Environment Variables:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pravaah_upsc?schema=public"
JWT_SECRET="pravaah-upsc-production-jwt-secret-***"
UPI_GATEWAY_API_KEY="test_api_key_***"
UPI_GATEWAY_API_SECRET="test_api_secret_***"
UPI_GATEWAY_WEBHOOK_SECRET="test_webhook_secret_***"
UPI_GATEWAY_BASE_URL="https://payments.pravaah.in"
NEXT_PUBLIC_APP_URL="https://pravaah-upsc.vercel.app"
```

---

## 2. Seeding & Ingestion Execution Commands

Execute database migrations and seeders in the following prescribed order:

```bash
# 1. Push latest schema additions to PostgreSQL
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed official 53 syllabus micro-topics
node scripts/seed_syllabus_nodes.mjs

# 4. Seed 27 multi-source registry records & historical periods
node scripts/seed_source_registry.mjs

# 5. Seed NCERT Books, Chapters, and PYQ relational links
node scripts/seed_ncert_knowledge_catalog.mjs

# 6. Seed historical questions (CSE 2011-2018, CDS, NDA, CAPF, EPFO)
node scripts/seed_historical_questions.mjs
```

---

## 3. Automated Cron Jobs & Maintenance Schedules

In production on Vercel or worker instances:
- **Daily at 05:00 IST**: `GET /api/v1/cron/daily-quiz` rotates active diagnostic quiz.
- **Hourly**: `GET /api/v1/cron/current-affairs` fetches official PIB releases and connects them to historical PYQs.
- **Weekly on Sunday 02:00 IST**: Source registry health check pings all registered endpoints.
