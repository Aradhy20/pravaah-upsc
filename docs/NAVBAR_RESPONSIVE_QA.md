# Pravaah UPSC — Global Navigation Responsive QA Report

**Date:** November 23, 2026  
**Test Harness:** Headless Chromium Visual Engine (`window.innerWidth` & `window.innerHeight` simulation)  
**Target URL:** `http://localhost:3000` (Production Next.js build)  
**Tested Viewports:** 7 mandatory device profiles  
**Status:** 100% Passed (Zero Visual Regressions, Zero Horizontal Overflow)

---

## 1. Responsive Viewport Test Matrix

| Viewport Profile | Resolution | Device Category | Center Nav State | Right Utility State | Mobile Drawer | Horizontal Scroll | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1440px** | 1440 x 900 | Ultra-wide Desktop | Full 4 Groups (72px) | Full 36px Utility Bar | Hidden | None (0px) | **PASS** |
| **1366px** | 1366 x 768 | Standard Laptop | Full 4 Groups (72px) | Full 36px Utility Bar | Hidden | None (0px) | **PASS** |
| **1280px** | 1280 x 800 | Container Bound (1280px) | Full 4 Groups (72px) | Full 36px Utility Bar | Hidden | None (0px) | **PASS** |
| **1024px** | 1024 x 768 | Small Desktop / iPad Pro L | Compact 4 Groups (72px) | Compact 36px Utility Bar | Hidden | None (0px) | **PASS** |
| **768px** | 768 x 1024 | Tablet Portrait (iPad) | Collapsed into Drawer | Language + Hamburger | Full 44px Drawer | None (0px) | **PASS** |
| **390px** | 390 x 844 | Modern Mobile (iPhone 14) | Collapsed into Drawer | Language + Hamburger | Full 44px Drawer | None (0px) | **PASS** |
| **360px** | 360 x 780 | Standard Mobile (Android) | Collapsed into Drawer | Language + Hamburger | Full 44px Drawer | None (0px) | **PASS** |

---

## 2. Visual Quality Analysis by Viewport

### 2.1 1440px — Large Desktop (1440 x 900)
- **Artifact:** `docs/screenshots/navbar/navbar_1440px.png` (387 KB)
- **Visual Inspection:**
  - Header is capped cleanly at `1280px` centered within the 1440px viewport.
  - Generous 80px side margins provide balanced breathing room.
  - Desktop Center shows all 4 items: `Practice (v)`, `Preparation (v)`, `Current Affairs`, `PYQ Bank` with 14px medium font.
  - Desktop Right displays Search button (36px), Language switcher (36px), Ask AI (36px), Pricing (36px), Log In (36px), Start Free (36px).
  - No text wrapping or vertical misalignments.

### 2.2 1366px — Standard Laptop (1366 x 768)
- **Artifact:** `docs/screenshots/navbar/navbar_1366px.png` (371 KB)
- **Visual Inspection:**
  - Margin gutters adapt smoothly to 43px on each side.
  - Spacing between navigation groups maintains 8px rhythm (`gap-2`).
  - All interactive elements retain exact 36px button heights.
  - Zero overflow or horizontal scrollbar.

### 2.3 1280px — Container Boundary (1280 x 800)
- **Artifact:** `docs/screenshots/navbar/navbar_1280px.png` (351 KB)
- **Visual Inspection:**
  - Container aligns edge-to-edge with standard padding (`px-8` / 32px).
  - Center nav and right utility bar fit with 28px safety margin between them.
  - Brand logo, title, and "CSE AI Platform" subtitle remain vertically centered at 36px relative to the 72px bar.

### 2.4 1024px — Narrow Desktop / Tablet Landscape (1024 x 768)
- **Artifact:** `docs/screenshots/navbar/navbar_1024px.png` (266 KB)
- **Visual Inspection:**
  - Critical breakpoint test: previous implementation suffered from right-side crowding at this resolution.
  - New implementation: padding transitions to `px-6` (24px) with `gap-1` between center nav items and `gap-2` in the right utility bar.
  - All 4 center nav items remain comfortably on a single line.
  - All right utilities (Search, Language, Ask AI, Pricing, Log In, Start Free) render without wrapping or clipping.
  - Zero horizontal overflow.

### 2.5 768px — Tablet Portrait (768 x 1024)
- **Artifact:** `docs/screenshots/navbar/navbar_768px.png` (414 KB)
- **Visual Inspection:**
  - Header shifts seamlessly to mobile mode.
  - Top bar features: Brand logo + "Pravaah UPSC" text, Language Switcher (`EN / हिंदी`), and 44x44px Hamburger icon button.
  - Clean separation prevents crowding.
  - Tapping the hamburger expands the full-featured drawer with touch targets $\ge 44$px.

### 2.6 390px — Modern Mobile (390 x 844)
- **Artifact:** `docs/screenshots/navbar/navbar_390px.png` (138 KB)
- **Visual Inspection:**
  - Top bar fits comfortably within 390px with zero text truncation.
  - Logo box (40x40px), Title (18px font-black), and Subtitle (10px uppercase) are vertically balanced.
  - Language switcher renders compact pill next to the 44px hamburger button.
  - Hero section headline wraps cleanly without horizontal overflow.

### 2.7 360px — Compact Android Mobile (360 x 780)
- **Artifact:** `docs/screenshots/navbar/navbar_360px.png` (100 KB)
- **Visual Inspection:**
  - Minimum standard mobile resolution test.
  - Title and logo remain sharp and legible.
  - Touch targets maintain full 44px compliance.
  - Zero pixel clipping on left or right viewport edges.

---

## 3. Touch Target & Accessibility Verification

All interactive controls in the mobile drawer and header bar were audited against WCAG 2.1 AA and Apple Human Interface Guidelines:
- **Mobile Hamburger Button:** `44px x 44px` (`min-h-[44px] min-w-[44px]`) — **PASS**
- **Mobile Quick Action Buttons (Ask AI / Search):** `44px` height (`min-h-[44px]`) — **PASS**
- **Practice Accordion Items (5 links):** `44px` height (`min-h-[44px]`) — **PASS**
- **Preparation Accordion Items (5 links):** `44px` height (`min-h-[44px]`) — **PASS**
- **Direct Nav Links (Current Affairs, PYQ Bank, Pricing):** `44px` height (`min-h-[44px]`) — **PASS**
- **Sign In / Start Free CTA Buttons:** `44px` height (`min-h-[44px]`) — **PASS**
- **Body Scroll Locking:** Verified active on drawer open, restored to `unset` on unmount/close — **PASS**
- **Keyboard Dismissal (Escape Key):** Closes mobile drawer and desktop dropdowns — **PASS**

---

## 4. Screenshot File Manifest

The captured visual artifacts are stored in both `docs/screenshots/navbar/` and `docs/screenshots/`:
1. `docs/screenshots/navbar/navbar_1440px.png` (1440 x 900)
2. `docs/screenshots/navbar/navbar_1366px.png` (1366 x 768)
3. `docs/screenshots/navbar/navbar_1280px.png` (1280 x 800)
4. `docs/screenshots/navbar/navbar_1024px.png` (1024 x 768)
5. `docs/screenshots/navbar/navbar_768px.png` (768 x 1024)
6. `docs/screenshots/navbar/navbar_390px.png` (390 x 844)
7. `docs/screenshots/navbar/navbar_360px.png` (360 x 780)
