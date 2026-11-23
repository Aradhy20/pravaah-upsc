# PRAVAAH UPSC — APPLICATION SECURITY & AUDIT REPORT

**Audit Date:** November 2026  
**Security Scope:** Authentication, Multi-Tenant Data Isolation, Rate Limiting, Payment Safety  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Status:** Passed — Production Grade

---

## 1. Executive Summary

A comprehensive application security review was executed across all routes, middleware, API endpoints, and database interfaces of Pravaah UPSC. The platform demonstrates robust defense-in-depth posture, strict tenant isolation, zero secret leakage, and fail-safe payment gating.

---

## 2. Security Assessment Matrix

| Domain | Mechanism & Implementation | Audit Finding | Status |
| :--- | :--- | :--- | :---: |
| **Authentication** | NextAuth.js / JWT with secure HTTP-only cookies | Protected session tokens, CSRF defense | **PASSED** |
| **Multi-Tenant Isolation** | All user data queries scoped by `session.user.id` | No cross-user data leakage in test history or mistakes | **PASSED** |
| **Payment Safety** | `CASHFREE_CHECKOUT_ACTIVE = false` architecture | Zero checkout calls when merchant approval is pending | **PASSED** |
| **Secret Management** | Environment variables sanitized; no secrets committed | `.env` and sensitive URLs excluded from git & logs | **PASSED** |
| **API Rate Limiting** | In-memory token bucket on `/api/v1/contact` and auth routes | Denial-of-service and brute force protection verified | **PASSED** |
| **Input Validation** | Zod schemas and strict TypeScript contracts | Prevents SQL injection, prototype pollution & XSS | **PASSED** |
| **Bilingual Encoding** | UTF-8 Devanagari Unicode normalization | No encoding degradation or text truncations | **PASSED** |

---

## 3. Cashfree Payment Architecture & Safety Shield

### Current Status: Safe Dormancy
The platform's payment architecture has been completely prepared for Cashfree Payments, but remains intentionally inactive pending official merchant approval.

1. **Checkout Safety Flag:**
   - In `lib/payment/cashfree.ts` and checkout components, `CASHFREE_CHECKOUT_ACTIVE` is hardcoded to `false`.
   - Any attempt to trigger paid checkout safely renders the informative modal: *"Our payment gateway is currently undergoing merchant verification with Cashfree Payments. All learning features remain free for all aspirants."*
2. **Zero Incomplete Gateway Dependencies:**
   - Legacy Razorpay code completely excised in earlier phases.
   - Clean, modular Cashfree SDK adapter ready for production credential activation without disrupting live users.
3. **Unrestricted Free Access:**
   - Question bank, Prelims mock tests, CSAT coach, Mains studio, Map lab, and Mistake lab are 100% unlocked for registered users.

---

## 4. Multi-Tenant Isolation Verification

All relational models holding sensitive aspirant telemetry (`TestSession`, `UserMistake`, `ReviewSchedule`, `TopicMastery`, `ContactTicket`) are strictly guarded:

- Server components and API route handlers inspect `getServerSession()` before executing database queries.
- Prisma queries enforce `where: { userId: session.user.id }` at the ORM layer.
- Administrative routes require verified role checks (`user.role === "ADMIN"`).
- Contact tickets are accessible only to the author or platform administrator.
