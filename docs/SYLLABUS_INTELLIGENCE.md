# PRAVAAH UPSC — SYLLABUS INTELLIGENCE MAP

**Route:** `/syllabus/intelligence`  
**API Endpoints:** `/api/v1/syllabus/map`, `/api/v1/syllabus/progress`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Data Structure:** 3-Tier Hierarchical Taxonomy Tree

---

## 1. Concept & Problem Definition

The official UPSC Civil Services Examination notification outlines the syllabus in broad, generalized bullet points (e.g., *"Economic and Social Development"*, *"Indian Polity and Governance"*). This ambiguity causes aspirants to waste hundreds of hours on low-yield topics while neglecting recurring high-yield themes.

The **Pravaah Syllabus Intelligence Map** decomposes the official UPSC syllabus into a deterministic 3-tier taxonomy tree of **Micro-Nodes**, linking each node directly to historical PYQs and individual student mastery tracking.

---

## 2. The 3-Tier Taxonomy Tree

```
[ Level 1: SUBJECT ]
  └── Example: Indian Polity & Governance
        │
        ▼
[ Level 2: TOPIC ]
  └── Example: Constitutional Framework & Fundamental Rights
        │
        ▼
[ Level 3: MICRO-NODE ]
  └── Example: Article 21 & Right to Privacy (Puttaswamy Doctrine)
        ├── PYQ Linkages: 2018 Q15, 2021 Q42, 2024 Q9
        ├── UPSC Weightage: High (Appears in 8 of last 10 years)
        └── Student Mastery: 5-Stage Tracker
```

---

## 3. The 5-Stage Mastery Tracking Protocol

Every student's progress on each micro-node is persisted in the `TopicMastery` relational model across 5 distinct cognitive stages:

| Stage | Identifier | Criteria | Action Required |
| :---: | :--- | :--- | :--- |
| **0** | `NOT_STARTED` | Zero questions attempted, zero notes reviewed | Begin foundational NCERT reading |
| **1** | `IN_PROGRESS` | Concept read, fewer than 5 PYQs attempted | Complete introductory subject drills |
| **2** | `PRACTICED` | >= 5 PYQs attempted, accuracy between 50% and 75% | Review explanations and mistake notes |
| **3** | `REVISED` | Passed 1 spaced repetition review cycle | Scheduled for 14-day SM-2 recall |
| **4** | `MASTERED` | >= 10 PYQs attempted, accuracy > 80%, SM-2 interval > 30 days | Maintained in long-term retention queue |

---

## 4. Subject-Wise Micro-Node Distribution

### General Studies Paper I (Prelims & Mains GS 1–3):
1. **Indian Polity & Governance:**
   - 42 Micro-nodes (Preamble, Fundamental Rights, DPSP, Parliament Procedures, Judiciary, Federal Relations, Local Self-Government, Constitutional Bodies).
2. **Modern Indian History & Culture:**
   - 38 Micro-nodes (1857 Revolt, Tribal & Peasant Movements, Socio-Religious Reforms, Gandhian Movements, Constitutional Acts 1858–1947, Temple Architecture, Classical Dances).
3. **Physical & Indian Geography:**
   - 45 Micro-nodes (Geomorphology, Monsoon Mechanism, Drainage Basins, Peninsular Rivers, Soil Classifications, Mineral Belts, Strategic Waterways).
4. **Environment, Ecology & Biodiversity:**
   - 40 Micro-nodes (Ecosystem Dynamics, Protected Area Network, Wildlife Protection Act 1972, Ramsar Sites, Climate Change Conventions, IUCN Red List Species).
5. **Indian Economy & Development:**
   - 48 Micro-nodes (National Income Accounting, Monetary Policy Instruments, Fiscal Deficit Dynamics, GST Framework, External Sector & Forex, Agriculture Subsidies, Priority Sector Lending).
6. **General Science & Technology:**
   - 35 Micro-nodes (Space Missions, Biotechnology & Gene Editing, Defense Technologies, Emerging Tech - Quantum & AI, Vaccine Platforms).

### CSAT (General Studies Paper II):
1. **Reading Comprehension:** 18 Micro-nodes (Crux identification, Assumption testing, Inference derivation, Implication vs Corollary).
2. **Quantitative Aptitude:** 24 Micro-nodes (Number Systems, Percentages & Profit/Loss, Time-Speed-Distance, Permutations & Combinations).
3. **Logical & Analytical Reasoning:** 16 Micro-nodes (Syllogisms, Blood Relations, Seating Arrangements, Coding-Decoding).

---

## 5. UI Implementation & Visual Hierarchy

- **Radial / Tree Visualization:** Interactive tree view allowing drill-down from Subject to Micro-node.
- **Heatmap Overlay:** Color-coded node badges reflecting individual accuracy (Green: >75%, Amber: 50–74%, Red: <50%, Slate: Unattempted).
- **Direct Drill Navigation:** Clicking any micro-node instantly opens a filtered practice session with authentic UPSC questions tagged to that specific subtopic.
