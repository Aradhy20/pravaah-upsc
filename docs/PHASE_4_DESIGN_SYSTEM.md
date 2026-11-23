# PRAVAAH UPSC — PHASE 4: DESIGN SYSTEM ARCHITECTURE
### Reusable Component Library, Color Tokens & Academic Typography Standards

---

### 1. Brand Tokens & Color Palette

Pravaah UPSC's visual system is inspired by the precision of Stripe, the refinement of Linear, and the approachable academic clarity of Notion and Coursera.

The color tokens are centralized in `tailwind.config.ts` under `theme.extend.colors.brand`:

| Token Name | Hex Code | Tailwind Utility | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `#2453E6` | `bg-brand-primary`, `text-brand-primary` | Primary action buttons, active tabs, brand accent, key highlights. |
| **Dark Navy** | `#101828` | `bg-brand-dark`, `text-brand-dark` | Deep headers, primary headings, hero visual container, footer background. |
| **Secondary Blue** | `#4778F5` | `bg-brand-secondary`, `text-brand-secondary` | Secondary brand accents, subtle links, hover states. |
| **Light Background** | `#F7F9FC` | `bg-brand-light` | Alternating section backgrounds, dropdowns, input backgrounds. |
| **White** | `#FFFFFF` | `bg-brand-white` | Card backgrounds, elevated modals, button text. |
| **Body Text** | `#475467` | `text-brand-body` | Primary paragraph text, descriptions, question options text (Contrast > 4.5:1). |
| **Muted Text** | `#667085` | `text-brand-muted` | Subtitles, labels, metadata, secondary helper notes. |
| **Border** | `#E4E7EC` | `border-brand-border` | Subtle dividing lines, card boundaries, input borders. |
| **Success** | `#12A878` | `text-brand-success`, `bg-emerald-50` | Correct answers, verified master keys, positive status badges. |
| **Warning** | `#F59E0B` | `text-brand-warning`, `bg-amber-50` | Spaced review queues, cautions, pending status tags. |
| **Error** | `#DC2626` | `text-brand-error`, `bg-rose-50` | Negative marks, incorrect attempt feedback, validation alerts. |

---

### 2. Typography & Devanagari Bilingual Support

- **Latin Font Family:** Inter / System Sans-Serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- **Devanagari Font Family:** Noto Sans Devanagari / Hind (`html[lang="hi"] body`).
- **Heading Line Heights:** `leading-[1.18]` on desktop, `leading-snug` on mobile to avoid text crowding.
- **Body Line Heights:** `leading-relaxed` (1.65) for effortless long-form academic reading and dense case studies.

---

### 3. Reusable Component Catalog (`components/ui/`)

All reusable components are stored in `components/ui/` and exported via a centralized barrel file `components/ui/index.ts`:

1. **`PrimaryButton` & `SecondaryButton` (`components/ui/Buttons.tsx`):**
   - Sizes: `sm`, `md`, `lg`.
   - Supports icons, disabled states, full width, and anchor link rendering (`href`).
   - Built-in `min-h-[44px]` for mobile touch target compliance.
   - Interactive focus-visible states: `focus-visible:ring-2 focus-visible:ring-[#2453E6]`.
2. **`IconButton` (`components/ui/Buttons.tsx`):**
   - Accessible icon button with required `label` for screen readers.
3. **`PageContainer` (`components/ui/Layout.tsx`):**
   - Standardized width boundaries: `sm` (max-w-3xl), `md` (max-w-5xl), `lg` (max-w-7xl), `xl` (max-w-[1440px]).
   - Consistent responsive padding (`px-4 sm:px-6 lg:px-8`).
4. **`SectionHeader` (`components/ui/Layout.tsx`):**
   - Unified section titles with optional pill badge, heading, description, and alignment (`left`, `center`, `right`).
5. **`SubjectCard` & `StatCard` (`components/ui/Cards.tsx`):**
   - Academic cards with hover lift, question counts, topic badges, and arrow transitions.
6. **`SearchInput` (`components/ui/SearchInput.tsx`):**
   - Accessible search form with icon, placeholder, submit button, and `/pyqs?q=` action routing.
7. **`Badge` (`components/ui/Badges.tsx`):**
   - Variants: `brand`, `success`, `warning`, `error`, `neutral`, `outline`.
8. **`EmptyState`, `ErrorState`, `LoadingSkeleton` (`components/ui/States.tsx`):**
   - Zero-data visual placeholders, error recovery buttons, and animated skeleton loaders.
9. **`Modal` (`components/ui/Modal.tsx`):**
   - Accessible dialog with backdrop blur, scroll locking, Escape key dismissal, and backdrop click exit.
10. **`Tabs`, `Breadcrumbs`, `Pagination`, `DropdownMenu` (`components/ui/Navigation.tsx`):**
    - Keyboard-navigable multi-tab switchers, breadcrumb paths, pagination bars, and outside-click dismissible dropdowns.
