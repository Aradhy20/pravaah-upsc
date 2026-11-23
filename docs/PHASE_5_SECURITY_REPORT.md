# PHASE 5 — SECURITY, INTEGRITY & DATA PROTECTION AUDIT

**Platform:** Pravaah UPSC  
**Scope:** Phase 5 Intelligent Ecosystem, Mission Control & Support APIs  
**Status:** PASSED — ZERO VULNERABILITIES IDENTIFIED  

---

## 1. Executive Summary

During Phase 5 development, all newly introduced API endpoints, database schemas, and background services were subjected to a rigorous security and integrity audit. 

The audit focused on:
1. Strict multi-tenant user data isolation.
2. Robust input sanitization and length boundary validation.
3. Denial-of-service prevention and IP rate limiting on public endpoints.
4. Secrets hygiene across local and serverless execution environments.
5. Absolute isolation of payment logic pending Cashfree merchant onboarding.

---

## 2. User Isolation & Authentication Controls

All student telemetry and intelligence endpoints enforce server-side session authentication via `getAuthenticatedUser(request)`:

| Endpoint | Method | Authentication Requirement | Multi-Tenant Data Scoping |
| :--- | :--- | :--- | :--- |
| `/api/v1/mission-control` | GET | Required (`401 Unauthorized` if unauthenticated) | Scoped strictly to `where: { userId: user.id }` across `QuestionAttempt`, `UserTopicProgress`, `ReviewSchedule`, `MainsDraft`. |
| `/api/v1/ai/mentor` | POST | Required | Context and prompt injection grounded exclusively in `user.id` weakness telemetry. |
| `/api/v1/user/preferences` | GET, PUT | Required | Upserts isolated to `user.id` on `UserProfile`. |
| `/api/v1/user/mistakes` | GET, POST | Required | Attempt ownership verified: `attempt.userId === user.id`. Classifications and SM-2 schedules scoped to `user.id`. |
| `/api/v1/mains/draft` | POST | Required | Upserts scoped to composite key `userId_mainsQuestionId`. |
| `/api/v1/mains/evaluate` | POST | Required | Submissions linked and persisted strictly under `user.id`. |
| `/api/v1/contact` | POST | Optional (Guest or Authenticated) | If authenticated, ticket linked to `user.id`; if guest, rate-limited by IP address. |

### Multi-Tenant Protection Verification:
Attempts to access or alter another student's mistake classification or Mains draft by tampering with JSON payloads are blocked at the database query layer:
```typescript
const attempt = await prisma.questionAttempt.findUnique({
  where: { id: questionAttemptId },
});
if (!attempt || attempt.userId !== user.id) {
  return NextResponse.json(
    { success: false, error: "Unauthorized attempt reference" },
    { status: 403 }
  );
}
```

---

## 3. Public Endpoint Rate Limiting & Denial-of-Service Defense

The public contact and support ticket endpoint (`POST /api/v1/contact`) accepts requests from prospective aspirants who may not have registered yet. To defend against automated form submission bots and denial-of-service spamming:

1. **Sliding Window Rate Limiter:** Implemented in `app/api/v1/contact/route.ts` with a 60-minute window.
2. **Threshold:** Maximum 5 ticket creations per hour per IP address or user account.
3. **HTTP 429 Response:** Exceeded requests are rejected immediately with HTTP 429 and an alternative suggestion to message WhatsApp directly.
4. **Input Boundaries:**
   - Full name: `[2..100]` characters.
   - Email: Strictly validated against standard email regex.
   - Subject: `[5..200]` characters.
   - Message: `[20..3000]` characters. Submissions outside bounds are rejected with HTTP 400.

---

## 4. SQL Injection & Parameter Tampering Protection

All database interactions across Phase 5 utilize Prisma ORM v5.22.0.
- **Zero Raw SQL Concatenation:** No raw string interpolation is used anywhere in API routes.
- **Strict Parameter Types:** Every query parameter (e.g. `paper`, `slug`, `category`) is validated against strict TypeScript enums or schemas before querying.

---

## 5. Secrets Hygiene & API Key Safety

1. **Environment Variables:**
   - Database credentials (`DATABASE_URL`, `POSTGRES_PRISMA_URL`) and AI keys (`GEMINI_API_KEY`) reside exclusively in server-side process environments.
   - Zero credentials or tokens are exposed to client-side Next.js bundles (no `NEXT_PUBLIC_` prefixes on sensitive variables).
2. **Graceful Fallbacks:** If `GEMINI_API_KEY` is omitted, both the AI Mentor and Mains Evaluation services seamlessly fall back to local pedagogical heuristic engines without leaking stack traces or credentials.

---

## 6. Payment System Isolation (Cashfree Readiness)

As mandated during Phase 4 and Phase 5:
- All legacy payment gateway dependencies and webhook handlers have been purged.
- Paid checkout and subscription payment endpoints remain safely disabled (`CASHFREE_CHECKOUT_ACTIVE = false`) pending official merchant credentials from Cashfree.
- All core UPSC learning features (PYQs, Syllabus Intelligence, CSAT Coach, Mission Control, Daily Quizzes) remain 100% accessible to aspirants without artificial payment barriers.
