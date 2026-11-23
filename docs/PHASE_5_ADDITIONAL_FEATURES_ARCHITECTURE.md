# PHASE 5 — ADDITIONAL ECOSYSTEM FEATURES ARCHITECTURE

**Platform:** Pravaah UPSC  
**Document:** Future Architectural Blueprint for Phase 6 Roadmap  
**Scope:** UPSC Mission Mode, Map-Based Learning Lab, Aspirant Peer Community  
**Status:** ARCHITECTURAL SPECIFICATION APPROVED  

---

## 1. UPSC Mission Mode (High-Fidelity Exam Simulation)

### 1.1 Objective
To eradicate exam-day anxiety and simulation drift by providing a strict, distraction-free environment that mirrors the exact physical examination hall conditions of the UPSC Civil Services Preliminary Examination.

### 1.2 Core Specifications
- **Full-Screen Browser Lock:** Leverages the Fullscreen Web API (`requestFullscreen()`) with keyboard shortcut intercepts (blocking Tab switching and multi-window navigation during timed mocks).
- **Physical Booklet Aesthetics:** Renders question paper in authentic dual-column serif typography (Bilingual English left, Hindi right) styled identically to UPSC Series A, B, C, D booklets.
- **OMR Bubble Sheet Simulation:** An interactive SVG/Canvas bubble matrix mirroring the authentic UPSC 200-question optical mark recognition sheet. Students mark options with a single click, supporting bubble darkening time calculations (~5 to 8 seconds per bubble).
- **Time Pacing Engine:** Audible & visual bell notifications at:
  - 30 minutes elapsed (Initial benchmark check)
  - 60 minutes elapsed (Halfway checkpoint: target 50 questions reviewed)
  - 10 minutes warning bell (OMR completion alert)
  - Final bell with automated paper locking.

---

## 2. Map-Based Learning Lab (Cartographic & Spatial Intelligence)

### 2.1 Problem Space
Every year, UPSC Prelims features 8 to 14 high-stakes map questions covering:
- Protected Areas: National Parks, Biosphere Reserves, Ramsar Wetlands (e.g. Keibul Lamjao, Namdapha, Gulf of Mannar).
- Physical Geography: River tributaries (Ganga, Indus, Brahmaputra, Godavari), mountain passes (Zoji La, Nathu La), rift valleys.
- Geopolitical Conflict Hotspots: Red Sea straits (Bab-el-Mandeb), Strait of Hormuz, Black Sea ports, Sahel region conflict corridors.

### 2.2 System Architecture
- **Interactive SVG Vector Base:** High-performance, lightweight vector maps of India and the World with zero external Google Maps API dependencies.
- **Micro-Pin Coordinates Layer:** Database schema extension (`MapLocationPin`) holding latitude, longitude, historical UPSC appearances, IUCN status, and key ecological features.
- **Spatial Quiz Engine:**
  - *Mode A — Pin to Feature:* System highlights a geographic pin, student identifies the National Park or River.
  - *Mode B — Chronological North-to-South Sorting:* Students drag and order mountain ranges or river confluences from North to South (a perennial UPSC favorite pattern).
  - *Mode C — Bordering Nations Drill:* Interactive selection of countries bordering key bodies of water (Caspian Sea, Mediterranean Sea, Red Sea).

---

## 3. Aspirant Peer Community & Moderated Discussion Forum

### 3.1 Problem Space
Unmoderated forums (e.g. Telegram channels, Reddit) suffer from immense noise, political debates, spurious "cut-off predictions", and pirated materials that derail preparation.

### 3.2 Architectural Principles
- **Strict Question-Anchored Threads:** Discussions are strictly anchored to specific Question IDs (`Question` or `MainsQuestion`). There are no ungrounded open threads.
- **Peer Answer Peer-Review Rubric:** When reviewing a peer's Mains draft, commenters must fill out a structured 3-point scorecard (1. Did the author answer the core directive? 2. What dimension was missing? 3. What case study would you add?).
- **Karma & Quality Scoring:** Aspirants earn "Pedagogical Karma" when their explanations or peer reviews are upvoted by verified peers or community moderators.
- **Automated Toxic/Spam Filter:** Pre-commit filtering checks for commercial promotion, external links, or non-academic commentary prior to database persistence.
