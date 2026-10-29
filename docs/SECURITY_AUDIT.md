# PRAVAAH UPSC — Security, Data Isolation & Integrity Audit

**Status:** Security Hardened & Verified  
**Date:** October 2026  
**Auditor:** Senior Security Architect & Full-Stack Engineer  

---

## 1. Scope of Security Audit

An exhaustive security assessment of all server actions, API routes, and client data flows was performed across 5 critical vectors:
1. **Anti-Leak Defense:** Ensuring timed test sessions never transmit correct answers or explanations to the browser before submission.
2. **Cross-User Data Isolation:** Enforcing tenant isolation so students cannot view, modify, or delete another student's notes, bookmarks, exam attempts, or mains drafts.
3. **Role-Based Access Control (RBAC):** Restricting data ingestion, batch publishing, and content modification strictly to administrative accounts.
4. **Input Sanitization & Schema Validation:** Validating request payloads before executing database writes.
5. **Session & State Resilience:** Preventing data loss or state tampering across page reloads and temporary disconnections.

---

## 2. Security Assessment & Hardening Actions

### 2.1 Server-Side Anti-Leak Protection for Timed Exams
- **Risk:** If the test initialization endpoint (`/api/v1/tests/session/start`) sends `correctOption` or `explanation` in the JSON response, a student could inspect network traffic or client state in browser DevTools to read answers.
- **Implementation:** The endpoint uses Prisma `select` projections that explicitly include only:
  `{ id, questionNumber, questionText, options: { id, code, text } }`.
  Fields `correctOption`, `explanation`, and `eliminationTechnique` are omitted from the returned payload.
- **Verification:** Automated integration test `security_auth_isolation.test.mjs` probes the session start API and asserts that neither `correctOption` nor `explanation` exist in any question item in the response.

### 2.2 Cross-User Data Isolation
- **Risk:** Horizontal Privilege Escalation (IDOR) where User A supplies User B's `userId` or record ID to read or mutate private notes, drafts, or test results.
- **Implementation:**
  - In `/api/v1/user/notes`, `/api/v1/user/bookmarks`, and `/api/v1/mains/draft`, queries are scoped strictly by the authenticated session:
    ```typescript
    where: {
      userId: session.user.id,
      ...
    }
    ```
  - Direct updates to records verify ownership before executing mutations.

### 2.3 Administrative Route Protection (RBAC)
- **Risk:** Unauthenticated or standard student accounts accessing `/admin/ingestion`, `/api/v1/admin/ingestion`, or `/api/v1/admin/export`.
- **Implementation:**
  - Route handlers check `session?.user?.role === "ADMIN"`.
  - Non-admin or unauthenticated requests return `HTTP 401 Unauthorized` or `HTTP 403 Forbidden`.
- **Verification:** Security test suite verifies that unauthenticated `POST /api/v1/admin/ingestion` and `GET /api/v1/admin/export` are rejected with `HTTP 401/403`.

### 2.4 Question Issue Reporting & Spam Prevention
- **Implementation:** `/api/v1/questions/report` validates `questionId` existence in the database, sanitizes reporting reasons and comments, and commits records to `ContentReview` for editorial audit.

---

## 3. Automated Security Test Results

The security suite (`tests/security_auth_isolation.test.mjs`) validates:
1. `POST /api/v1/tests/session/start` does not leak `correctOption` in question payload (PASSED)
2. `POST /api/v1/tests/session/start` does not leak `explanation` in question payload (PASSED)
3. Unauthenticated access to `/api/v1/admin/ingestion` returns 401/403 (PASSED)
4. Unauthenticated access to `/api/v1/admin/export` returns 401/403 (PASSED)
5. User notes scoping ensures private records are isolated to authenticated owner (PASSED)
6. Anti-tamper marking calculations reject arbitrary client scores (PASSED)
