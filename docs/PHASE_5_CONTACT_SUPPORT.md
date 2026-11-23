# PHASE 5 — CONTACT & ASPIRANT SUPPORT SYSTEM ARCHITECTURE

**Platform:** Pravaah UPSC  
**Component:** Contact Desk, Direct Communication Channels & Support Ticket Engine  
**Status:** IMPLEMENTED, DATABASE INTEGRATED & VERIFIED  

---

## 1. Executive Overview

Aspirant trust in a high-stakes competitive examination SaaS platform depends on **transparency, responsiveness, and clear channels of human escalation**. When a student encounters a disputed answer key, a technical issue during a timed mock test, or an ambiguity in Hindi terminology, they require immediate, reliable assistance.

Pravaah UPSC provides:
1. Three direct real-time communication channels.
2. A formal database-backed support ticketing engine (`SupportTicket` model in PostgreSQL).
3. Public Service Level Agreements (SLAs).
4. Direct escalation access to the founder and engineering lead (Aradhy Jain).

---

## 2. Official Direct Support Channels

| Channel | Contact Reference | Primary Use Case | Target Response SLA |
| :--- | :--- | :--- | :--- |
| **Direct Telephone** | `+91 7351522153` (`tel:+917351522153`) | Critical access blocking bugs, platform failures during exam prep | Under 1 hour (9 AM – 9 PM IST) |
| **WhatsApp Helpdesk** | `+91 7351522153` (`https://wa.me/917351522153`) | Screenshots of questions, disputed keys, translation corrections | 2–4 hours (Daily) |
| **Academic Desk Email** | `jainaradhy123@gmail.com` (`mailto:jainaradhy123@gmail.com`) | Detailed answer writing evaluations, institutional partnerships, security audits | Within 4 hours |

---

## 3. Database Schema & Ticket Model

Every support inquiry submitted via the web portal or `/api/v1/contact` is persisted in the PostgreSQL database:

```prisma
model SupportTicket {
  id           String    @id @default(cuid())
  ticketNumber String    @unique // Format: "PRV-TKT-YYYYMM-XXXX"
  userId       String?
  user         User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  fullName     String
  email        String
  category     String    // Taxonomies listed below
  subject      String
  message      String    @db.Text
  status       String    @default("OPEN") // "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"
  priority     String    @default("NORMAL") // "LOW", "NORMAL", "HIGH", "URGENT"
  sourceIp     String?
  resolvedAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([email, status])
  @@index([status, createdAt])
}
```

### Ticket Number Generation Format:
- **Prefix:** `PRV-TKT`
- **Year-Month:** Current year and two-digit month (e.g. `202611`)
- **Random Entropy:** 4 uppercase alphanumeric characters excluding ambiguous characters (0/O, 1/I) (e.g. `K9P2`)
- **Example:** `PRV-TKT-202611-K9P2`
- **Collision Protection:** Database loop verifies uniqueness prior to final persistence.

---

## 4. Ticket Categories & Prioritization

The support desk classifies incoming tickets into 7 standardized categories:

1. **`CONTENT_CORRECTION`:** UPSC question bank correction (disputed option key, typo, syllabus alignment). Priority: `NORMAL`.
2. **`BILINGUAL`:** Hindi medium feedback or vocabulary enhancement. Priority: `NORMAL`.
3. **`ACCOUNT_LOGIN`:** Authentication issues, session timeouts, password resets. Priority: `HIGH`.
4. **`TECHNICAL`:** Exam engine freezing, timer glitches, mobile responsive layout errors. Priority: `HIGH`.
5. **`BILLING`:** Inquiries regarding future Cashfree payments or access tiers. Priority: `NORMAL`.
6. **`FEEDBACK`:** Pedagogical feature requests, new mock test topics. Priority: `LOW`.
7. **`OTHER`:** General queries addressed to the Pravaah UPSC academic team. Priority: `NORMAL`.

---

## 5. Security & Rate Limiting Guardrails

1. **Client IP Rate Limiting:** Enforces a rolling window of **maximum 5 ticket submissions per hour** per IP address or user ID to prevent bot spam or denial-of-service attempts. Exceeded limits return HTTP `429 Too Many Requests` with a prompt to use WhatsApp.
2. **Input Validation:**
   - Name: Minimum 2 characters.
   - Email: Valid RFC 5322 regex pattern.
   - Subject: Minimum 5 characters.
   - Message: Minimum 20 characters, maximum 3,000 characters.
3. **User Isolation:** If authenticated, the ticket is linked to `userId`. Unauthenticated guests can file tickets with valid email verification.

---

## 6. Verification & Delivery

- **API Endpoint:** `POST /api/v1/contact` (Verified functional, returning JSON confirmation and ticket ID).
- **Public Page:** `https://pravaah-upsc.vercel.app/contact` (Verified bilingual, responsive on desktop and mobile).
- **Global Footer:** Direct phone, WhatsApp, and email links rendered across all pages via `components/Footer.tsx`.
