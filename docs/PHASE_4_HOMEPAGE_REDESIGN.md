# PRAVAAH UPSC — PHASE 4: HOMEPAGE REDESIGN REPORT
### Architecture, Visual Hierarchy & 12-Section Content Organization

---

### 1. Section Hierarchy Overview

The homepage ([app/page.tsx](file:///Volumes/DevDrive/pravaah-upsc/app/page.tsx)) was reorganized into a coherent 12-section educational journey:

```
[ 1. Hero Section (2-Column Grid: Value Proposition + Study Visual) ]
                        │
                        ▼
[ 2. Verified Content Overview (3 Pedagogical Pillars) ]
                        │
                        ▼
[ 3. Interactive PYQ Learning Sample (Bilingual Card + Explanations) ]
                        │
                        ▼
[ 4. Subject-Wise Practice Grid (6 Core UPSC Domains) ]
                        │
                        ▼
[ 5. Prelims GS1 & CSAT GS2 Learning Modules ]
                        │
                        ▼
[ 6. Mains Answer Writing Studio (32 Authentic Questions) ]
                        │
                        ▼
[ 7. Study Planner & Spaced Mistake Revision Queue ]
                        │
                        ▼
[ 8. Current Affairs Linked to Syllabus Micro-Topics ]
                        │
                        ▼
[ 9. Free Resource Library (UPSC Crack Engine & Vault) ]
                        │
                        ▼
[ 10. Transparent Pricing & Account Access ]
                        │
                        ▼
[ 11. Frequently Asked Questions (Expandable Accordion) ]
                        │
                        ▼
[ 12. Institutional Footer (Archives, Tools, Provenance, Legal) ]
```

---

### 2. Detailed Breakdown of Sections

#### Section 1: Hero Section
- **Left Column:**
  - Trust Badge: *"Verified UPSC CSE Academic Platform"*
  - Headline: *"Find the PYQ. Understand the Concept. Master Every Mistake."* with brand blue highlight.
  - Supporting Description: *"Practice UPSC previous year questions with structured explanations, source references, concept mapping and bilingual learning support."*
  - Search Bar: Full-width input connecting to `/pyqs?q=`, Enter key submission, and active topic pills.
  - Action Buttons: Primary (*"Explore GS Paper I"*), Secondary (*"Explore CSAT"*), Tertiary (*"Start Timed Practice"*).
  - Secondary Feature Pills: Links to Crack Vault, Aspirant Flow, Daily Quiz, Current Affairs, and Mains Studio.
- **Right Column:**
  - Visual: Authentic study asset (`/images/upsc_trust_hero.jpg`) with refined corner radius (`rounded-2xl`), shadow, and gradient overlay.
  - Floating Badges: *"Verified Series A Key"*, *"SM-2 Retention Engine"*.
  - Statistics Strip: Exact audited backend counts:
    - **121**: Prelims Qs (1995–2024 Series A)
    - **32**: Mains Qs (GS1–4 & Essay)
    - **41**: Authentic Hindi Devanagari Questions
    - **100%**: Verified Answer Keys with Citations

#### Section 2: Verified Content Overview
- Highlights the 3 core SaaS differentiators: Official Series A Ground Truth, SuperMemo-2 Spaced Mistake Queue, and Structured Mains Frameworks.

#### Section 3: Interactive PYQ Learning Sample
- Displays an authentic 2024 Prelims GS1 question (RBI Central Bank Digital Currency).
- Real-time bilingual switcher (`EN`, `HI`, `BOTH`) that preserves selection state without timer reset.
- Instant pedagogical feedback with option derivation, bearer vs account-based instrument elimination tip, and direct link to more GS1 questions.

#### Section 4: Subject-Wise Practice Grid
- 6 dedicated subject domain cards: Polity & Governance (22 Qs), Economy & Development (8 Qs), Environment & Ecology (7 Qs), History & Culture (11 Qs), Geography & Agriculture (7 Qs), CSAT Aptitude & Logic (47 Qs).

#### Section 5: Prelims GS1 & CSAT Learning
- Side-by-side breakdown of General Studies Paper 1 (+2.0 / -0.666 marking) and CSAT Paper 2 (+2.5 / -0.833 marking, 33% / 66 marks qualifying criteria).

#### Section 6: Mains Answer Writing Studio
- 32 authentic questions across GS1–4 and Essay with sample framework guidance on South-West Monsoon variability.

#### Section 7: Study Planner & Revision
- Cognitive spaced repetition (Day 1, Day 3, Day 7) paired with personalized daily study hour scheduling.

#### Section 8: Current Affairs
- Daily PIB and Ministry briefs connected directly to syllabus micro-topics and historical PYQs.

#### Section 9: Free Resource Library
- The complete UPSC Crack Engine & High-Yield Vault (53 micro-topics, NCERT chapter mappings, static cheat sheets, and booklists).

#### Section 10: Pricing & Account Access
- Foundation Free plan (always available with free practice button).
- Achiever Pro and Scholar plans clearly marked with *"Subscription Temporarily Paused"* buttons and a transparent notice detailing the pending Cashfree merchant onboarding.

#### Section 11: Frequently Asked Questions
- 6 interactive expandable accordion questions addressing authenticity, Hindi medium support, CSAT scoring, revision intervals, free feature longevity, and payment status.

#### Section 12: Institutional Footer
- 4-column structured navigation with direct links to UPSC official question papers, archives, study tools, and legal documentation.
