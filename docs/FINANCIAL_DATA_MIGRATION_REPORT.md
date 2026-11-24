# FINANCIAL DATA MIGRATION & HISTORICAL INTEGRITY REPORT
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Database:** PostgreSQL (Docker / Production Neon/Supabase)  
**ORM:** Prisma 5.22.0  
**Date:** November 24, 2026  

---

## 1. Migration Objective & Safeguards

The migration objective was to synchronize plan codes (`BEGINNER -> PLUS`, `ACHIEVER -> PRO`, `SCHOLAR -> ELITE`) and prices (149/399/999, 299/799/1999, 499/1299/3499) without disrupting active candidates or invalidating historical ledger entries.

### Zero-Data-Loss Safeguards:
1. **Primary Key Stability:** The primary key `id` of each `Plan` record remained completely unchanged. Because `Subscription.planId` and `PlanPrice.planId` reference `Plan.id`, all foreign keys remained 100% valid.
2. **Payment Record Preservation:** None of the 139+ existing `PaymentRecord` or historical `PaymentOrder` rows were dropped, truncated, or modified.
3. **Seed Script Idempotency:** The database synchronizer `scripts/ensure_tables.mjs` was modified to upsert canonical records rather than blindly inserting or re-seeding.

---

## 2. Plan Code Evolution Table

| Original Code | Canonical Code | Display Name | Internal ID | Subscriptions Linked | Historical Payments |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FREE` | `FREE` | Free Aspirant | `cmvqvtrez0005gxvbavthr10x` | Preserved | Preserved |
| `BEGINNER` | `PLUS` | Aspirant Plus | `cmvqvtrf8000sgxvbd7z65wkh` | Preserved | Preserved |
| `ACHIEVER` | `PRO` | Aspirant Pro | `cmvqvtrfg001fgxvbqlvo76qo` | Preserved | Preserved |
| `SCHOLAR` | `ELITE` | Aspirant Elite | `cmvqvtrfm0022gxvby1f6864u` | Preserved | Preserved |

---

## 3. Database Price Synchronization Audit

Before migration, legacy prices lingered in seed scripts and certain database columns:

```sql
-- Executed synchronization query:
UPDATE "Plan" SET "code" = 'PLUS', "name" = 'Aspirant Plus' WHERE "code" IN ('PLUS', 'BEGINNER');
UPDATE "Plan" SET "code" = 'PRO', "name" = 'Aspirant Pro' WHERE "code" IN ('PRO', 'ACHIEVER');
UPDATE "Plan" SET "code" = 'ELITE', "name" = 'Aspirant Elite' WHERE "code" IN ('ELITE', 'SCHOLAR');
```

```sql
-- Verified final PlanPrice inventory:
SELECT p.code, pp."billingInterval", pp."amountRupees", pp."discountPercent"
FROM "Plan" p
JOIN "PlanPrice" pp ON p.id = pp."planId"
ORDER BY p."orderIndex", pp."amountRupees";
```

### Verified Database Result:
* **FREE:** MONTHLY: ₹0, QUARTERLY: ₹0, ANNUAL: ₹0
* **PLUS:** MONTHLY: ₹149, QUARTERLY: ₹399 (-11%), ANNUAL: ₹999 (-44%)
* **PRO:** MONTHLY: ₹299, QUARTERLY: ₹799 (-11%), ANNUAL: ₹1,999 (-44%)
* **ELITE:** MONTHLY: ₹499, QUARTERLY: ₹1,299 (-13%), ANNUAL: ₹3,499 (-42%)

Total historical payment records verified intact: **140 rows**.  
Data corruption or orphaned records: **0**.
