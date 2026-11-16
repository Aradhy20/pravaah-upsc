# Pravaah UPSC: Core REST API Documentation

## 1. Overview & Base URL

All endpoints conform to standard JSON REST conventions.
- **Base URL**: `http://localhost:3000/api/v1` (Production: `https://pravaah-upsc.vercel.app/api/v1`)
- **Authentication**: Bearer JWT / Cookie session where required. Public endpoints require no auth.

---

## 2. Question Bank & PYQ Endpoints

### 2.1 `GET /api/v1/pyqs`
Retrieves past question bank records with multi-dimensional filtering, bilingual support, answer provenance, and citations.

#### Query Parameters:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `exam` | string | `ALL` | Exam family code (`CSE`, `CDS`, `NDA`, `CAPF`). |
| `paper` | string | - | Paper code (`GS1`, `GS2`, `CSAT`). |
| `years` | string | - | Comma-separated list of years (`2024,2023`). |
| `subject` | string | - | Subject filter name or slug (`Polity`, `Economy`). |
| `topic` | string | - | Topic name or slug. |
| `language` | string | `ALL` | `English`, `Hindi`, `Bilingual`. |
| `answerKeyType` | string | - | `UPSC_FINAL_KEY`, `UPSC_PROVISIONAL_KEY`, `FACULTY_DERIVED`. |
| `verificationStatus` | string | - | `OFFICIALLY_VERIFIED`, `UNVERIFIED`. |
| `q` | string | - | Full-text keyword search across stems and explanations. |
| `page` | integer | `1` | Page index. |
| `limit` | integer | `20` | Max items per page (1–100). |

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "cmvqr30o2002q5y3bmuj4i0nh",
      "recordId": "REC-2024-GS1-86",
      "questionGroupId": "QGRP-CSE-2024-GS1-86",
      "examCategory": "CSE",
      "examName": "Civil Services Examination (CSE)",
      "paperCode": "GS1",
      "year": 2024,
      "questionNumber": 86,
      "language": "Bilingual",
      "questionTextEn": "Which of the following biosphere reserves in India is recognized under UNESCO World Network of Biosphere Reserves (WNBR)?...",
      "questionTextHi": "निम्नलिखित में से भारत का कौन-सा/से बायोस्फीयर रिजर्व यूनेस्को के वर्ल्ड नेटवर्क ऑफ बायोस्फीयर रिजर्व (WNBR) के तहत मान्यता प्राप्त है/हैं?...",
      "options": [
        {
          "code": "A",
          "label": "A",
          "textEn": "1 and 2 only",
          "textHi": "केवल 1 और 2",
          "isCorrect": false
        },
        {
          "code": "D",
          "label": "D",
          "textEn": "1, 2 and 3",
          "textHi": "1, 2 और 3",
          "isCorrect": true
        }
      ],
      "verifiedAnswer": {
        "answerOption": "D",
        "answerKeyType": "UPSC_FINAL_KEY",
        "verificationStatus": "OFFICIALLY_VERIFIED",
        "sourceName": "UPSC Official Key"
      },
      "explanation": {
        "summary": "Official UPSC answer: Option D",
        "detailedExplanation": "All three are included in UNESCO WNBR: Nilgiri (2000), Sunderbans (2001), Similipal (2009)...",
        "explanationHi": "तीनों बायोस्फीयर रिजर्व यूनेस्को के WNBR में शामिल हैं..."
      },
      "citations": [
        {
          "sourceName": "UPSC Official Master Key",
          "sourceUrl": "https://www.upsc.gov.in/examinations/previous-question-papers",
          "evidenceType": "OFFICIAL_GAZETTE",
          "citationText": "UPSC Series A Official Master Key (2024), Question 86"
        }
      ]
    }
  ],
  "meta": {
    "total": 1123,
    "page": 1,
    "limit": 20,
    "totalPages": 57,
    "hasMore": true
  }
}
```

---

### 2.2 `GET /api/v1/coverage`
Returns the complete harvest and completeness matrix across 14 exam families and 32 historical years (1995–2026).

#### Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTargets": 448,
      "totalQuestionsInDb": 1123,
      "verifiedAnswersCount": 1123,
      "totalKnowledgeSources": 74,
      "statusBreakdown": {
        "COMPLETED": 0,
        "EXTRACTED": 0,
        "DISCOVERED": 0,
        "NOT_HARVESTED": 448,
        "UNAVAILABLE": 0
      },
      "historicalSpan": "1995–2026 (32 Years)"
    },
    "examFamilies": [
      {
        "code": "CSE",
        "name": "Civil Services Examination (CSE)",
        "targetYearsCount": 32,
        "completedYearsCount": 0,
        "harvestedQuestions": 0,
        "years": [...]
      }
    ]
  }
}
```

---

### 2.3 `POST /api/v1/ai/assistant`
Grounded RAG retrieval endpoint for concept explanations, PYQ precedents, and NCERT references.

#### Request:
```json
{
  "query": "Attorney General constitutional powers",
  "examFamily": "CSE",
  "year": 2024
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "answer": "### Grounded UPSC Concept Analysis: \"Attorney General\"...",
    "groundingConfidence": 0.95,
    "retrievalCount": 2,
    "relevantPYQs": [...],
    "ncertReferences": [...],
    "citations": [...]
  }
}
```

---

### 2.4 `GET /api/v1/syllabus/tree`
Returns the 3-tier syllabus tree (Subject $\rightarrow$ Topic $\rightarrow$ Subtopics) with active question counts and 53 micro-syllabus nodes.
