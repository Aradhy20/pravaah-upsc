# PHASE 3: REPEATABLE QUESTION INGESTION & STAGING PIPELINE
**Application:** Pravaah UPSC  
**Live Platform:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Version:** 3.0  
**Date:** November 23, 2026  
**Auditor:** Senior Data Engineer, Pipeline Architect & QA Specialist  

---

## 1. End-to-End Ingestion Pipeline Architecture

To prevent unreviewed, malformed, or fabricated questions from ever reaching student users, Pravaah UPSC implements a strict 13-stage ingestion pipeline with an isolated staging database barrier:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE SELECTION & PERMISSION CHECK                      │
│    • Validate against Phase 3 Source Registry               │
│    • Verify public domain / government examination notice   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. DOCUMENT ACQUISITION & HASH RECORDING                    │
│    • Download PDF booklet from official repository          │
│    • Compute SHA-256 file checksum to guarantee provenance  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. TEXT EXTRACTION & OCR PRE-PROCESSING                     │
│    • Text extraction via pdfjs / tesseract for legacy scans │
│    • Devanagari Unicode preservation for Hindi papers       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. BOUNDARY DETECTION & SEGMENTATION                        │
│    • Regex pattern matching: `Q.\s*(\d+)` and `\n(\d+)\.`   │
│    • Hindi equivalent boundary alignment                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. OPTION EXTRACTION (A, B, C, D)                           │
│    • Exactly 4 choices parsed per question                  │
│    • Bilingual option text alignment                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 6. OFFICIAL ANSWER KEY RECONCILIATION                       │
│    • Match against UPSC Official Final Key (Series A/B/C/D) │
│    • Handle officially DROPPED questions                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 7. PEDAGOGICAL EXPLANATION GENERATION                       │
│    • Author structured rationale & elimination technique    │
│    • Attach statutory & NCERT citations                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 8. DUPLICATE & ANOMALY DETECTION                            │
│    • Check against existing questions `[paperId, year, num]`│
│    • Cross-entropy question stem similarity check           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 9. STAGING RECORD PERSISTENCE                               │
│    • Insert into `QuestionStagingRecord` table               │
│    • Assign status: `IMPORTED` or `AWAITING_VERIFICATION`   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 10. AUTOMATED QUALITY GATE AUDIT                            │
│     • Run `validateQuestionRecord` (10 assertions)          │
│     • Promote to `VERIFIED` if 100% compliant               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 11. FACULTY / ADMIN HUMAN REVIEW                            │
│     • Administrator reviews source booklet and answers      │
│     • Mark `APPROVED_FOR_PUBLICATION` or `REJECTED`         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 12. CONTROLLED PUBLICATION TO PRODUCTION                    │
│     • Execute `publishStagedRecord` via authenticated API   │
│     • Transactional commit into `Question` & `QuestionOption`│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 13. AUDIT LOGGING & TELEMETRY GENERATION                    │
│     • Record admin action in `AuditLog` with timestamp       │
│     • Update syllabus tree and coverage metrics             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion Quality Gate Rules

Every candidate question in staging must strictly pass:
1. **Stem Length:** English question text $\ge 10$ characters.
2. **Options Completeness:** Exactly 4 options with codes `A`, `B`, `C`, and `D`.
3. **Single Key Validity:** Exactly 1 option marked `isCorrect: true` matching the official UPSC key.
4. **Marking Integrity:** GS1 enforces $+2.0 / -0.666$; CSAT enforces $+2.5 / -0.833$.
5. **Year Range:** Valid examination cycle within $1995 \le \text{year} \le 2026$.
6. **No Duplicates:** Composite constraint `[paperCode, year, questionNumber, examCategory]` must be unique.
7. **Pedagogical Explanation:** Non-empty rationale with legal or academic citations.

---

## 3. Historical Expansion Roadmap (1995–2025)

The table below outlines the controlled expansion roadmap based strictly on verified public government records:

| Examination Cycle Era | Stage & Paper | Questions / Paper | Total Target | Verification Source |
|:---|:---|:---:|:---:|:---|
| **Modern Era (2015–2024)** | Prelims GS Paper I<br>Prelims CSAT Paper II | 100<br>80 | 1,800 | Official UPSC Portals (`upsc.gov.in`) + Final Keys |
| **CSAT Transition (2011–2014)** | Prelims GS Paper I<br>Prelims CSAT Paper II | 100<br>80 | 720 | UPSC Previous Exam Archives + Gazettes |
| **Kothari Era (1995–2010)** | Prelims General Studies | 150 (Pre-2011) | 2,400 | Digital Sansad / UPSC Historical Archives |
| **Mains Modern (2013–2024)** | GS1, GS2, GS3, GS4<br>Essay | 20 / paper<br>8 / paper | 1,056 | Official UPSC Mains Question Papers |
| **Total Expansion Target** | | | **5,976** | **100% Sourced from Official Examination Booklets** |

**Strict Anti-Fabrication Rule:** Questions are only marked as imported and published when verified source files have been acquired and reviewed. Never report unimported target numbers as existing inventory.
