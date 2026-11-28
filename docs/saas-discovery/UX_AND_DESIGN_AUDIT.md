# PRAVAAH UPSC — UX, UI & DESIGN SYSTEM AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Principal Design System Architect & Accessibility Specialist  
**Design System Baseline:** Tailwind CSS 3.4.15 with custom design tokens (`components/ui/**`)  
**Scope:** Responsive Layouts, Information Architecture, Color Contrast, Typography & Component States  

---

## 1. Executive Summary: Visual Polish vs. UX Friction

Visually, Pravaah UPSC is **one of the cleanest and most dignified ed-tech interfaces built for Indian civil services aspirants**. It eschews the chaotic, banner-heavy advertising common to traditional coaching websites in favor of a calm, scholarly aesthetic reminiscent of Substack or academic journals.

However, from an **Information Architecture and User Experience standpoint**, there are notable redundancies, confusing navigation pathways, and inconsistent state handling that create cognitive friction for students.

---

## 2. Information Architecture & Navigation Redundancies

### Finding 1: Confusing Parallel Routes
A new student encounters several overlapping routes that serve almost identical purposes:
- **`/pyqs` vs `/prelims/pyqs`:** Both pages render the same underlying question filter interface. Having two public routes for the same core capability dilutes SEO authority and confuses users.
- **`/subjects` vs `/syllabus`:** `/subjects` lists 9 broad subject cards, while `/syllabus` lists the exact same subjects inside a hierarchical syllabus accordion. A student does not know which to click.
- **`/coverage` vs `/pyqs/inventory`:** Both pages display question bank statistics. `/coverage` is public-facing; `/pyqs/inventory` is an internal API inspection route.

### Recommendation:
Consolidate navigation into three clear top-level pillars:
1. **Explore Syllabus (`/syllabus`):** Single authoritative home for syllabus micro-nodes, subject trees, and NCERT alignments.
2. **Practice PYQs (`/pyqs`):** Canonical home for all Prelims and CSAT practice drills with clear stage/year filters.
3. **Mains & Strategy (`/mains`):** Subjective answer drafting, topper copies, and video masterclasses.

---

## 3. Component Design System Inspection (`components/ui/**`)

The codebase features a well-structured atomic design system in `components/ui/`:
- **`Buttons.tsx`:** Primary (`bg-blue-600 hover:bg-blue-700`), Secondary (`bg-gray-100 hover:bg-gray-200`), Outline, Ghost, and Destructive variants with loading spinner states.
- **`Cards.tsx`:** Standard card wrappers with rounded borders (`rounded-xl border border-gray-200 bg-white p-6 shadow-sm`).
- **`Badges.tsx`:** Academic badges for `GS1`, `GS2`, `MAINS`, difficulty (`EASY`, `MEDIUM`, `HARD`), and verification status (`OFFICIALLY_VERIFIED`, `HUMAN_VERIFIED`).
- **`Modal.tsx`:** Accessible modal dialog with backdrop blur, focus trap, and keyboard ESC escape handlers.
- **`States.tsx`:** Reusable `EmptyState`, `LoadingSkeleton`, and `ErrorAlert` components.

---

## 4. Mobile Responsiveness & Form Usability

- **Mobile Viewport (375px – 414px):**
  - The navigation header (`components/Header.tsx`) collapses into a slide-over mobile drawer with language switcher and login triggers.
  - The Exam Player (`components/ExamPlayer.tsx`) adapts its question navigation grid to a scrollable bottom sheet on mobile devices, ensuring the full question stem and options remain readable.
- **Form Handling:**
  - Forms on `/register`, `/login`, and `/contact` feature inline validation with red borders and human-readable error messages.
  - Password fields provide minimum character count feedback.

---

## 5. Performance & Asset Weight Analysis

Next.js production build metrics confirm **exceptional bundle efficiency**:
- **First Load JS Shared by All Pages:** **87.3 kB** (Industry average for Next.js is ~120–150 kB).
  - Main vendor chunk: `chunks/fd9d1056...` (53.6 kB).
  - Framework chunk: `chunks/2117...` (31.7 kB).
- **Core Web Vitals Estimate:**
  - Largest Contentful Paint (LCP): $\sim 1.1$s (Excellent).
  - Cumulative Layout Shift (CLS): $< 0.02$ (Zero layout shifts; fixed font heights).
  - First Input Delay (FID) / INP: $< 50$ms.

---

## 6. Accessibility (a11y) & Dark Mode Review

- **Color Contrast:** Deep navy headings (`text-slate-900`) and slate body text (`text-slate-700`) against warm ivory backgrounds (`bg-stone-50` / `bg-white`) achieve a contrast ratio $> 7:1$, easily surpassing WCAG AAA standards.
- **Keyboard Navigation:** Modals and option selection buttons (`components/QuestionCard.tsx`) support keyboard `Tab`, `Enter`, and `Space` selection.
- **Dark Mode Status:** Dark mode is **not currently implemented**. The CSS uses hardcoded Tailwind slate/white utility classes rather than `dark:` variant classes. While acceptable for MVP, late-night study sessions by aspirants make a dark theme a high-demand future enhancement.
