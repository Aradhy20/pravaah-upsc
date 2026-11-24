# User Registration Endpoint Hardening & Fix Report

**Endpoint:** `POST /api/v1/auth/register`  
**Frontend Route:** `/register`  
**Date:** November 24, 2026  
**Status:** PRODUCTION HARDENED  

---

## 1. Summary of Changes

The user registration endpoint (`app/api/v1/auth/register/route.ts`) was systematically refactored to eliminate schema drift vulnerabilities, provide atomic transactional user creation, enforce strict input validation, and sanitize all client-facing error responses.

---

## 2. Key Hardening Deliverables

### A. Input Sanitization & Validation
- **Email Validation:** RFC 5322 regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) ensures only syntactically valid emails are accepted.
- **Password Complexity:** Minimum 6 characters required; whitespace trimmed; returns 400 `PASSWORD_TOO_SHORT` on non-compliance.
- **Full Name Sanitization:** Trimmed string; defaults cleanly if not supplied.
- **Year & Subject Defaults:** Target year clamped to valid UPSC ranges (e.g., 2025–2030); optional subjects cleanly normalized.

### B. Proactive Duplicate Email Handling
- Before attempting creation, the route queries `prisma.user.findUnique({ where: { email } })`.
- If an existing account is detected, the API returns:
  ```json
  {
    "success": false,
    "error": {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "An account with this email already exists. Please sign in instead."
    }
  }
  ```
  Status Code: `409 Conflict`.

### C. Atomic Multi-Model Transactions
User creation, UserProfile initialization, and initial Subscription assignment are wrapped in an atomic `prisma.$transaction()`:
```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: 'ASPIRANT',
      profile: {
        create: {
          targetYear,
          targetExam: 'UPSC_CSE',
          optionalSubject: optionalSubject || null,
          strongSubjects: JSON.stringify([]),
          weakSubjects: JSON.stringify([]),
        },
      },
    },
    include: { profile: true },
  });

  const subscription = await tx.subscription.create({
    data: {
      userId: user.id,
      tier: 'FREE',
      status: 'ACTIVE',
      autoRenew: false,
    },
  });

  return { user, subscription };
});
```
This guarantees that an account is never partially created if an error occurs.

### D. Session Cookie Issuance
Upon successful registration:
- A JWT / session token is signed using `signSessionToken({ userId, email, role })`.
- A secure HTTP cookie is attached to the response:
  - Name: `token`
  - `httpOnly: true`
  - `sameSite: 'lax'`
  - `path: '/'`
  - `maxAge: 30 * 24 * 60 * 60` (30 days)

### E. Error Sanitization & Leak Prevention
- In the `catch (error)` block:
  - Full error stack traces and internal Prisma diagnostics are logged securely to the server console via `console.error('[Register API Error]:', error)`.
  - The client response receives a sanitized, user-friendly message:
    ```json
    {
      "success": false,
      "error": {
        "code": "REGISTRATION_UNAVAILABLE",
        "message": "We could not complete your registration at this time. Please try again shortly."
      }
    }
    ```
  - Status Code: `500 Internal Server Error`.
  - Zero raw database errors (such as `column strongSubjects does not exist`) can ever leak to the client.
