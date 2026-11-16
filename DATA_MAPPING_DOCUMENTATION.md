# Pravaah UPSC: Data Mapping & Normalization Documentation

## 1. Source to Destination Entity Mapping

This document specifies the exact mapping transformations applied when ingesting external data packages into the Pravaah UPSC relational model.

---

## 2. Entity Mapping Matrix

### 2.1 Question Entity Mapping
| External Field / Raw Source | Normalized Schema Field (`Question`) | Transformation & Normalization Rule |
| :--- | :--- | :--- |
| `paper_code` / `exam_paper` | `paperId` | Resolved via `Paper.code` lookup (`GS1` $\rightarrow$ GS Paper I). |
| `year` | `year` | Cast to 4-digit Integer ($1995 \le \text{year} \le 2026$). |
| `q_no` / `question_number` | `questionNumber` | Cast to Integer ($1 \le \text{qnum} \le 100$). |
| Generated Hash | `recordId` | Formatted as `REC-{YEAR}-{PAPER_CODE}-{QNUM}`. |
| Cross-language ID | `questionGroupId` | Formatted as `QGRP-{EXAM}-{YEAR}-{PAPER}-{QNUM}`. |
| `question_text_en` | `questionTextEn` | Cleaned English prose, stripped of OCR line breaks. |
| `question_text_hi` | `questionTextHi` | Cleaned Devanagari Unicode string. |
| `language` | `language` | `Bilingual` if Hindi text exists, else `English`. |
| `difficulty` | `difficultyLevel` | Mapped to enum: `EASY`, `MEDIUM`, `HARD`. |
| `marks` | `marks` | Default `2.0` for GS1, `2.5` for CSAT. |
| `negative_marks` | `negativeMarks` | Default `0.666` for GS1, `0.833` for CSAT. |

### 2.2 Question Options Mapping
| External Field | Destination Field (`QuestionOption`) | Transformation Rule |
| :--- | :--- | :--- |
| Option Code | `optionCode` | Normalized to uppercase: `A`, `B`, `C`, `D`. |
| Option Label | `optionLabel` | Alphanumeric label matching optionCode. |
| Option Text (EN) | `optionTextEn` | English option text. |
| Option Text (HI) | `optionTextHi` | Hindi option text. |
| Correct Flag | `isCorrect` | Set to `true` if matching official final master key. |

### 2.3 Answer Provenance Mapping
| External Field | Destination Field (`QuestionAnswer`) | Transformation Rule |
| :--- | :--- | :--- |
| Answer Option | `answerOption` | `A`, `B`, `C`, `D`, or `DROPPED`. |
| Key Authority | `answerKeyType` | `UPSC_FINAL_KEY` > `UPSC_PROVISIONAL_KEY` > `FACULTY_DERIVED` > `PROVIDER_DERIVED`. |
| Verification Flag | `verificationStatus` | `OFFICIALLY_VERIFIED` when backed by official gazette. |
| Source URL | `sourceId` | Linked to registered `KnowledgeSource` record. |

---

## 3. Disputed, Dropped, and Cancelled Questions

When UPSC drops a question or declares dual correct options:
1. **Dropped Questions**:
   - `answerOption` is set to `"DROPPED"`.
   - `answerType` is set to `"DROPPED"`.
   - `explanation.summary` documents: *"Official UPSC Master Key indicates question was dropped/withdrawn; marks awarded equally per UPSC policy."*
2. **Dual Answer Questions (e.g., A or C)**:
   - Separate `QuestionAnswer` records are linked with identical priority, and both options have `isCorrect = true`.
