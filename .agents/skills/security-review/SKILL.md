---
name: security-review
description: Comprehensive security auditing and hardening for authentication, authorization, token verification, payment isolation, and database safety.
---

# Security Review Skill

## Core Principles
1. **Zero-Trust Token Verification**:
   - Every session token and JWT must be cryptographically verified using HMAC SHA-256 (`AUTH_SECRET`).
   - Never allow unverified raw user IDs or CUID patterns (`^cm[a-z0-9]+$`) to authenticate in production or preview environments.
   - Restrict any mock authentication headers or raw ID bypasses strictly to `process.env.NODE_ENV === "test"`.
2. **Environment Variable & Secret Hygiene**:
   - `AUTH_SECRET` must be set in production; fail closed with an explicit runtime exception if missing.
   - Cashfree API secrets (`CASHFREE_CLIENT_SECRET`, `CASHFREE_WEBHOOK_SECRET`) must never be leaked to client bundles (`NEXT_PUBLIC_`) or server response payloads.
   - Maintain `ENABLE_PAYMENTS=false` across preview and launch beta until all production verification criteria are satisfied.
3. **API & Route Hardening**:
   - Validate all user inputs using Zod or strict structural schemas.
   - Enforce rate limiting on authentication endpoints (`/api/v1/auth/*`) and payment initiation endpoints (`/api/v1/payments/*`).
   - Use parameterized SQL queries exclusively (via Prisma ORM or prepared client statements) to eliminate SQL injection vulnerabilities.
4. **Session & Cookie Security**:
   - Store authentication cookies with `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` flags in production.
   - Prevent CSRF and verify Origin/Referer headers on state-changing POST/PUT/DELETE requests.
