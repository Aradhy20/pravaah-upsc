# PRAVAAH UPSC — PHASE 4: BUG FIX LOG
### Detailed Record of UI Defects Identified, Remediated & Verified

---

### 1. Defect Remediation Register

| Issue ID | Defect Description | Component / File | Root Cause | Resolution Applied | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-UI-01** | Desktop navbar items wrapping onto second line on 1024px–1366px screens. | `components/Header.tsx` | Excessive padding and missing flex container grouping. | Enforced strict single-line navigation with `flex-nowrap`, calibrated gap spacing, and clean Left/Center/Right grouping. | Verified on 1366px and 1440px viewports; single line confirmed. |
| **BUG-UI-02** | Mobile drawer allowed background page scrolling. | `components/Header.tsx` | Missing body overflow lock on drawer open. | Implemented `document.body.style.overflow = "hidden"` on menu open and restored on close. | Verified on small mobile (360px) and standard mobile (390px). |
| **BUG-UI-03** | Touch targets on mobile navigation were $< 36$px. | `components/Header.tsx` | Padding was too compact for touch screens. | Standardized all touch targets with `min-h-[44px]` and `min-w-[44px]`. | Conforms with WCAG 2.2 AA target size criteria. |
| **BUG-UI-04** | Exaggerated marketing claims on hero and cards ("0 Coaching Errors", "1,079+ questions"). | `app/page.tsx` | Hardcoded obsolete marketing placeholders. | Replaced with verified Phase 3 figures: 121 Prelims, 32 Mains, 41 Devanagari Hindi, 100% verified keys. | Audited against PostgreSQL database records. |
| **BUG-UI-05** | Hero search bar was misaligned and detached from column grid. | `app/page.tsx` | Grid column layout was poorly proportioned. | Created clean 2-column layout (7 cols left, 5 cols right) with full-width search input and connected `/pyqs?q=` action. | Verified on mobile and desktop viewports. |
| **BUG-UI-06** | Interactive question sample was detached from page flow. | `app/page.tsx` | Rendered as an orphaned card below the hero. | Re-architected as Section 3 with dedicated card container, bilingual switcher (`EN`, `HI`, `BOTH`), and pedagogical feedback. | Verified in browser; option selection preserved across language toggle. |
| **BUG-UI-07** | Paid subscription buttons had active appearance despite paused payment gateway. | `app/pricing/page.tsx` & `app/page.tsx` | Client UI did not reflect the Cashfree onboarding status. | Replaced checkout triggers with disabled lock buttons (*"Payments Temporarily Unavailable"* / *"Subscription Temporarily Paused"*) and clear informational banner. | Tested in automated suite `pricing_subscriptions.test.mjs`. |
| **BUG-UI-08** | Missing focus rings on interactive elements. | `app/globals.css` | Default browser outlines were suppressed without replacement. | Added accessible `*:focus-visible { outline: 2px solid #2453E6; outline-offset: 2px; }`. | Verified via keyboard Tab navigation. |
| **BUG-UI-09** | Potential horizontal overflow on small mobile screens (360px). | `app/globals.css` | Lack of root horizontal clipping. | Added `overflow-x: hidden` to root body and wrapped wide tables in `overflow-x-auto`. | Verified on 360px viewport screenshot with zero clipping. |
