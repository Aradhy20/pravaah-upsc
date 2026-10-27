# Deployment & Security Operations Manual
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Target Environments:** Local Development, Staging, Cloud Production (Node.js / Vercel / Railway / Docker)  

---

## 1. Local Development Setup

### 1.1 Prerequisites
- **Node.js:** v18.18.0 or later (v20+ recommended).
- **Package Manager:** `npm` (v10+).
- **Git:** Version control.

### 1.2 Step-by-Step Initialization
```bash
# 1. Clone repository & navigate to root
git clone <repo-url>
cd upsc-platform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Initialize Database & Run Seed Fixtures
npx prisma db push
npm run db:seed

# 5. Launch Development Server
npm run dev
# Server accessible at http://localhost:3000
```

---

## 2. Environment Variables Specification

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./dev.db` (local SQLite) or `postgresql://user:pass@host:5432/pravaah` | Primary database connection string |
| `NEXTAUTH_SECRET` | Yes | `generate-with-openssl-rand-base64-32` | Session encryption key |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` (Local) / `https://pravaah-upsc.com` (Prod) | Base domain for authentication redirects |
| `NEXT_PUBLIC_APP_NAME` | No | `Pravaah UPSC` | Public brand title |
| `NODE_ENV` | Yes | `development` / `production` | Node environment runtime |
| `RATE_LIMIT_MAX_REQ` | No | `60` | Max API requests per window per IP |
| `WEBHOOK_SECRET` | Yes | `whsec_pravaah_live_9922...` | Secret token for HMAC-SHA256 webhook signature verification |
| `PAYMENT_PROVIDER` | No | `SANDBOX_GATEWAY` / `RAZORPAY` / `STRIPE` | Active payment processor provider |
| `PAYMENT_GATEWAY_KEY_ID` | No | `rzp_live_...` or `pk_live_...` | Public API client key for checkout |
| `PAYMENT_GATEWAY_KEY_SECRET` | No | `sk_live_...` | Server-only private key (never exposed to frontend) |

---

## 3. Production Build & Deployment Pipeline

```bash
# 1. Clean build directory & run typecheck
npm run lint
npx tsc --noEmit

# 2. Compile Next.js production bundle
npm run build

# 3. Apply Prisma migrations to production database
npx prisma migrate deploy

# 4. Start production server
npm run start -p 3000
```

---

## 4. Security Architecture & Threat Mitigation

### 4.1 Security Headers Configuration
Next.js `next.config.js` enforces strict HTTP security headers:
- `Content-Security-Policy (CSP)`: Disallows unsafe inline scripts and untrusted frame ancestors.
- `Strict-Transport-Security (HSTS)`: `max-age=63072000; includeSubDomains; preload`.
- `X-Frame-Options`: `DENY` to prevent clickjacking attacks.
- `X-Content-Type-Options`: `nosniff`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation.

### 4.2 Data Sanitization & Input Validation
- All API route payloads validated through schema validation (Zod / TypeScript guardrails).
- Prisma ORM automatically uses parameterized SQL queries, completely eliminating SQL injection risks.
- Client inputs sanitized to prevent Cross-Site Scripting (XSS).

### 4.3 Anti-Leak Protection for Answer Keys
- In timed examination endpoints (`/api/v1/tests/session/start`), a dedicated server-side transformer strips `isCorrect`, `correctOption`, `explanation`, and `answerKey` from every question and option object before transmitting the response to the browser.
- Scoring is performed strictly on the server upon session submission.

### 4.4 Payment Gateway Security & Webhook Handling
1. **Zero Card Storage (PCI-DSS Compliance):** Pravaah never collects, handles, or stores credit/debit card numbers, CVVs, or banking PINs. All checkout interactions are tokenized and processed via certified PCI-DSS Level 1 compliant gateways.
2. **Cryptographic HMAC-SHA256 Webhook Verification:**
   Every incoming payment event is verified against `WEBHOOK_SECRET` using standard cryptographic message authentication. Tampered or unsigned requests are rejected immediately with HTTP 401.
3. **Idempotency & Replay Protection:**
   The webhook router checks `SubscriptionEvent.eventId` before applying any state modification. Re-transmitted or replayed webhook events return HTTP 200 without duplicate billing extensions or extra credits.
4. **Development Sandbox Flow:**
   When live payment gateway credentials are not configured in environment variables, the platform defaults to an explicitly labeled development sandbox mode. This prevents deceptive simulation of real financial transactions while enabling complete QA testing.

---

## 5. Backup, Disaster Recovery & Rollback

### 5.1 Database Backup Strategy
- **Automated Daily Snapshots:** For PostgreSQL installations, automated point-in-time recovery (PITR) with WAL archiving.
- **Logical Backups:** Daily `pg_dump` compressed and archived in secure, encrypted cold object storage.
- **SQLite Local Backup:** Instant backup command: `npm run db:backup`.

### 5.2 Zero-Downtime Rollback Procedure
If a production defect is detected post-deployment:
1. Revert Git release tag to the previous stable release.
2. If schema changes occurred, run Prisma down-migration scripts or roll forward with a non-breaking patch.
3. Redeploy the previous verified production container.

---

## 6. Production Readiness Checklist

- [x] All 10 technical documentation files created and cross-verified.
- [x] Database schema pushed and verified with complete relations.
- [x] Seed dataset loaded with verified UPSC questions and official answer keys.
- [x] Search and multi-facet filtering functioning with sub-150ms response times.
- [x] Learn Mode reveals options, explanations, and citations accurately.
- [x] Timed Exam Mode hides keys, manages timer, and scores accurately.
- [x] Revision and Bookmarks persist reliably.
- [x] Admin verification prevents premature publication of unverified questions.
- [x] Automated tests pass with 100% success rate (19/19 tests passing).
- [x] Production build succeeds cleanly without TypeScript or ESLint errors (29/29 routes built).
- [x] Pricing page (`/pricing`), subscriptions, and server entitlement engine active.
- [x] No secrets or `.env` files tracked in Git.
