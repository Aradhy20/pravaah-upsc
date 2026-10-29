# Pravaah UPSC — Scheduled Current Affairs & PYQ Linking Pipeline

**Document Version:** 2.0 (Authoritative Government Ingestion Standard)
**Pipeline Run Timestamp:** 2026-10-29 17:19:32 UTC
**Ingestion Scope:** PIB, RBI, PRS Legislative Research & Official Government Announcements

---

## 1. Pipeline Architecture & Workflow

```
  [Official Government Portals] (PIB, RBI, PRS, ISRO, MoEFCC)
               │
               ▼
  [Permission & Freshness Guard] (Only public releases & RSS)
               │
               ▼
  [Syllabus Mapping Engine] (Auto-classify GS1, GS2, GS3, GS4)
               │
               ▼
  [Semantic PYQ Connector] (Find matching historical UPSC PYQs in Question Bank)
               │
               ▼
  [Daily Quiz Generator] (Draft 5 high-yield MCQs with detailed pedagogical explanations)
               │
               ▼
  [Editorial Review Gate] (Human reviewer sign-off -> Live Publication)
```

---

## 2. Ingested Stories & Syllabus Breakdown

- **Total Active Stories Ingested:** 5
- **Historical PYQ Semantic Links:** 3 questions linked
- **Daily Quiz Practice Items Created:** 5 questions created

| Title | Source | Paper | Key Terms | Linked Historical PYQ |
| :--- | :--- | :---: | :--- | :---: |
| **RBI Climate-Related Disclosures** | RBI Press Release | `GS3` | Green Financing, TCFD, Transition Risk | Q74 (2020 GS1) |
| **National Green Hydrogen Mission** | PIB Delhi | `GS3` | SIGHT Scheme, Electrolyzers, Ammonia | Q88 (2023 GS1) |
| **Supreme Court on Article 324** | PRS & SC Judgments | `GS2` | Plenary Powers, RPA 1951, ECI | Q42 (2021 GS1) |
| **New Peninsular Ramsar Sites** | MoEFCC / PIB | `GS3` | Ramsar, Montreux Record, Amrit Dharohar | Q56 (2022 GS1) |
| **ISRO Semi-Cryogenic Pre-Burner** | ISRO Space Releases | `GS3` | Semi-Cryogenic, LOX, Isrosene, LVM3 | Q91 (2024 GS1) |

---

## 3. Production Scheduling & Durability
- **Cron Cadence:** Runs daily at 05:00 UTC (10:30 AM IST) via background worker.
- **Idempotent Storage:** Replays detect existing slugs and update records without generating duplicates.
- **Failure & Retry Queue:** Exponential backoff with up to 3 retries; persistent errors log to `BackgroundJob` table.

