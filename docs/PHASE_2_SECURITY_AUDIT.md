# PHASE 2: SECURITY AUDIT & VULNERABILITY ASSESSMENT
**Application:** Pravaah UPSC  
**Live URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Audit Scope:** Authentication, Authorization (RBAC), Data Isolation, Anti-Cheat / Anti-Leak, Payment Guards  
**Audit Date:** November 23, 2026  
**Auditor:** Principal Security Engineer & Application Security Architect  

---

## 1. Executive Summary

During Phase 2, a comprehensive application security assessment was conducted across all API routes, authentication pipelines, session management, administrative interfaces, and relational persistence models. 

Critical vulnerabilities—including an authentication bypass on demo prefix hashes and account data collision for unauthenticated visitors—were discovered, immediately remediated in code, and verified using automated security regression tests.

---

## 2. Vulnerability Remediation Matrix

| ID | Severity | Category | Vulnerability Description | Remediation Implemented | Verification Status |
|:---|:---:|:---:|:---|:---|:---:|
| **SEC-01** | **P0 (Critical)** | Authentication | `login/route.ts` permitted ANY password to authenticate if `passwordHash` started with `pravaah_demo_hash_` | Removed prefix bypass; enforced strict `user.passwordHash === computedHash` using salted SHA-256 | **RESOLVED & VERIFIED** |
| **SEC-02** | **P0 (Critical)** | Credentials | Default accounts (`admin@pravaah.in`, `aspirant@pravaah.in`) used demo hashes | Generated cryptographically salted SHA-256 hashes (`Admin@Pravaah2026!`, `Aspirant@Pravaah2026!`) | **RESOLVED & VERIFIED** |
| **SEC-03** | **P1 (High)** | Data Isolation | Unauthenticated visitors defaulted to `aspirant@pravaah.in`, sharing bookmarks and exam attempts | Introduced dedicated `guest-aspirant` account; completely isolated visitor telemetry | **RESOLVED & VERIFIED** |
| **SEC-04** | **P1 (High)** | Anti-Cheat | Risk of client inspection of answer keys during active timed mock exam sessions | Server strictly strips `isCorrect`, `explanation`, and citations from session start payloads | **RESOLVED & VERIFIED** |
| **SEC-05** | **P1 (High)** | Authorization | Direct publication of unreviewed questions in `POST /api/v1/admin/pyqs/publish` | Added strict validation requiring verified correct options and pedagogical explanation | **RESOLVED & VERIFIED** |
| **SEC-06** | **P1 (High)** | RBAC | Unauthorized access to admin telemetry and data integrity endpoints | Enforced strict `ADMIN` role verification across all 13 `/api/v1/admin/*` routes (401/403) | **RESOLVED & VERIFIED** |
| **SEC-07** | **P2 (Medium)** | Information Disclosure | `CRON_SECRET` had fallback default string in production environment | Required `CRON_SECRET` environment variable in production; rejected unauthorized triggers | **RESOLVED & VERIFIED** |
| **SEC-08** | **P2 (Medium)** | Financial Safety | Premature checkout processing before merchant approval | All checkout and webhook routes return HTTP 503 (`PAYMENTS_DISABLED`) with audit trails intact | **RESOLVED & VERIFIED** |

---

## 3. In-Depth Security Analysis

### 3.1 Strict Authentication & Password Cryptography
In `app/api/v1/auth/login/route.ts`:
```typescript
// BEFORE (VULNERABLE):
const isMatch =
  user.passwordHash === computedHash ||
  user.passwordHash.startsWith("pravaah_demo_hash_");

// AFTER (SECURE):
const computedHash = hashPassword(password);
const isMatch = user.passwordHash === computedHash;
```
The demo hash prefix condition permitted any arbitrary string to log in to accounts seeded with the demo prefix (including `admin@pravaah.in`). This vulnerability has been eradicated. All passwords are now strictly checked against salted SHA-256 hashes.

### 3.2 Cross-User Data Isolation & Guest Privacy
In `lib/auth.ts`:
```typescript
// BEFORE:
const defaultAspirant = await prisma.user.findUnique({
  where: { email: "aspirant@pravaah.in" },
});
return { id: defaultAspirant.id, email: defaultAspirant.email, ... };

// AFTER:
const guest = await prisma.user.findUnique({
  where: { id: "guest-aspirant" },
  include: { role: true },
});
return {
  id: guest.id,
  email: guest.email,
  name: "Guest Aspirant",
  role: "ASPIRANT",
  tier: 0,
};
```
Unauthenticated visitors are now partitioned into a sandbox `guest-aspirant` account. Registered aspirants retain 100% private bookmarks, notes, analytics, and revision queues.

### 3.3 Anti-Leak Protection for Exam Simulator
In `app/api/v1/tests/session/start/route.ts`:
```typescript
const sanitizedQuestions = test.questions.map((q) => ({
  id: q.id,
  questionText: q.questionText,
  options: q.options.map((o) => ({
    id: o.id,
    optionCode: o.optionCode,
    optionText: o.optionText,
    // isCorrect is strictly omitted!
  })),
  // explanation is strictly omitted!
}));
```
This guarantees that aspirants taking timed exams cannot inspect network payloads in browser Developer Tools to gain an unfair advantage.

### 3.4 Cashfree Pre-Activation Guard
Because Cashfree merchant onboarding is currently under review:
- `POST /api/v1/payments/create-order` -> **HTTP 503**
- `POST /api/v1/billing/checkout` -> **HTTP 503**
- `POST /api/webhooks/upi-gateway` -> **HTTP 503**
- `POST /api/v1/dev/webhook` -> **HTTP 503**

Zero financial transactions or unauthorized subscription activations can occur until valid production credentials and webhooks are configured.
