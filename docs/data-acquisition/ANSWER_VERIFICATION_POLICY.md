# Answer Verification & Provenance Policy

## 1. Zero Coaching Disputed Error Mandate

Every year following the UPSC Prelims examination, commercial coaching institutes publish answer keys that conflict on 8 to 14 questions. Coaching keys frequently fail to reflect the statutory, judicial, and gazetted positions adopted by the Union Public Service Commission.

Pravaah UPSC strictly operates on **Official Ground Truth**:
1. All answer keys are keyed against the **Final Master Series A Answer Key** released officially by UPSC.
2. In the event of dropped questions or changed keys between provisional and final versions, the database records the shift in `AnswerKeyVersion`.
3. Disputed coaching theories are explicitly addressed in the pedagogical explanation under `eliminationTechnique` to clarify why UPSC's official answer is conceptually authoritative.

---

## 2. Verification Status Taxonomy

Every question record has a strict `verificationStatus`:
- `OFFICIALLY_VERIFIED`: Corroborated directly by UPSC Final Series A Answer Key PDF.
- `COACHING_DISPUTED`: Question has known ambiguity among coaching institutes, with Pravaah detailing the official UPSC reconciliation.
- `UNAVAILABLE_HISTORICAL`: For older historical exams where no official key was archived by UPSC; clearly marked so students do not practice under false certainty.

---

## 3. Disputed Questions Audit Table (Sample)

| Year | Paper | Q# | Topic | Coaching Key Discrepancy | Official UPSC Series A Key | Authoritative Ground Truth Citation |
|:---|:---|:---|:---|:---|:---|:---|
| 2024 | GS1 | 14 | CBDC Legal Nature | Some coaching keys marked "Both 1 and 2" | **A (1 only)** | RBI Act 1934 § 22 & Concept Note on CBDC (Tokenized bearer CBDC operates peer-to-peer without requiring bank account). |
| 2023 | GS1 | 8 | Due Process of Law | Coaching disputed B vs C | **C (Fair application of law)** | *Maneka Gandhi v. Union of India (1978)*; substantive due process encompasses procedural fairness and natural justice. |
| 2022 | GS1 | 42 | Miyawaki Method | Uncontested | **C (Urban mini-forests)** | UN Environment Programme & Ministry of Environment urban greening protocols. |
| 2021 | GS1 | 18 | Money Multiplier | Disputed between Bank Credit vs Currency ratio | **B (Increase in banking habit)** | RBI Monetary Economics Division technical bulletins. |

---

## 4. Retraction & Correction Protocol

If an editorial typo or transcription error is identified:
1. Editorial team submits revision via Admin Portal.
2. `AnswerKeyVersion` creates an immutable audit row.
3. System triggers automated re-scoring of affected mock exams and notifies impacted students via their study dashboard.
