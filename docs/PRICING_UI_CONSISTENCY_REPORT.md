# PRICING UI CONSISTENCY & FRONTEND SYNCHRONIZATION REPORT
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Document Type:** Frontend Design System & UI Consistency Audit  
**Date:** November 24, 2026  

---

## 1. Scope of Frontend Audit

The frontend audit reviewed all components displaying plan names, pricing tiers, billing cycles, or checkout modals:
1. **Homepage Pricing Section (`app/page.tsx` #pricing)**
2. **Dedicated Pricing Page (`app/pricing/page.tsx`)**
3. **Upgrade Trigger Modal (`components/UpgradeModal.tsx`)**
4. **Checkout Order Summary (`app/checkout/[orderId]/page.tsx`)**
5. **Admin Pricing Management Console (`app/admin/plans/page.tsx`)**

---

## 2. Before vs After Synchronization Matrix

| Surface | Defect Identified (Before) | Resolution Implemented (After) | Status |
| :--- | :--- | :--- | :--- |
| **Homepage (`app/page.tsx`)** | Lacked interval toggle; only monthly prices shown; Tier 3 labeled "Aspirant Scholar"; dormant notice displayed. | Added interactive Monthly / Quarterly (Save ~11%) / Annual (Save ~44%) pills; Tier 3 renamed "Aspirant Elite"; dormant notice replaced with Cashfree 256-bit Secure Checkout badge. | **SYNCHRONIZED** |
| **Pricing Page (`/pricing`)** | Mixed terminology; legacy codes in initial state; dormant notice claiming gateway is down. | Upgraded `INITIAL_PLANS` to canonical `FREE`, `PLUS`, `PRO`, `ELITE`; added per-month breakdown (₹83/mo for Plus Annual, ₹166/mo for Pro Annual, ₹291/mo for Elite Annual); official Cashfree payment protection banner installed. | **SYNCHRONIZED** |
| **Upgrade Modal (`UpgradeModal.tsx`)** | Hardcoded ₹5,499 annual and ₹799 monthly; contradicted database prices; hardcoded code "ACHIEVER". | Dynamic pricing using canonical `PRO` rates: Monthly ₹299, Quarterly ₹799, Annual ₹1,999 (Save 44%); sends canonical `PRO` code to create-order. | **SYNCHRONIZED** |
| **Checkout Summary (`/checkout/[orderId]`)** | Did not display verified breakdown between base rate, discount, and net payable. | Clean order presentation showing exact order amount in Rupees, security encryption badges, and official Cashfree Hosted SDK container. | **SYNCHRONIZED** |
| **Admin Plans (`/admin/plans`)** | Ambiguous code names (`BEGINNER`, `ACHIEVER`, `SCHOLAR`) confusing operators. | Clean display showing canonical codes (`FREE`, `PLUS`, `PRO`, `ELITE`), subscriber counts, configured interval matrix, and inline editing. | **SYNCHRONIZED** |

---

## 3. Heritage Visual Identity Compliance

All updated components adhere strictly to the Pravaah UPSC Indian Heritage design tokens:
* **Primary Burgundy:** `#741A2B` (buttons, active tabs, header accents)
* **Dark Wine:** `#3A101A` (typography headings, deep badges)
* **Antique Gold:** `#C69A4A` (popular plan border, security check icons, savings highlights)
* **Warm Ivory:** `#FBF7F0` (section backgrounds, contrast cards)
* **Cream:** `#FAF2E6` (pill wrappers, subtle notice containers)
* **Typography:** `Lora`/`Playfair Display` for editorial headings; `Inter` for functional dashboard controls.
