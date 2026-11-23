# PRAVAAH UPSC — PHASE 6 ADMIN REVENUE DASHBOARD

**Route:** `/admin/revenue`  
**API Endpoint:** `/api/v1/admin/revenue`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Authorization:** Admin Role Verification (`checkAdminAccess`)

---

## 1. Overview & Business Metrics

The Pravaah UPSC Revenue Dashboard synthesizes real database records from the `Subscription`, `PaymentRecord`, `RefundRecord`, and `UserUsageLedger` tables into actionable SaaS financial intelligence.

Zero fake metrics, simulated transactions, or uncollected orders are counted as recognized revenue.

---

## 2. Core Financial KPIs

### 1. Monthly Recurring Revenue (MRR)
- Calculated as the monthly normalized value of all active paid subscriptions:
  $$\text{MRR} = \sum_{\text{Monthly}} \text{Amount} + \sum_{\text{Quarterly}} \frac{\text{Amount}}{3} + \sum_{\text{Annual}} \frac{\text{Amount}}{12}$$

### 2. Annualized Run Rate (ARR)
- Projected annual revenue based on the current active subscriber base:
  $$\text{ARR} = \text{MRR} \times 12$$

### 3. Gross Revenue Collected
- Authoritative sum of all `PaymentRecord` entities where `status = "SUCCESS"`.

### 4. Subscription Churn Rate
- Percentage of ever-paying subscribers who have cancelled or allowed their subscriptions to expire:
  $$\text{Churn Rate} = \frac{\text{Cancelled Subscriptions}}{\text{Active Subscriptions} + \text{Cancelled Subscriptions}} \times 100$$

### 5. Free-to-Paid Conversion Rate
- Percentage of registered aspirants who have converted into active paying subscribers:
  $$\text{Conversion Rate} = \frac{\text{Paid Active Subscribers}}{\text{Total Registered Users}} \times 100$$

---

## 3. Plan Distribution Breakdown

The dashboard provides real-time counts across the four active tiers:
- **Free Aspirant (`FREE`):** Tier 0
- **Aspirant Plus (`PLUS` / `BEGINNER`):** Tier 1 (₹149/mo)
- **Aspirant Pro (`PRO` / `ACHIEVER`):** Tier 2 (₹299/mo) — Flagship
- **Aspirant Elite (`ELITE` / `SCHOLAR`):** Tier 3 (₹499/mo)

---

## 4. Security & Access Control

- Only users with verified `role === "ADMIN"` in the database session can access `/admin/revenue` and invoke `GET /api/v1/admin/revenue`.
- Unauthenticated or non-admin requests receive HTTP 401 or HTTP 403 Forbidden.
