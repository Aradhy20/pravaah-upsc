# Pravaah UPSC — Global Navigation Design Specification

**Specification Version:** 2.0.0  
**Target Platform:** Web (Desktop, Tablet, Mobile)  
**Status:** Approved & Implemented  
**Reference Components:** `components/Header.tsx`, `components/LanguageSwitcher.tsx`, `components/ui/Navigation.tsx`

---

## 1. Design System Tokens & Foundations

The Pravaah UPSC global navigation adheres strictly to an 8-point spatial grid system and tokenized color palette designed specifically for focused academic preparation.

### 1.1 Color Palette
| Token Name | Hex Code | Tailwind Equivalent | Role |
| :--- | :--- | :--- | :--- |
| `Brand Primary` | `#2453E6` | `bg-[#2453E6]` / `text-[#2453E6]` | Active states, primary CTA, brand mark |
| `Brand Primary Hover` | `#1D44C2` | `hover:bg-[#1D44C2]` | Start Free CTA hover state |
| `Brand Light Surface` | `#EFF4FF` | `bg-blue-50` / `bg-blue-50/80` | Active item background, Ask AI background |
| `Dark Navy (Heading)` | `#101828` | `text-[#101828]` | Brand name, active hover text, headings |
| `Body Charcoal` | `#475467` | `text-[#475467]` | Inactive nav links, secondary icons |
| `Muted Neutral` | `#667085` | `text-[#667085]` | Subtitles, helper text, chevron icons |
| `Border Subtle` | `#E4E7EC` | `border-[#E4E7EC]` | Header bottom border, dropdown dividers |
| `Light Background` | `#F7F9FC` | `bg-[#F7F9FC]` | Item hover background, search background |
| `Pure White` | `#FFFFFF` | `bg-white` / `bg-white/95` | Header background, dropdown card background |

### 1.2 Spatial System (8-Point Grid)
- **Base Unit:** 8px
- **Sub-grid:** 4px (micro-spacing), 2px (borders)
- **Container Heights:**
  - Header Container: `72px` (`h-[72px]`)
  - Utility Elements & Buttons: `36px` (`h-9`)
  - Brand Logo Container: `40px x 40px` (`h-10 w-10`)
  - Dropdown Item Icon Box: `32px x 32px` (`h-8 w-8`)
- **Horizontal Container Widths:**
  - Max Content Boundary: `1280px` (`max-w-[1280px] mx-auto`)
  - Viewport Padding:
    - Mobile (< 640px): `16px` (`px-4`)
    - Tablet (640px–1023px): `24px` (`px-6`)
    - Desktop (>= 1024px): `32px` (`px-8`)

### 1.3 Typography Rules
- **Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Brand Name:** `text-lg sm:text-xl font-black tracking-tight text-[#101828]`
- **Brand Subtitle:** `text-[10px] font-bold uppercase tracking-wider text-[#667085]`
- **Center Nav Links:** `text-[14px] font-medium text-[#475467]` (Active: `font-semibold text-[#2453E6]`)
- **Right Utility Buttons:** `text-xs font-bold` (12px, weight 700)
- **Dropdown Item Titles:** `text-xs font-bold text-[#101828]` (12px, weight 700)
- **Dropdown Subtitles:** `text-[11px] text-[#667085] leading-tight` (11px, weight 400)

---

## 2. Desktop Navigation Architecture

