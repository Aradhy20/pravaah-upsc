# PRAVAAH UPSC — PHASE 6 SUBSCRIPTION ARCHITECTURE & LIFECYCLE

**Document Version:** 1.0.0  
**ORM:** Prisma 5.22.0 / PostgreSQL  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Status:** Provider-Independent Billing Architecture

---

## 1. Subscription Lifecycle State Machine

```
               [ FREE ] (Default)
                  │
                  ▼ (Checkout Initiation)
              [ PENDING ]
                  │
        ┌─────────┴─────────┐
        ▼ (Payment Success)  ▼ (Payment Failure)
     [ ACTIVE ]          [ FAILED ]
        │
   ┌────┴──────────────────────────┐
   ▼ (Cycle Elapsed)               ▼ (User Cancels)
[ PAST_DUE / EXPIRED ]       [ CANCELLED ]
   │                               │ (Retains access until period end)
   ▼                               ▼
[ FREE Tier Fallback ]       [ EXPIRED ]
```

---

## 2. Database Model Schema

### Relational Schema (`Subscription`):
```prisma
model Subscription {
  id                 String              @id @default(cuid())
  userId             String
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId             String
  plan               Plan                @relation(fields: [planId], references: [id])
  billingInterval    String              @default("MONTHLY") // "MONTHLY", "QUARTERLY", "ANNUAL"
  status             String              @default("ACTIVE")  // "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"
  currentPeriodStart DateTime            @default(now())
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean             @default(false)
  canceledAt         DateTime?
  providerSubId      String?
  events             SubscriptionEvent[]
  payments           PaymentRecord[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([userId, status, currentPeriodEnd])
}
```

---

## 3. Plan Upgrades & Downgrades

1. **Immediate Upgrades:**
   - When a student upgrades from Aspirant Plus to Aspirant Pro, the new tier entitlements (AI Mentor, Mission Control) activate immediately.
   - The unelapsed value of the previous plan is credited as a prorated discount on the initial charge.
2. **Downgrades & Non-Renewal:**
   - When an aspirant cancels renewal or chooses a lower tier, their active tier is maintained until `currentPeriodEnd`.
   - On the renewal date, the system transitions to the selected lower tier or Free Aspirant.
   - **Student Data Retention Guarantee:** Private study notes, test scores, mistake history, and bookmarks are permanently preserved and never deleted on downgrade.
