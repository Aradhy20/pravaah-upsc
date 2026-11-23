# PRAVAAH UPSC — CONTACT, SUPPORT & GRIEVANCE INTEGRATION

**Routes:** `/contact`, `/api/v1/contact`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Official Desk Lead:** Aradhy Jain  
**Communication Channels:** Direct Phone, WhatsApp, Direct Email, PostgreSQL Ticket Management

---

## 1. Support Philosophy & Escalation Standards

Pravaah UPSC provides responsive, transparent, and direct access to platform administrators. Every inquiry—whether regarding question corrections, technical difficulties, payment queries, or general counseling—is tracked through our database ticketing pipeline.

---

## 2. Official Contact Information

All communication points across the platform header, footer, contact page, and terms of service are verified and synchronized:

- **Founder & Grievance Officer:** Aradhy Jain
- **Direct Telephone / WhatsApp:** `+91 7351522153`
- **Official Support Email:** `jainaradhy123@gmail.com`
- **Operating Hours:** Monday to Saturday, 09:00 AM – 08:00 PM IST
- **Physical Desk:** Moradabad, Uttar Pradesh, 244001, India

---

## 3. Data Model & Ticket Pipeline

### Prisma Model: `ContactTicket`

```prisma
model ContactTicket {
  id          String    @id @default(uuid())
  name        String
  email       String
  phone       String?
  subject     String
  category    String    @default("GENERAL") // QUESTION_DOUBT, BUG_REPORT, BILLING, GRIEVANCE
  message     String    @db.Text
  status      String    @default("OPEN")    // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  priority    String    @default("NORMAL")  // LOW, NORMAL, HIGH, URGENT
  userId      String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([email, status])
  @@index([category, status])
}
```

---

## 4. API Specification: `POST /api/v1/contact`

### Request Validation:
- `name`: String, minimum 2 characters.
- `email`: Valid RFC 5322 email string.
- `subject`: String, minimum 3 characters.
- `message`: String, minimum 10 characters.
- `category`: Allowed values: `GENERAL`, `QUESTION_DOUBT`, `BUG_REPORT`, `BILLING`, `GRIEVANCE`.

### Rate Limiting & Protection:
- Max 5 ticket submissions per 15 minutes per IP address.
- Automated tests pass `x-test-suite: "true"` to prevent false 429 rate-limit rejections in test environments.

---

## 5. Service Level Agreements (SLAs)

| Category | Initial Acknowledgment | Full Resolution SLA | Escalation Target |
| :--- | :---: | :---: | :--- |
| **Question Error / Key Dispute** | < 4 hours | < 24 hours | Content Verification Lead |
| **Technical / Bug Report** | < 2 hours | < 12 hours | Engineering Lead |
| **Billing / Subscription** | < 2 hours | < 24 hours | Support Operations |
| **Statutory Grievance (IT Rules)** | < 24 hours | < 15 days | Grievance Officer |
