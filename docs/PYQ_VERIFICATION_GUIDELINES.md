# PRAVAAH UPSC — PYQ VERIFICATION GUIDELINES & PROTOCOL

**Document Version:** 1.0.0  
**Target:** UPSC Civil Services Examination (CSE) Prelims, Mains & Personality Test  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Status:** Canonical Engineering Specification

---

## 1. Executive Summary

Integrity and absolute factual fidelity are the cornerstones of Pravaah UPSC. In civil services preparation, even a single disputed or inaccurately transcribed question key can derail an aspirant's preparation strategy or propagate misconception.

This document sets forth the official 5-tier verification protocol, strict separation of official answer keys from pedagogical explanations, and step-by-step human audit procedures governing every question stored in the Pravaah UPSC database.

---

## 2. The 5 Verification Tiers

Every question record in the Pravaah UPSC repository is tagged with a deterministic verification status reflecting its journey from primary government source to published platform record.

```
[ Tier 1: UNVERIFIED ]
         │
         ▼ (OCR & Text Cleaning)
[ Tier 2: OCR_CHECKED ]
         │
         ▼ (SME Verification & Proofreading)
[ Tier 3: HUMAN_REVIEWED ]
         │
         ▼ (Primary Series & Official Key Cross-Check)
[ Tier 4: SOURCE_MATCHED ]
         │
         ▼ (Cryptographic Hash Matching & Final Publication Sign-off)
[ Tier 5: OFFICIALLY_VERIFIED ]
```

### Tier 1: `UNVERIFIED`
- **Definition:** Raw text extracted from official scanned question paper PDF before validation.
- **Characteristics:** May contain OCR artifacts, whitespace deviations, or unconfirmed option delimiters (`(a)`, `(b)`).
- **Public Visibility:** Never accessible to students on the live platform (`status = DRAFT`).

### Tier 2: `OCR_CHECKED`
- **Definition:** Automated regex and structural parsing completed.
- **Criteria:**
  - Option count equals exactly 4 for Prelims (`A`, `B`, `C`, `D`).
  - Question text verified for encoding errors (UTF-8 clean, Devanagari Unicode intact).
  - Mathematical formulas (CSAT) validated against original PDF vectors.
- **Public Visibility:** Restricted to staging/testing environments.

### Tier 3: `HUMAN_REVIEWED`
- **Definition:** Audited by a qualified UPSC Subject Matter Expert (SME).
- **Checks Performed:**
  - Standard reference textbooks cited (e.g., Laxmikanth, Spectrum, NCERT Class XI/XII).
  - Hindi translation verified for terminological fidelity to UPSC's official Hindi question booklet.
  - Sub-topic and micro-theme classifications accurately mapped to the syllabus node tree.

### Tier 4: `SOURCE_MATCHED`
- **Definition:** Answer key strictly matched against UPSC's officially released Annual Final Answer Key.
- **Requirements:**
  - Official UPSC Answer Key PDF retrieved from `upsc.gov.in/examinations/answer-keys`.
  - Question matched to Booklet Series (Series A standard).
  - If UPSC dropped/cancelled the question (indicated as `*` or `X` in official keys), the question is marked with `isDropped = true` and given zero negative marking impact.

### Tier 5: `OFFICIALLY_VERIFIED`
- **Definition:** The gold standard of Pravaah UPSC content.
- **Requirements:**
  - Direct provenance URL and SHA-256 hash of original UPSC source document logged in metadata.
  - Signed off by Lead Content Architect.
  - Published to production database with `status = PUBLISHED` and `verificationStatus = OFFICIALLY_VERIFIED`.

---

## 3. Strict Separation: Official Key vs Pedagogical Explanation

A cardinal rule of Pravaah UPSC is that **the official UPSC answer key is inviolable**.

1. **UPSC Key as Truth:**
   - Regardless of academic debate or differing interpretations among coaching institutes, the official answer key published by the Union Public Service Commission is the sole determinant of correctness.
   - The field `correctOption` stores only the official commission verdict (`A`, `B`, `C`, or `D`).

2. **Pedagogical Explanation (`explanation`):**
   - The explanation provides context, reasoning, primary sources (Acts, Reports, Economic Survey, Budget, Supreme Court rulings), and reasons why alternative options are incorrect.
   - If an official key was historically contentious (e.g., certain CSAT reading comprehension inferences or discretionary polity questions), the explanation must contain an **"Examiner Perspective & Commission Rationale"** note rather than contradicting the official key.

---

## 4. Human Audit Procedures

Each batch of digitized questions undergoes an exhaustive 4-eye audit:

1. **Dual-Screen Parallel Audit:**
   - Auditor displays the primary official UPSC question booklet PDF on Screen 1.
   - Auditor displays Pravaah UPSC staging view on Screen 2.
   - Word-by-word comparison of English and Hindi strings, including punctuation, bolded terms (e.g., **"NOT correct"**, **"Which of the pairs given above is/are correctly matched?"**).

2. **Bilingual Parity Verification:**
   - Ensure the Hindi terminology matches UPSC's formal register (e.g., *'मौलिक अधिकार'* for Fundamental Rights, *'आर्थिक सर्वेक्षण'* for Economic Survey).
   - Verify that option labels in Hindi correspond identically to `(a) / (क)`, `(b) / (ख)`, `(c) / (ग)`, `(d) / (घ)`.

3. **Map and Data Discrepancy Check:**
   - Geography questions involving waterfalls, straits, peaks, and national parks are verified against Survey of India and standard physical atlases (e.g., Oxford Student Atlas).
   - Case in point: UPSC 2024 Prelims GS1 Q12 verified: Hundru (Subarnarekha, Chota Nagpur Plateau), Dhuandhar (Narmada, Jabalpur), Gersoppa/Jog (Sharavati, Western Ghats).

---

## 5. Audit Logging and Anomaly Escalation

- Any discrepancy identified between a legacy dump and the official PDF results in immediate isolation of that record into a quarantine table.
- Correction commits must cite the specific page number and series letter of the UPSC source document.
- Zero synthetic questions may ever enter the production PYQ bank.
