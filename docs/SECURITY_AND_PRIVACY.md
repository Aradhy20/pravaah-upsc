# Pravaah UPSC — Security, Privacy & Data Isolation Architecture

## 1. Security Architecture Principles
1. **Zero Secret Leakage:** No database passwords, webhook signing secrets, or API keys are committed to Git or exposed in client bundles.
2. **Server-Side Authorization (RBAC):** Admin endpoints (`/api/v1/admin/*`) enforce strict database-level checks for `roleId === "ADMIN"` or valid session tokens.
3. **Cross-User Data Isolation:** Personal data (`Bookmark`, `UserNote`, `ReviewSchedule`, `DailyQuizAttempt`, `MainsDraft`) is strictly queried with `where: { userId: user.id }`.
4. **Answer Key Protection (Anti-Cheat):** In Exam Mode and Daily Quiz endpoints, option payloads before submission omit `isCorrect` and `correctOption`. Answers are computed exclusively server-side.
5. **SSRF and Input Sanitization:** URLs provided for news scraping and document extraction are validated against an allowlist of permitted domains (e.g., `upsc.gov.in`, `pib.gov.in`, `rbi.org.in`).
6. **Payment Webhook Verification:** Razorpay/Stripe webhooks require cryptographic HMAC SHA-256 signature verification before updating subscription records.

---

## 2. Privacy & Data Minimization
- Passwords hashed with salted SHA-256 (`lib/auth.ts`).
- Candidate names, notes, and study streaks are strictly isolated to authenticated sessions.
- Private session tokens stored in HTTP-only, SameSite cookies.
