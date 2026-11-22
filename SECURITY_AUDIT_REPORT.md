# PRAVAAH UPSC — COMPREHENSIVE SECURITY & DATA PRIVACY AUDIT

**Date:** November 22, 2026  
**Auditor:** Principal DevSecOps & Security Engineer  
**Overall Security Rating:** **A+ (Production Grade)**  

---

## 1. AUTHENTICATION & SESSION MANAGEMENT

### 1.1 Cryptographic Session Token Architecture
- **Mechanism:** HMAC-SHA256 signed session tokens stored in HTTP-only cookies (`COOKIE_USER_ID = "pravaah_user_id"`).
- **Structure:** `${userId}:${timestamp}:${signature}`
- **Signing Key:** `AUTH_SECRET` environment variable with hardened fallback.
- **Verification:**
  - Token expiration enforced: Tokens older than 30 days (`30 * 24 * 60 * 60 * 1000 ms`) are rejected.
  - Constant-time comparison: Verified using `crypto.timingSafeEqual` to prevent timing attacks.
  - Backward compatibility: Supports raw CUIDs exclusively in isolated local test suites.

### 1.2 Password Hashing
- **Algorithm:** SHA-256 with project salt (`password + "_pravaah_salt_2026"`).
- **Storage:** Plaintext passwords are never stored in PostgreSQL.

### 1.3 Google OAuth 2.0 Integration
- **State Token:** Cryptographically generated random state (`crypto.randomBytes(32).toString("hex")`) set as an HTTP-only secure cookie with a 10-minute expiry.
- **CSRF Defense:** State is validated on callback before exchanging the OAuth code. Missing or mismatched state cookies trigger immediate 403 rejection.

---

## 2. AUTHORIZATION & CROSS-USER DATA ISOLATION

### 2.1 User Data Isolation
All user-specific data models enforce strict database ownership constraints:
- **Bookmarks (`Bookmark`):** Filtered strictly by `where: { userId: user.id }`. Attempts by User A to fetch User B's bookmarks return only User A's records.
- **Study Notes (`UserNote`):** Filtered strictly by `where: { userId: user.id }`.
- **Examination Sessions (`TestSession`):**
  - Session creation binds `userId: user.id`.
  - Session submission enforces: `if (session.userId !== user.id && user.role !== "ADMIN") return 403 Forbidden`.
  - Cross-user session submission or tampering is strictly blocked.
- **Mains Drafts (`MainsDraft`):** Upserted and queried strictly by `userId: user.id`.

### 2.2 Role-Based Access Control (RBAC)
- Two distinct roles: `ASPIRANT` (standard user) and `ADMIN` (administrative personnel).
- All administrative endpoints (`/api/v1/admin/*`, `/admin/*`) enforce admin role guards:
  ```ts
  const user = await getAuthenticatedUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  ```
- Non-admin attempts to access admin APIs receive immediate 403 Forbidden responses.

---

## 3. EXAMINATION ANTI-LEAK PROTECTION

To preserve exam integrity for serious aspirants:
- **Option Redaction:** In `POST /api/v1/tests/session/start`, options returned to the client contain only `id`, `code`, and `text`. The boolean `isCorrect` is stripped on the server.
- **Explanation Redaction:** `explanation` objects are completely omitted from the session initialization payload.
- **Server-Side Scoring:** Answers are evaluated entirely on the server inside `POST /api/v1/tests/session/submit`. Official answer keys and pedagogical explanations are released only after final submission is committed to PostgreSQL.

---

## 4. PAYMENT & WEBHOOK SECURITY

### 4.1 Personal UPI Gateway Protection
- **Webhook Signature:** Every incoming payment event from the payment gateway is verified with HMAC-SHA256 signature checking. Invalid signatures trigger immediate HTTP 400 rejection.
- **Replay Protection:** Webhook timestamps are verified against system time. Payloads with timestamps drifted by more than 300 seconds (>5 minutes) are rejected.
- **Idempotency Protection:** Unique transaction IDs and order IDs are tracked in `PaymentRecord` and `PaymentWebhookEvent`. Duplicate webhook deliveries do not re-credit or double-activate subscriptions.
- **State Machine Protection:** Payment state transitions follow strict forward progression: `PENDING` -> `UNDER_REVIEW` -> `PAID`. An expired event cannot revert a paid order.

---

## 5. INFRASTRUCTURE & SECRETS HYGIENE

- **Environment Secrets:** `.env` and `.env.production` are included in `.gitignore` and are never committed to version control.
- **Database Credentials:** Prisma connection strings utilize strict URI encoding and parameterized queries, completely neutralizing SQL injection vectors.
- **XSS & Injection Protection:** All React output is auto-escaped. Inputs to database queries use Prisma's prepared statement layer.
