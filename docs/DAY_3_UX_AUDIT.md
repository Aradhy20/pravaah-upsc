# Pravaah UPSC — Day 3 User Experience & Navigation Audit
**Document ID:** `DOC-DAY3-UX-AUDIT-01`  
**Execution Context:** Day 3 Master Execution — Professional SaaS Experience & Authentication Flow  
**Date:** November 1, 2026  
**Auditor:** Senior SaaS Product Architect & UI/UX Designer  

---

## 1. Executive Summary

This audit examines the user journey and visual architecture across Pravaah UPSC, addressing the critical inconsistencies documented in the Day 3 execution directive. The audit focuses on role-based experience segregation, header navigation decluttering, registration journey enhancement, and subscription visibility.

---

## 2. Critical Authentication Inconsistencies & Root Causes

### 2.1 Issue 1: Admin Identity Displayed on Registration Page
- **Symptom:** A user navigating to `/register` sees "Create Aspirant Account" and "Complete Free Registration" while the top navigation displays an `ADMIN` identity, "Admin Portal", and "Sign Out".
- **Root Cause Analysis:**
  1. `components/Header.tsx` unconditionally invokes `/api/v1/auth/me`. When an administrator session cookie (`pravaah_user_id`) exists, the header renders the admin badge and controls regardless of the active page.
  2. The registration page (`app/register/page.tsx`) lacked authentication-state awareness: if an authenticated administrator arrived at `/register`, it did not offer a redirect to `/admin` or show an advisory notice that an administrator account is already active.
  3. The persistent "Switch Role" toggle button in the header directly mutated cookies to `admin@pravaah.in`, leaving the browser in an administrative state during casual navigation.

### 2.2 Issue 2: Crowded Desktop Navigation with Line Wrapping
- **Symptom:** On standard desktop displays (1024px to 1280px), the top navigation bar contained 9 direct links, an "Admin Portal" link, a "Sign Out" button, a "Switch Role" pill, and a "Practise" CTA.
- **Consequence:** Labels like "Current Affairs" and "Study Plan" wrapped onto secondary lines or forced the layout to overflow horizontally.
- **Root Cause:** Flat navigation structure with zero hierarchy or contextual grouping.

---

## 3. Strict Role Segregation Model

To resolve these issues, Pravaah implements four distinct navigation models:

```
                  ┌─────────────────────────────────────┐
                  │          USER SESSION TYPE          │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
    [ GUEST ]                   [ ASPIRANT ]                 [ ADMIN ]
  • Explore Learning          • Dashboard                  • Admin Portal
  • PYQs & Papers             • Learn / PYQs               • Content Management
  • Pricing                   • Practice / Tests           • Review Queue
  • Sign In                   • Current Affairs            • Subscriptions
  • Register (CTA)            • Revision (Queue)           • Platform Analytics
                              • Study Planner              • Sign Out
                              • Billing / Plan             
                              • Profile & Sign Out
```

### 3.1 Role Navigation Specifications

1. **Guest Experience (Unauthenticated):**
   - Brand Logo $\rightarrow$ `/`
   - Primary Links: `Explore Learning` (`/pyqs`), `Pricing` (`/pricing`), `About` (`/about`)
   - Action Items: `Sign In` (`/login`), `Register Free` (`/register` - highlighted button)
   - **Guarantees:** No identity information, no admin access links, no account dashboards visible.

2. **Aspirant Experience (Authenticated Aspirant):**
   - Brand Logo $\rightarrow$ `/dashboard`
   - Primary Links:
     - `Dashboard` (`/dashboard`)
     - `Learn` (Dropdown / Hub $\rightarrow$ `/pyqs`, `/current-affairs`, `/daily-quiz`, `/subjects`)
     - `Practice` (Dropdown / Hub $\rightarrow$ `/mock-tests`, `/revision`, `/study-planner`)
     - `Pricing` (`/pricing`)
   - Profile Dropdown / User Menu:
     - Aspirant Full Name & Email
     - Current Plan Badge (e.g. `Free`, `Prelims Pro`)
     - `Subscription & Billing` (`/dashboard/billing`)
     - `Sign Out` (`/api/v1/auth/logout`)
   - **Guarantees:** No administrative routes visible; seamless access to personalized learning tools.

3. **Administrator Experience (Authenticated Admin):**
   - Brand Logo $\rightarrow$ `/admin`
   - Navigation:
     - `Admin Portal` (`/admin`)
     - `Content Management` (`/admin/questions`)
     - `Review Queue` (`/admin/review`)
     - `Subscriptions` (`/admin/subscriptions`)
     - `Coverage & Imports` (`/admin/coverage`)
   - User Menu:
     - `Admin` Badge (Amber styling)
     - `Sign Out` (`/api/v1/auth/logout`)
   - **Guarantees:** Visiting `/register` renders an administrative redirect notice ("You are currently signed in as an Administrator. Access your Admin Portal or Sign Out to create an Aspirant account").

---

## 4. Enhanced Registration & Plan Selection Journey

### 4.1 End-to-End Funnel Architecture
```
[ Homepage / Pricing ] 
       │ Selects Plan (e.g. ACHIEVER, Annual)
       ▼
[ /register?plan=ACHIEVER&interval=ANNUAL ] 
       │ Aspirant inputs credentials & exam year
       ▼
[ Account Created & Authenticated ] 
       │ Seamless Auto-Redirect
       ▼
[ /api/v1/billing/checkout ] 
       │ Creates PENDING Order & Session
       ▼
[ Verified Payment / Activation ] 
       │ Webhook grants Entitlements
       ▼
[ /dashboard/billing?upgraded=true ] 
```

### 4.2 Registration Form Enhancements (`/register`)
- **Full Name:** Standardized input with icon.
- **Email:** Strict RFC-compliant validation with duplicate email error handling.
- **Password:** Minimum 6 characters with password visibility toggle.
- **Confirm Password:** Real-time client matching validation.
- **Target Exam Year:** Selector (2025, 2026, 2027, 2028).
- **Optional Subject:** Optional preparation field.
- **Terms & Honor Code Checkbox:** Mandatory explicit consent for UPSC honor code.
- **Selected Plan Banner:** If `?plan=...` is passed, display a highlighted badge: "Selected Plan: Prelims Pro (₹5,499/yr) — complete registration to continue to checkout".

---

## 5. Subscription Management & Billing Architecture (`/dashboard/billing`)

A professional educational SaaS must give aspirants 100% control over their billing:
1. **Current Plan Card:** Shows tier, name, billing cycle, status (Active, Free, Past Due, Cancelled).
2. **Renewal Information:** Actual server-computed `currentPeriodEnd` date. Never fabricated.
3. **Receipt & Payment History:** Authoritative list of past transactions with amount, order ID, date, and status badge.
4. **Actionable Upgrades:** Direct upgrade CTA for Free/Beginner users.
5. **Self-Serve Cancellation with Confirmation:** Modal requiring explicit confirmation before cancellation, explaining that access remains valid until the period ends.
