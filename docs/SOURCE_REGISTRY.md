# Pravaah UPSC — Master Source Registry & Canonical Directory

**Document Version:** 2.0 (Multi-Source Production Standard)
**Registry Synchronized:** 2026-10-29 17:13:58 UTC
**Operational Focus:** Authoritative Official Question Papers, Regulatory Feeds & Educational Reference Benchmarks

---

## 1. Master Registered Sources Directory

| ID | Source Name | Canonical Domain | Endpoint / Entry URL | Content Type | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `src-upsc-prev-papers` | **UPSC Official Previous Question Papers** | `upsc.gov.in` | [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers) | `OFFICIAL_AUTHORITY` | `ACTIVE_PERMITTED` |
| `src-upsc-archive` | **UPSC Question Papers Archive** | `upsc.gov.in` | [https://www.upsc.gov.in/examinations/question-papers](https://www.upsc.gov.in/examinations/question-papers) | `OFFICIAL_AUTHORITY` | `ACTIVE_PERMITTED` |
| `src-upsc-answer-keys` | **UPSC Official Final Answer Keys Portal** | `upsc.gov.in` | [https://www.upsc.gov.in/examinations/answer-keys](https://www.upsc.gov.in/examinations/answer-keys) | `OFFICIAL_AUTHORITY` | `ACTIVE_PERMITTED` |
| `src-pib-gov` | **Press Information Bureau (PIB)** | `pib.gov.in` | [https://pib.gov.in/allRel.aspx](https://pib.gov.in/allRel.aspx) | `GOVERNMENT_FEED` | `ACTIVE_PERMITTED` |
| `src-rbi-notifications` | **Reserve Bank of India Press Releases & Notifications** | `rbi.org.in` | [https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx) | `REGULATORY_BODY` | `ACTIVE_PERMITTED` |
| `src-prs-india` | **PRS Legislative Research (Bill Track & Policy)** | `prsindia.org` | [https://prsindia.org/billtrack](https://prsindia.org/billtrack) | `POLICY_RESEARCH` | `REFERENCE_BENCHMARK_ONLY` |
| `src-iasboard-ref` | **IASBoard UPSC Learning Portal** | `iasboard.com` | [https://iasboard.com/](https://iasboard.com/) | `EDUCATIONAL_BENCHMARK` | `REFERENCE_BENCHMARK_ONLY` |
| `src-decodecivils-ref` | **Decode Civils Current Affairs Portal** | `decodecivils.com` | [https://currentaffairs.decodecivils.com/](https://currentaffairs.decodecivils.com/) | `EDUCATIONAL_BENCHMARK` | `REFERENCE_BENCHMARK_ONLY` |
| `src-human-peritus-ref` | **Human Peritus Specialist Exam Portal** | `humanperitus.in` | [https://humanperitus.in/](https://humanperitus.in/) | `EDUCATIONAL_BENCHMARK` | `REFERENCE_BENCHMARK_ONLY` |
| `src-unlockias-ref` | **UnlockIAS Other UPSC Exams Portal** | `unlockias.in` | [https://www.unlockias.in/upsc-exams-other-than-cse](https://www.unlockias.in/upsc-exams-other-than-cse) | `EDUCATIONAL_BENCHMARK` | `REFERENCE_BENCHMARK_ONLY` |
| `src-examday-ref` | **ExamDay AI UPSC Platform** | `examday.ai` | [https://examday.ai/](https://examday.ai/) | `EDUCATIONAL_BENCHMARK` | `REFERENCE_BENCHMARK_ONLY` |
| `src-question-paper-milte-h` | **Question Paper Milte H (Colloquial Query Canonical Resolution)** | `upsc.gov.in` | [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers) | `OFFICIAL_AUTHORITY_CANONICAL_TARGET` | `ACTIVE_PERMITTED` |

---

## 2. Ingestion Adapter Registry
- `adapters/upsc_official.py`: Handles official PDF discovery, SHA-256 hashing, and Series A parsing.
- `adapters/pib_feed.py`: Discovers daily government releases and maps them to GS1/GS2/GS3/GS4 syllabus.
- `adapters/rbi_feed.py`: Discovers monetary and banking policy updates for GS3 Indian Economy.
- `adapters/prs_legislative.py`: Tracks Parliament bills and constitutional amendment acts for GS2 Polity.

