# Pravaah UPSC — Production Deployment Runbook

## 1. Prerequisites & Environment Configuration
Ensure `.env` in production contains the following configuration variables:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/pravaah_prod?sslmode=require"

# Next.js App
NEXT_PUBLIC_APP_URL="https://pravaah-upsc.in"
NODE_ENV="production"

# Billing (Razorpay / Stripe)
RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="xxx"
RAZORPAY_WEBHOOK_SECRET="xxx"
```

---

## 2. Production Deployment Steps (Vercel / AWS / VPS)

### Option A: Vercel Deployment
1. Connect GitHub repository `Aradhy20/pravaah-upsc`.
2. Configure Environment Variables in Project Settings.
3. Build command: `npx prisma generate && npm run build`.
4. Output directory: `.next`.

### Option B: Docker / Managed VPS (Ubuntu / Debian)
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Migrate database
npx prisma db push --skip-generate
npx prisma generate

# 4. Build application
npm run build

# 5. Start with PM2 process manager
pm2 start npm --name "pravaah-app" -- start

# 6. Start daily scheduled crawler (cron)
0 6 * * * /usr/bin/python3 /app/scripts/daily_current_affairs_crawler.py >> /var/log/pravaah_crawler.log 2>&1
```

---

## 3. Post-Deployment Verification Checklist
1. Health check: `GET /api/v1/auth/me` returns 200.
2. Question catalog: `GET /api/v1/questions?limit=10` returns verified questions with options.
3. Current affairs feed: `GET /api/v1/current-affairs` returns latest official stories.
4. Daily Quiz: `GET /api/v1/quiz/daily` returns active 5-question Prelims test.
5. Multi-exam directory: `GET /api/v1/exams` returns 8 UPSC examinations.
