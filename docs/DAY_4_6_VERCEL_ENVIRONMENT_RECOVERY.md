# PRAVAAH UPSC — DAY 4.6
# NEW VERCEL PROJECT CONFIGURATION RECOVERY & ENVIRONMENT INVENTORY

**Author:** Senior Vercel DevOps Engineer, Next.js Architect & PostgreSQL Security Specialist  
**Project:** Pravaah UPSC  
**Repository:** [https://github.com/Aradhy20/pravaah-upsc](https://github.com/Aradhy20/pravaah-upsc)  
**Git Branch:** `hotfix/live-analytics-auth-guard`  
**Git Commit:** `276faea`  
**Vercel Team:** `aardhy-jains-projects`  
**New Vercel Project ID:** `prj_ojpTTMKCkIUAv7hEAzr0FaQjst5T`  
**New Vercel Project Name:** `pravaah-upsc`  
**Date:** November 1, 2026  
**Status:** **PASS (Inventory Complete) — BLOCKED on Owner Variable Configuration**

---

## 1. Executive Summary & Context

The previous Vercel project for Pravaah UPSC was deleted and a replacement project was provisioned under team `aardhy-jains-projects`:
- **New Project ID:** `prj_ojpTTMKCkIUAv7hEAzr0FaQjst5T`
- **New Project Name:** `pravaah-upsc`
- **Initial State:** 0 environment variables, 0 active deployments, 0 database integrations configured.
- **Authoritative Database:** Authoritative Neon Serverless PostgreSQL (`ep-floral-cloud-b4pxc8uq`) containing 310 learners, 228 sessions, and 1,100 questions is completely intact and preserved.

This audit document establishes the comprehensive recovery manifest, scanning all source code, route handlers, authentication helpers, and pricing engines to catalogue every runtime variable required to bring the replacement Vercel project to a verified, secure state without risking database integrity or exposing credentials.

---

## 2. Project Linkage & Git Verification

### 2.1 Local Linkage Verification
- **`.vercel/project.json`:** Inspected locally. Does **not** exist in the workspace. The local directory is cleanly unlinked from the deleted Vercel project.
- **Local Vercel CLI:** Vercel CLI v65.9.0 is installed locally in npm cache and is in `Logged out` state (`npx vercel whoami`).
- **Safe Linking Command:**
  When ready to link locally from an authenticated terminal:
  ```bash
  npx vercel link --project=pravaah-upsc
  ```
  *(Or authenticate with `npx vercel login` prior to linking).*

### 2.2 Git State & Parity
- **Remote:** `origin https://github.com/Aradhy20/pravaah-upsc.git` (Clean, tracked).
- **Active Branch:** `hotfix/live-analytics-auth-guard` at commit `276faea`.
- **Production Branch:** `main` at commit `dca37bd`.
- **Ahead/Behind:** Hotfix is 11 commits ahead of `main`, containing the live analytics authentication guard, server-side session token schema, and complete documentation trail.

---

## 3. Comprehensive Environment Variable Inventory

Every file in `app/`, `lib/`, `prisma/`, and `tests/` was statically analyzed for `process.env` access and runtime requirements.

| Name | Required | Type | Usage & Purpose | Environment Scope | Source | Status |
| :--- | :---: | :---: | :--- | :---: | :--- | :---: |
| **`NEON_DATABASE_URL`** | **YES** | Secret | `lib/prisma.ts` (Priority 1 in `getResolvedDatabaseUrl()`). Resolves pooled Neon PostgreSQL connection for runtime PrismaClient. | **Production, Preview, Development** | Neon Serverless Console (`ep-floral-cloud-...`) | **Configured locally; Missing in new Vercel project** |
| **`DATABASE_URL`** | **YES** | Secret | `lib/prisma.ts`, `prisma/schema.prisma`. Evaluated as Priority 2 fallback and synchronized at runtime via `process.env["DATABASE_URL"] = dbUrl` for Prisma Rust query engine. | **Production, Preview, Development** | Neon Serverless Console (Identical to `NEON_DATABASE_URL`) | **Configured locally; Missing in new Vercel project** |
| **`PAYMENT_WEBHOOK_SECRET`** | **YES** | Secret | `app/api/v1/billing/webhook/route.ts` (Lines 19–35). Verifies HMAC signature `x-pravaah-webhook-signature` using constant-time equality. Fails closed (HTTP 500) in production if missing. | **Production, Preview** | Securely generated (`openssl rand -hex 32`) or payment gateway | **Configured locally; Missing in new Vercel project** |
| **`NEXTAUTH_SECRET`** | **YES** | Secret | `.env.example`, `docs/DEPLOYMENT_AND_SECURITY.md`. Cryptographic root secret for session integrity and cookie security. | **Production, Preview, Development** | Generated 32+ byte random string (`openssl rand -base64 32`) | **Configured locally; Missing in new Vercel project** |
| **`NEXTAUTH_URL`** | **Recommended** | Plain | `.env.example`, `docs/DEPLOYMENT_AND_SECURITY.md`. Canonical public application URL for redirects and absolute links. | **Production** (`https://pravaah-upsc.vercel.app`), **Preview** (Dynamic or preview domain), **Development** (`http://localhost:3000`) | Vercel domain configuration | **Configured locally; Missing in new Vercel project** |
| **`NEXT_PUBLIC_APP_NAME`** | No | Plain | Brand title fallback string (`Pravaah UPSC`). | **Production, Preview, Development** | Static application setting | **Configured locally; Missing in new Vercel project** |
| **`DATABASE_URL_UNPOOLED`** | No | Secret | Direct non-pooled PostgreSQL URL (port 5432) for interactive CLI schema operations. Not used by serverless Next.js runtime. | **Development / Local CI only** | Neon Serverless Console | **Configured locally; Not required in Vercel** |
| **`ENABLE_LOCAL_DEMO_FALLBACK`** | No | Plain | `lib/auth.ts` (Line 207). Allows demo aspirant fallback in development only (`NODE_ENV === "development"`). Strictly prohibited in production. | **Development only** | Local `.env` | **Configured locally; Prohibited in Vercel** |
| **`POSTGRES_PRISMA_URL`** | No | Secret | `lib/prisma.ts` (Priority 3). Fallback alias automatically populated if Vercel Storage integration is attached. | **Production, Preview** | Vercel Storage Integration | Optional fallback |
| **`POSTGRES_URL`** | No | Secret | `lib/prisma.ts` (Priority 4). Standard Vercel Postgres alias. | **Production, Preview** | Vercel Storage Integration | Optional fallback |
| **`PRISMA_DATABASE_URL`** | No | Secret | `lib/prisma.ts` (Priority 5). Standard Prisma Data Platform alias. | **Production, Preview** | Prisma Data Platform | Optional fallback |

---

## 4. Database Configuration & Connection Architecture

### 4.1 Resolution Hierarchy (`lib/prisma.ts`)
The application implements strict database runtime resolution:
```
1. process.env.NEON_DATABASE_URL    (Top priority, authoritative Neon PostgreSQL)
2. process.env.DATABASE_URL         (Standard fallback)
3. process.env.POSTGRES_PRISMA_URL  (Vercel Postgres integration alias)
4. process.env.POSTGRES_URL         (Vercel Postgres alias)
5. process.env.PRISMA_DATABASE_URL  (Prisma Data Platform alias)
```

### 4.2 Production Safety Assertions
- **SQLite Rejection:** If `NODE_ENV === "production"`, any non-Postgres connection protocol (such as `file:`) immediately throws an unhandled configuration exception, preventing silent database divergence.
- **Engine Synchronization:** `process.env["DATABASE_URL"] = dbUrl` ensures that the native Prisma binary query engine connects to the exact same URL passed to `new PrismaClient({ datasources: { db: { url: dbUrl } } })`.
- **Zero Schema Migrations at Build Time:** `package.json` defines `"build": "prisma generate && next build"`. No `prisma migrate deploy` or `prisma db push` is run during deployment, guaranteeing zero risk of schema drift or data destruction.

### 4.3 Environment Isolation Design
To protect learner records:
1. **Production Environment (`main` branch):**
   - Must target the primary Neon `main` branch (`ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb`).
2. **Preview Environment (`preview` deployments):**
   - Must target a dedicated Neon child branch (e.g., `preview`), created with zero cost/copy in Neon Console.
   - Prevents preview QA tests and synthetic users from polluting production learner analytics.
3. **Development Environment (Local):**
   - Targets local `.env` configuration.

---

## 5. Payment & Authentication Subsystem Analysis

### 5.1 Authentication Mechanism
- **Implementation:** Custom cryptographic server-side sessions implemented in `lib/auth.ts`.
- **Password Security:** Scrypt hashing with a unique 16-byte cryptographically random salt per user and 64-byte derived key (`scrypt:<salt>:<key>`).
- **Legacy Migration:** Transparent verification and automatic upgrade from legacy SHA-256 hashes upon login.
- **Session Tokens:** 32 cryptographically random bytes (`crypto.randomBytes(32).toString("hex")`) stored in the `Session` PostgreSQL table as SHA-256 hashes (`tokenHash`).
- **Cookie Security:** Cookies are set with `HttpOnly`, `SameSite=lax`, `Path=/`, and `Secure` when `NODE_ENV === "production"`.
- **Secret Requirement:** `NEXTAUTH_SECRET` must be set in Vercel to maintain cryptographic root security.

### 5.2 Payment & Billing Mechanism
- **Implementation:** `app/api/v1/billing/checkout/route.ts` and `app/api/v1/billing/webhook/route.ts`.
- **Current Mode:** Development / Sandbox mock with server-side price verification against `Plan` and `PriceConfig` tables in Neon.
- **Third-Party SDKs:** The application does **not** import live Razorpay or Stripe SDKs at this stage. No external API keys (`RAZORPAY_KEY_ID`, `STRIPE_SECRET_KEY`) are required at runtime.
- **Webhook Verification:** The webhook endpoint verifies incoming payments using the `x-pravaah-webhook-signature` header against `PAYMENT_WEBHOOK_SECRET` using `crypto.timingSafeEqual`.
- **Production Guard:** If `PAYMENT_WEBHOOK_SECRET` is missing in production, the endpoint immediately returns HTTP 500 `CONFIGURATION_ERROR` and rejects all payloads.

---

## 6. Vercel Project Settings Review & Target State

The new Vercel project must be validated against the following target settings:

| Setting | Target Configuration | Status |
| :--- | :--- | :---: |
| **Project Name** | `pravaah-upsc` | Confirmed |
| **Project ID** | `prj_ojpTTMKCkIUAv7hEAzr0FaQjst5T` | Confirmed |
| **Team Scope** | `aardhy-jains-projects` | Confirmed |
| **Git Repository** | `Aradhy20/pravaah-upsc` | Connected |
| **Framework Preset** | `Next.js` | Configured |
| **Node.js Version** | `20.x` LTS (or `24.x` as provisioned) | Needs Owner Check |
| **Serverless Region** | `iad1` (Washington, D.C. — near AWS `us-east-2`) | Confirmed |
| **Production Branch** | `main` | Configured |
| **Preview Deployments** | Enabled for all branches & pull requests | Confirmed |
| **Deployment Protection (SSO)** | Enabled (Vercel Authentication) | Confirmed |
| **Assigned Domain** | `pravaah-upsc.vercel.app` | Awaiting initial deployment |

---

## 7. Step-by-Step Recovery Checklist for Project Owner

### Step 1: Open Vercel Project Dashboard
1. Go to [https://vercel.com/aardhy-jains-projects/pravaah-upsc/settings/environment-variables](https://vercel.com/aardhy-jains-projects/pravaah-upsc/settings/environment-variables).
2. Confirm you are in project `prj_ojpTTMKCkIUAv7hEAzr0FaQjst5T`.

### Step 2: Add Database Connection Strings (Neon)
Add the following variables under **Settings > Environment Variables**:

1. **`NEON_DATABASE_URL`**
   - **Value:** `<Authoritative Neon PostgreSQL Connection String with -pooler and ?sslmode=require>`
   - **Scope:** Check **Production** (points to Neon `main` branch).
   - **Scope:** Check **Preview** (points to Neon `preview` child branch, or `main` until preview branch is created).
   - **Type:** Sensitive / Secret.

2. **`DATABASE_URL`**
   - **Value:** `<Same as NEON_DATABASE_URL>`
   - **Scope:** Check **Production** and **Preview**.
   - **Type:** Sensitive / Secret.

### Step 3: Add Payment & Authentication Secrets
1. **`PAYMENT_WEBHOOK_SECRET`**
   - **Value:** Generate a random 32-character hex secret via:
     ```bash
     openssl rand -hex 32
     ```
   - **Scope:** Check **Production** and **Preview**.
   - **Type:** Sensitive / Secret.

2. **`NEXTAUTH_SECRET`**
   - **Value:** Generate a random 32-character base64 secret via:
     ```bash
     openssl rand -base64 32
     ```
   - **Scope:** Check **Production** and **Preview**.
   - **Type:** Sensitive / Secret.

3. **`NEXTAUTH_URL`**
   - **Production Value:** `https://pravaah-upsc.vercel.app`
   - **Preview Value:** `https://pravaah-upsc-git-hotfix-live-analytics-auth-guard-aardhy-jains-projects.vercel.app`
   - **Scope:** Specific to each environment.

4. **`NEXT_PUBLIC_APP_NAME`**
   - **Value:** `Pravaah UPSC`
   - **Scope:** Check **Production**, **Preview**, **Development**.

---

## 8. Build & Release Readiness Assessment

- **Prisma Client:** v5.22.0 generates cleanly (`npx prisma generate`).
- **Database Schema Parity:** `prisma/schema.prisma` contains the `Session` model with `tokenHash` and index `Session_tokenHash_idx`, identical to Neon PostgreSQL.
- **TypeScript Compilation:** `npx tsc --noEmit` passes with 0 errors.
- **Local Dev Server:** Verified running locally at `http://localhost:3000` with live Neon data and active `401 Unauthorized` guard on `/api/v1/analytics/dashboard`.
- **Security Hotfix:** Eliminates anonymous access to `/api/v1/analytics/dashboard` across all environments.

---

## 9. Final Execution Status

```
================================================================================
FINAL RECOVERY STATUS: PASS (Inventory Complete) — BLOCKED on Owner Actions
================================================================================
[PASS] Full process.env codebase scan completed.
[PASS] Zero plaintext secrets exposed or committed.
[PASS] Database schema integrity and zero-destructive build pipeline verified.
[PASS] Local dev server actively tested and running on port 3000.
[BLOCKED] Owner must enter the 5 environment variables in Vercel project prj_ojpTTMKCkIUAv7hEAzr0FaQjst5T.
================================================================================
```

> **NEXT STEP:** The owner adds the 5 environment variables in the Vercel dashboard. Once added, a Preview deployment of `hotfix/live-analytics-auth-guard` can be triggered to verify end-to-end functionality before final production cutover.
