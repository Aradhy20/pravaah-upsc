# API Integration & Public REST Endpoints

## 1. Overview

Pravaah UPSC provides dedicated RESTful API endpoints for the UPSC Crack Engine, NCERT Knowledge Base, and Question Bank Ingestion Telemetry.

Base URL: `https://pravaah-upsc.vercel.app/api/v1` (or `http://localhost:3000/api/v1`)

---

## 2. Endpoints Reference

### A. NCERT Knowledge Catalog
`GET /api/v1/ncert`

Query Parameters:
- `class` (optional, integer): Filter by class (e.g. `11`, `12`).
- `subject` (optional, string): Filter by subject (e.g. `Polity`, `Geography`).

Response Example:
```json
{
  "success": true,
  "meta": {
    "totalBooks": 9,
    "totalChapters": 44,
    "totalLinkedQuestions": 12,
    "copyrightDisclaimer": "NCERT textbooks... provided for educational navigation."
  },
  "data": [
    {
      "id": "cuid...",
      "classNumber": 11,
      "subject": "Polity",
      "bookTitle": "Indian Constitution at Work",
      "medium": "English",
      "officialPortalUrl": "https://ncert.nic.in/textbook.php?keps2=0-10",
      "chapters": [
        {
          "id": "chap-1",
          "chapterNumber": 1,
          "chapterTitle": "Constitution: Why and How?",
          "slug": "constitution-why-and-how",
          "officialPdfUrl": "https://ncert.nic.in/textbook.php?keps2=1-10",
          "keyTopics": "Constituent Assembly, Objective Resolution, Institutional Design",
          "summary": "Explores the necessity of a constitution...",
          "_count": { "questionLinks": 2 }
        }
      ]
    }
  ]
}
```

---

### B. UPSC Official Syllabus Micro-Topics
`GET /api/v1/syllabus`

Response Example:
```json
{
  "success": true,
  "meta": {
    "totalNodes": 53,
    "groupedByPaper": {
      "PRE_GS1": 25,
      "PRE_CSAT": 8,
      "MAINS_GS1": 6,
      "MAINS_GS2": 5,
      "MAINS_GS3": 5,
      "MAINS_GS4": 4
    }
  },
  "data": [
    {
      "id": "cuid...",
      "code": "PRE-POL-02",
      "paper": "PRE_GS1",
      "subject": "Indian Polity & Governance",
      "title": "Fundamental Rights, Duties & DPSP",
      "description": "Articles 12-51A, judicial review, writ jurisdiction..."
    }
  ]
}
```

---

### C. Admin Ingestion Telemetry
`GET /api/v1/admin/ingestion` (Requires `role: "ADMIN"`)

Returns live metrics, source registry status, recent background extraction jobs, and quality reports.