```
+---------------------------------------------------------------------------------------------------------+
| [Logo] Pravaah UPSC   |   Practice (v)   Preparation (v)   Current Affairs   PYQ Bank   |  [Q] [EN/HI] [Ask AI] [Pricing]  [Log In] [Start Free] |
|        CSE AI Platform|                                                                 |                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 2.1 Left Zone: Brand Mark
- **Interactive Container:** `<a>` linking to `/` with `aria-label="Pravaah UPSC Home"` and focus ring.
- **Icon Box:** `h-10 w-10 rounded-xl bg-[#2453E6] text-white flex items-center justify-center shadow-xs`.
- **Text Block:**
  - Line 1: `Pravaah ` `<span className="text-[#2453E6]">UPSC</span>`
  - Line 2: `CSE AI PLATFORM` (10px, bold, tracking-wider, muted).

### 2.2 Center Zone: 4-Item Taxonomy
The desktop center contains **exactly 4 items**:
1. **Practice (Dropdown Trigger):**
   - Icon: `<Compass className="h-4 w-4" />`
   - Label: `Practice`
   - Chevron: `<ChevronDown className="h-3.5 w-3.5" />` (rotates 180° when open)
   - Menu Contents (5 items):
     1. *Prelims GS Paper I* (`/pyqs?paper=GS1`) — "Subject-wise past paper questions"
     2. *CSAT Paper II* (`/pyqs?paper=GS2`) — "Comprehension & reasoning practice"
     3. *Mock Tests* (`/mock-tests`) — "Timed simulation with negative marking"
     4. *Daily Quiz* (`/daily-quiz`) — "5 high-yield daily diagnostic questions"
     5. *Revision* (`/revision`) — "Spaced repetition for flagged mistakes"
2. **Preparation (Dropdown Trigger):**
   - Icon: `<BookOpen className="h-4 w-4" />`
   - Label: `Preparation`
   - Chevron: `<ChevronDown className="h-3.5 w-3.5" />`
   - Menu Contents (5 items):
     1. *UPSC Syllabus* (`/syllabus`) — "3-tier micro-topics with syllabus mapping"
     2. *Study Planner* (`/study-planner`) — "Personalized daily schedule & milestones"
     3. *Mains Answer Writing* (`/mains`) — "32 authentic questions across GS1–GS4"
     4. *Notes and Bookmarks* (`/notes`) — "Saved questions & aspirant revisions"
     5. *Resource Library* (`/syllabus`) — "NCERT references & topper copy vaults"
3. **Current Affairs (Direct Link):**
   - Icon: `<Layers className="h-4 w-4 text-teal-600" />`
   - Label: `Current Affairs`
   - Target: `/current-affairs`
4. **PYQ Bank (Direct Link):**
   - Icon: `<Compass className="h-4 w-4 text-[#2453E6]" />`
   - Label: `PYQ Bank`
   - Target: `/pyqs`

### 2.3 Right Zone: Utility & Action Controls
All elements in the right utility bar are standardized to `36px` (`h-9`):
1. **Search Button:**
   - Dimension: `h-9 w-9`
   - Style: `rounded-xl border border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F9FC]`
   - Target: `/pyqs`
   - Accessibility: `aria-label="Search PYQs"` + `title="Search PYQs"`
2. **Language Switcher:**
   - Dimension: `h-9`
   - Content: Dual-badge toggle `EN | हिंदी`
   - Accessible label: `aria-label="Toggle language between English and Hindi"`
3. **Ask AI Button:**
   - Dimension: `h-9 px-3`
   - Style: `rounded-xl border border-blue-200/90 bg-blue-50 text-xs font-bold text-[#2453E6] hover:bg-blue-100`
   - Behavior: Calls `setIsAiAssistantOpen(true)` on click
4. **Pricing Link:**
   - Dimension: `h-9 px-2.5`
   - Style: `rounded-xl text-xs font-bold text-[#475467] hover:bg-[#F7F9FC]`
   - Target: `/pricing`
5. **Auth CTA (Unauthenticated):**
   - *Log In:* `h-9 px-3.5 rounded-xl text-xs font-bold text-[#475467] hover:bg-[#F7F9FC]` (`/login`)
   - *Start Free:* `h-9 px-4 rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] text-xs font-bold text-white shadow-xs` (`/register`)
6. **Auth Profile (Authenticated):**
   - User capsule with First Name, Subscription Tier badge (`Free`, `Pro`, etc.), and 28x28px circular Avatar.
   - Dropdown menu with Dashboard, Bookmarks, Notes, Pricing, Admin (if admin), and Sign Out.

---

## 3. Dropdown Menu Specification

- **Positioning:** `absolute mt-2 z-50` relative to the trigger.
- **Card Sizing:** `w-72` (288px width), `p-2` padding.
- **Elevation:** `shadow-xl border border-[#E4E7EC] bg-white rounded-2xl`.
- **Motion:** `animate-in fade-in-50 zoom-in-95 duration-150`.
- **Item Geometry:**
  - Container: `flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group`
  - Icon: `h-8 w-8 rounded-lg flex items-center justify-center shrink-0`
  - Text: Title `text-xs font-bold text-[#101828]` + Subtitle `text-[11px] text-[#667085] mt-0.5`

---

## 4. Mobile & Tablet Drawer Specification

### 4.1 Trigger & Header Bar (< 1024px)
- **Breakpoints:** Active on viewports below 1024px (`lg:hidden`).
- **Header Elements:** Brand Logo + Title, Language Switcher, Hamburger Menu Button.
- **Hamburger Button:** `min-h-[44px] min-w-[44px] rounded-xl p-2 flex items-center justify-center`.

### 4.2 Drawer Layout
- **Container:** `max-h-[calc(100vh-72px)] overflow-y-auto bg-white border-b border-[#E4E7EC] px-4 py-5 shadow-xl`.
- **Body Scroll Lock:** `document.body.style.overflow = "hidden"` while open.
- **Dismissal:** Escape key listener + outside click / navigation event.
- **Sections:**
  1. *Quick Action Grid:* Two 44px buttons for "Ask AI Assistant" and "Search PYQs".
  2. *Practice Accordion:* Collapsible section with GS1, CSAT, Mock Tests, Daily Quiz, Revision.
  3. *Preparation Accordion:* Collapsible section with Syllabus, Planner, Mains, Notes, Library.
  4. *Direct Links:* Current Affairs, PYQ Bank, Subscription Plans.
  5. *Auth Zone:* Sign In and Start Free 44px buttons (or profile card with Sign Out).

---

## 5. Compliance & Verification
- **Touch Target Guideline:** 100% of interactive elements on mobile & tablet are $\ge 44 \times 44$px.
- **Horizontal Overflow:** Exactly 0px on all tested viewports (360px to 1440px).
- **Z-Index Layering:** `z-50` for header and modal overlays.
