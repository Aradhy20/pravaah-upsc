# CANONICAL PRICING CATALOGUE SPECIFICATION
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Document Type:** Financial Architecture Specification & Catalogue Reference  
**Single Source of Truth:** `lib/payments/pricing-catalogue.ts`  
**Date:** November 24, 2026  

---

## 1. Canonical Plan Tiering Matrix

Pravaah UPSC defines exactly four membership tiers designed to support Civil Services aspirants through structured progression:

| Tier | Canonical Code | Display Name | Target Persona | Core Features |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `FREE` | **Free Aspirant** | Beginners & Evaluators | 15 authentic PYQs/day, Daily 5-Q Quiz, Official Answer Keys, 5 Bookmarks, 3 Notes |
| **1** | `PLUS` | **Aspirant Plus** | Foundation Builders | 50 authentic PYQs/day, SM-2 Spaced Mistake Notebook, 1 Full Mock/mo, 50 Notes/Bookmarks |
| **2** | `PRO` | **Aspirant Pro** *(Flagship)* | Serious Prelims & Mains Candidates | Unlimited PYQs, 2-Hr Timed Mock Simulator (+2/-0.666), AI Personal Mentor (100 msgs), Mission Control, 5 Mains Evaluations/mo |
| **3** | `ELITE` | **Aspirant Elite** | Advanced Mastery Candidates | Unlimited PYQs, AI Personal Mentor (300 msgs), 15 Mains Evaluations/mo, Current Affairs Converter, Priority WhatsApp Support |

---

## 2. Canonical Pricing & Savings Schedule

All pricing is specified in Indian Rupees (INR) with all applicable educational taxes included:

| Plan Code | Monthly | Quarterly Rate | Quarterly Savings | Annual Rate | Annual Savings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`FREE`** | ₹0 | ₹0 | ₹0 (0%) | ₹0 | ₹0 (0%) |
| **`PLUS`** | ₹149 | ₹399 *(₹133/mo)* | Save ₹48 (~11%) | ₹999 *(₹83.25/mo)* | Save ₹789 (~44%) |
| **`PRO`** | ₹299 | ₹799 *(₹266.33/mo)* | Save ₹98 (~11%) | ₹1,999 *(₹166.58/mo)* | Save ₹1,589 (~44%) |
| **`ELITE`** | ₹499 | ₹1,299 *(₹433/mo)* | Save ₹198 (~13%) | ₹3,499 *(₹291.58/mo)* | Save ₹2,489 (~42%) |

### Mathematical Savings Formulations
* **Quarterly Savings:**  
  $$\text{Savings}_\text{Q} = (\text{Price}_\text{Monthly} \times 3) - \text{Price}_\text{Quarterly}$$
  $$\text{Discount}_\text{Q} = \text{round}\left(\frac{\text{Savings}_\text{Q}}{\text{Price}_\text{Monthly} \times 3} \times 100\right)$$
* **Annual Savings:**  
  $$\text{Savings}_\text{A} = (\text{Price}_\text{Monthly} \times 12) - \text{Price}_\text{Annual}$$
  $$\text{Discount}_\text{A} = \text{round}\left(\frac{\text{Savings}_\text{A}}{\text{Price}_\text{Monthly} \times 12} \times 100\right)$$

---

## 3. Plan Code & Alias Normalization

To ensure 100% backward compatibility with existing databases, cached tokens, and historical payment logs, `normalizePlanCode()` automatically resolves all alias representations:

```typescript
export const PLAN_CODE_ALIASES: Record<string, CanonicalPlanCode> = {
  // Canonical
  FREE: "FREE",
  PLUS: "PLUS",
  PRO: "PRO",
  ELITE: "ELITE",

  // Legacy Database Codes
  BEGINNER: "PLUS",
  ACHIEVER: "PRO",
  SCHOLAR: "ELITE",

  // UI / Display Variants
  ASPIRANT_FREE: "FREE",
  ASPIRANT_FOUNDATION: "FREE",
  FOUNDATION: "FREE",
  ASPIRANT_PLUS: "PLUS",
  ASPIRANT_PRO: "PRO",
  ASPIRANT_ELITE: "ELITE",
  ASPIRANT_SCHOLAR: "ELITE",
  PRELIMS_PRO: "PRO",
};
```
