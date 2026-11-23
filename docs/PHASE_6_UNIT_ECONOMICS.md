# PRAVAAH UPSC — PHASE 6 UNIT ECONOMICS & FINANCIAL MODEL

**Document Version:** 1.0.0  
**Target:** EdTech SaaS Financial Sustainability & Contribution Margins  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Currency:** Indian Rupee (INR / ₹)

---

## 1. Unit Economics per Paying Subscriber

The unit economics of Pravaah UPSC are designed to ensure high gross contribution margins ($> 75\%$) even under heavy student usage.

### Flagship Plan: Aspirant Pro (₹299 / month)

| Cost / Revenue Component | Amount (Monthly) | Notes & Assumptions |
| :--- | :---: | :--- |
| **Gross Subscription Revenue** | **₹299.00** | GST-inclusive retail price |
| Less: GST (18%) | ₹45.61 | Remitted to Government of India |
| **Net Revenue** | **₹253.39** | Base recognized SaaS revenue |
| Less: Payment Gateway Fee (~2.0% + GST) | ₹7.06 | Cashfree standard processing |
| Less: AI Mentor Compute Costs | ₹20.00 | 100 queries @ ₹0.20 per query (Gemini 1.5 Pro) |
| Less: Mains Evaluation Compute Costs | ₹25.00 | 5 evaluations @ ₹5.00 per rubric run |
| Less: Server & PostgreSQL Allocation | ₹10.00 | Scaled multi-tenant cluster cost per user |
| **Gross Contribution Margin** | **₹191.33** | **75.5% Net Contribution Margin** |

---

## 2. Operating Expense (OpEx) Model

1. **Fixed Infrastructure Costs:**
   - Vercel Pro Hosting: ₹1,650 / month ($20 USD)
   - PostgreSQL Managed Database (Storage & Compute): ₹2,500 / month
   - Domain & Security Monitoring: ₹500 / month
   - **Total Baseline Fixed OpEx:** ~₹4,650 / month.
2. **Break-Even Point:**
   - At a net contribution margin of ₹191 per Aspirant Pro subscriber, the platform reaches operational break-even at **just 25 paying subscribers**.

---

## 3. Financial Projections & Scenarios

| Cohort Milestone | Paying Subscribers | Gross Monthly Revenue | Annualized Revenue (ARR) | Operating Costs | Monthly Net Profit | Margin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Break-Even** | 25 | ₹7,475 | ₹89,700 | ₹6,000 | +₹1,475 | 19.7% |
| **Early Traction** | 100 | ₹25,400 | ₹3,04,800 | ₹9,500 | +₹15,900 | 62.6% |
| **Base Scaled** | 500 | ₹1,27,000 | ₹15,24,000 | ₹27,500 | +₹99,500 | 78.3% |
| **Growth Target** | 1,000 | ₹2,54,000 | ₹30,48,000 | ₹48,000 | +₹2,06,000 | 81.1% |
