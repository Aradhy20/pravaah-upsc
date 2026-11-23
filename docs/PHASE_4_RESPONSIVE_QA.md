# PRAVAAH UPSC — PHASE 4: RESPONSIVE QA REPORT
### Multi-Device Viewport Audit, Layout Stability & Screenshot Registry

---

### 1. Viewport Audit Matrix

Visual rendering, layout stability, typography scaling, and horizontal overflow checks were executed across all 7 mandatory viewport dimensions:

| Viewport Profile | Width | Height | Device Class | Status | Overflow Check | Navigation Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Small mobile** | `360px` | `800px` | Galaxy S8 / Small Android | ✅ PASSED | Zero horizontal overflow (`overflow-x: hidden`) | Collapsible Hamburger Drawer |
| **Standard mobile** | `390px` | `844px` | iPhone 12 / 13 / 14 | ✅ PASSED | Zero horizontal overflow | Collapsible Hamburger Drawer |
| **Large mobile** | `430px` | `932px` | iPhone 14 / 15 Pro Max | ✅ PASSED | Zero horizontal overflow | Collapsible Hamburger Drawer |
| **Tablet portrait** | `768px` | `1024px` | iPad / Android Tablet | ✅ PASSED | Zero horizontal overflow | Responsive Drawer / 2-Col Grid |
| **Laptop** | `1366px` | `768px` | Standard HD Laptop | ✅ PASSED | Zero horizontal overflow | Single-Line Desktop Navbar |
| **Desktop** | `1440px` | `900px` | Full HD / MacBook Pro 15 | ✅ PASSED | Zero horizontal overflow | Single-Line Desktop Navbar |
| **Large desktop** | `1920px` | `1080px` | 1080p / 4K Monitor | ✅ PASSED | Zero horizontal overflow (Max-W 1440px bounded) | Single-Line Desktop Navbar |

---

### 2. Captured Screenshot Artifacts (`docs/screenshots/`)

A total of **49 high-resolution screenshot artifacts** were captured using headless Chrome across all 7 key pages and 7 viewports:

| Page Profile | Route | Generated Artifacts (All 7 Viewports) | Verification Notes |
| :--- | :--- | :--- | :--- |
| **Homepage** | `/` | `homepage_{viewport}.png` (7 files) | Hero 2-col balance, single-line navbar, 12 sections. |
| **Pricing** | `/pricing` | `pricing_{viewport}.png` (7 files) | Free plan active, paid plans disabled, notice banner. |
| **PYQ Bank** | `/pyqs` | `pyqs_{viewport}.png` (7 files) | Question listing, bilingual switcher, filter bar. |
| **Mains Studio**| `/mains` | `mains_{viewport}.png` (7 files) | 32 questions, paper tabs, framework guidance. |
| **Syllabus** | `/syllabus` | `syllabus_{viewport}.png` (7 files) | Micro-topic tree, NCERT chapter mappings. |
| **System Flow** | `/system-flow` | `system-flow_{viewport}.png` (7 files) | Daily aspirant loop flowchart, revision stages. |
| **Login** | `/login` | `login_{viewport}.png` (7 files) | Clean credential form, Google OAuth button. |

---

### 3. Key Responsive Remediation Actions

1. **Elimination of Horizontal Scrollbars:** Added `overflow-x: hidden` to root body and wrapped all wide tables in responsive `overflow-x-auto` wrappers.
2. **Desktop Navbar Single-Line Guarantee:** Enforced `flex-nowrap`, calibrated padding, and grouped navigation items into distinct left, center, and right zones so no navigation item wraps onto a second row on screens $\ge 1024$px.
3. **Mobile Drawer Scroll Lock:** Implemented `document.body.style.overflow = "hidden"` while mobile menu is open to prevent page drift behind the drawer.
4. **Touch Target Expansion:** Applied `min-h-[44px]` and `min-w-[44px]` across all mobile buttons, tab items, and dropdown triggers to meet mobile human interface guidelines.
