# RESTful API Specification (v1)
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Data Format:** JSON (`Content-Type: application/json`)  
**Security Standard:** Bearer JWT / Secure HttpOnly Session Cookies  

---

## 1. Global Conventions & Error Handling

### 1.1 Response Envelope Format
All standard API responses follow a uniform envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

In the event of an error:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested question ID does not exist or has been archived.",
    "details": []
  }
}
```

### 1.2 HTTP Status Codes & Error Codes
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Schema validation failure (`INVALID_PAYLOAD`).
- `401 Unauthorized`: Missing or invalid session token (`AUTH_REQUIRED`).
- `403 Forbidden`: Insufficient role permissions (`FORBIDDEN_ACCESS`).
- `404 Not Found`: Entity not found (`RESOURCE_NOT_FOUND`).
- `429 Too Many Requests`: Rate limit exceeded (`RATE_LIMIT_EXCEEDED`).
- `500 Internal Error`: Server execution fault (`INTERNAL_ERROR`).

---

## 2. Authentication & User Profile Endpoints

### 2.1 POST `/auth/register`
- **Auth:** None (Public)
- **Request Body:**
  ```json
  {
    "fullName": "Aarav Gupta",
    "email": "aarav@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "usr_101", "email": "aarav@example.com", "role": "ASPIRANT" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2.2 POST `/auth/login`
- **Auth:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "aarav@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response `200 OK`:** Returns user session and set-cookie header.

### 2.3 GET `/user/profile`
- **Auth:** Required (ASPIRANT or ADMIN)
- **Response `200 OK`:** Returns user profile, target exam year, and preferences.

---

## 3. Question Bank, Catalog & Search Endpoints

### 3.1 GET `/questions`
Query and browse the verified question bank with multi-facet filtering.
- **Auth:** Public
- **Query Parameters:**
  - `paper` (optional): `GS1` | `GS2`
  - `years` (optional, comma-separated): e.g., `2023,2024`
  - `subject` (optional): e.g., `Polity`
  - `topic` (optional): e.g., `Fundamental Rights`
  - `difficulty` (optional): `EASY` | `MEDIUM` | `HARD`
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "q_2024_gs1_01",
        "paperCode": "GS1",
        "paperName": "General Studies Paper I",
        "year": 2024,
        "questionNumber": 1,
        "questionText": "Consider the following statements regarding the Attorney General of India:\n1. He is appointed by the President of India.\n2. He must have the same qualifications as are required to be a Judge of the Supreme Court.\nWhich of the statements given above is/are correct?",
        "subject": "Polity & Governance",
        "topic": "Constitutional Bodies",
        "options": [
          { "code": "A", "text": "1 only" },
          { "code": "B", "text": "2 only" },
          { "code": "C", "text": "Both 1 and 2" },
          { "code": "D", "text": "Neither 1 nor 2" }
        ],
        "isCorrectOption": "C",
        "explanation": {
          "summary": "Both statements are correct under Article 76 of the Constitution of India.",
          "detailedExplanation": "Article 76(1) provides that the President shall appoint a person who is qualified to be appointed a Judge of the Supreme Court to be Attorney-General for India.",
          "sourceCitation": "M. Laxmikanth, Indian Polity (7th Ed), Chapter 52"
        }
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 100, "hasMore": true }
  }
  ```

### 3.2 GET `/search`
Search across question stems, options, and explanations.
- **Auth:** Public
- **Query Parameters:**
  - `q`: Search string (e.g. `Ordinance`, `Monetary Policy Committee`)
  - `mode`: `smart` | `exact`
  - `paper`: `GS1` | `GS2` (optional)
- **Response `200 OK`:** Returns ranked array of matching questions.

---

## 4. Learn Mode & Attempt Interactions

### 4.1 POST `/attempts/learn`
Records an individual question attempt in Learn Mode.
- **Auth:** Optional / Aspirant
- **Request Body:**
  ```json
  {
    "questionId": "q_2024_gs1_01",
    "selectedOption": "C",
    "timeSpentSeconds": 45
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "isCorrect": true,
      "correctOption": "C",
      "explanation": {
        "summary": "Both statements are correct under Article 76.",
        "detailed": "..."
      }
    }
  }
  ```

---

## 5. Timed Examination Session Endpoints (Anti-Leak)

### 5.1 POST `/tests/session/start`
Initializes a timed exam sitting.
- **Auth:** Required (ASPIRANT)
- **Request Body:**
  ```json
  {
    "testId": "test_full_2024_gs1"
  }
  ```
- **Security Rule:** The response payload **MUST NOT** include `isCorrect`, `correctOption`, or `explanation`.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "sess_89412",
      "durationMinutes": 120,
      "markingScheme": {
        "positive": 2.0,
        "negative": 0.666
      },
      "questions": [
        {
          "id": "q_2024_gs1_01",
          "questionNumber": 1,
          "questionText": "Consider the following statements...",
          "options": [
            { "code": "A", "text": "1 only" },
            { "code": "B", "text": "2 only" },
            { "code": "C", "text": "Both 1 and 2" },
            { "code": "D", "text": "Neither 1 nor 2" }
          ]
        }
      ]
    }
  }
  ```

### 5.2 POST `/tests/session/submit`
Submits the final responses, executes server-side grading, and generates the diagnostic scorecard.
- **Auth:** Required (ASPIRANT)
- **Request Body:**
  ```json
  {
    "sessionId": "sess_89412",
    "responses": [
      { "questionId": "q_2024_gs1_01", "selectedOption": "C", "timeSpent": 52 },
      { "questionId": "q_2024_gs1_02", "selectedOption": "A", "timeSpent": 38 }
    ]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "sess_89412",
      "totalQuestions": 100,
      "attempted": 85,
      "correct": 62,
      "incorrect": 23,
      "unattempted": 15,
      "rawScore": 124.0,
      "negativeDeductions": 15.318,
      "netScore": 108.68,
      "accuracyPercentage": 72.94,
      "subjectBreakdown": {
        "Polity": { "attempted": 15, "correct": 13, "accuracy": 86.6 },
        "Economy": { "attempted": 16, "correct": 11, "accuracy": 68.75 }
      },
      "mistakeQueueAdded": 23
    }
  }
  ```

---

## 6. Bookmarks, Notes & Revision Endpoints

- `GET /user/bookmarks`: Retrieve user bookmarked questions.
- `POST /user/bookmarks`: Add question to bookmarks `{ "questionId": "q_..." }`.
- `DELETE /user/bookmarks/:questionId`: Remove bookmark.
- `GET /user/notes`: Retrieve all user notes.
- `POST /user/notes`: Save/update private note on a question.
- `GET /user/revision`: Retrieve questions in the active mistake revision queue.
- `POST /user/revision/resolve`: Mark a mistake queue item as mastered.

---

## 7. Analytics & Dashboard Endpoints

### 7.1 GET `/analytics/dashboard`
- **Auth:** Required (ASPIRANT)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalAttempted": 420,
        "overallAccuracy": 68.5,
        "totalStudyHours": 18.4,
        "revisionQueueCount": 38
      },
      "subjectPerformance": [
        { "subject": "Polity", "attempted": 110, "correct": 88, "accuracy": 80.0 },
        { "subject": "Environment", "attempted": 75, "correct": 38, "accuracy": 50.6 }
      ],
      "weakTopics": [
        { "topic": "Wetlands & Ramsar Sites", "accuracy": 33.3, "attempts": 12 },
        { "topic": "Balance of Payments", "accuracy": 40.0, "attempts": 10 }
      ],
      "recentActivity": [ ... ]
    }
  }
  ```

---

## 8. Administrative Endpoints (Admin RBAC Required)

- `POST /admin/import/batch`: Upload structured JSON/CSV for ingestion. Returns import summary (processed, errors, duplicate count).
- `GET /admin/review/queue`: List questions awaiting review (`status = NEEDS_REVIEW`).
- `PUT /admin/questions/:id`: Update question stem, options, explanation, answer key, or syllabus topic.
- `POST /admin/questions/:id/publish`: Change question status from `VERIFIED` to `PUBLISHED`.
- `GET /admin/audit-logs`: Paginated log of administrative modifications.

---

## 9. Pricing, Checkout & Subscription Endpoints

### 9.1 GET `/plans`
Retrieves all publicly available active plans, prices, and feature matrices.
- **Auth:** None (Public)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "plan_achiever",
        "name": "Achiever (Prelims Pro)",
        "slug": "ACHIEVER",
        "tier": 2,
        "isFeatured": true,
        "badge": "Most Popular",
        "prices": [
          { "billingPeriod": "MONTHLY", "amount": 799, "formattedAmount": "₹799", "savingsPercent": 0 },
          { "billingPeriod": "QUARTERLY", "amount": 1899, "formattedAmount": "₹1,899", "savingsPercent": 20 },
          { "billingPeriod": "ANNUAL", "amount": 5499, "formattedAmount": "₹5,499", "savingsPercent": 42 }
        ],
        "features": [
          { "featureKey": "timed_exam_sim", "featureName": "Full UPSC Timed Exam Simulator", "isIncluded": true }
        ],
        "entitlements": [
          { "quotaKey": "TIMED_EXAMS", "quotaValue": 1 },
          { "quotaKey": "MAX_BOOKMARKS", "quotaValue": -1 }
        ]
      }
    ]
  }
  ```

### 9.2 GET `/user/subscription`
Retrieves current user's active subscription tier, quota status, and payment history.
- **Auth:** Required (ASPIRANT or ADMIN)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "subscription": {
        "id": "sub_101",
        "planId": "plan_achiever",
        "status": "ACTIVE",
        "billingPeriod": "QUARTERLY",
        "currentPeriodEnd": "2027-01-27T00:00:00.000Z",
        "cancelAtPeriodEnd": false,
        "plan": { "name": "Achiever (Prelims Pro)", "slug": "ACHIEVER", "tier": 2 }
      },
      "payments": [ ... ]
    }
  }
  ```

### 9.3 POST `/billing/checkout`
Creates a verified pending payment record and issues a checkout session.
- **Auth:** Required (ASPIRANT)
- **Request Body:**
  ```json
  {
    "planId": "plan_achiever",
    "billingPeriod": "QUARTERLY"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "checkoutSessionId": "chk_usr101_achiever_1729000000",
      "amount": 1899,
      "currency": "INR",
      "formattedAmount": "₹1,899",
      "planName": "Achiever (Prelims Pro)",
      "billingPeriod": "QUARTERLY",
      "sandboxMode": true,
      "message": "Payment session initialized."
    }
  }
  ```

### 9.4 POST `/billing/webhook`
Cryptographically signed webhook ingestion from payment providers.
- **Auth:** Public (Signature Verified via `x-signature` header or raw HMAC-SHA256)
- **Request Headers:**
  - `x-signature`: HMAC-SHA256 hash of payload
  - `x-event-id`: Unique gateway event tracking ID
- **Request Body:**
  ```json
  {
    "eventId": "evt_gateway_998822",
    "eventType": "payment.succeeded",
    "provider": "SANDBOX_GATEWAY",
    "data": {
      "idempotencyKey": "chk_usr101_achiever_1729000000",
      "transactionRef": "txn_razorpay_992211"
    }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "received": true,
    "status": "ACTIVATED",
    "subscriptionId": "sub_101"
  }
  ```

### 9.5 POST `/user/subscription/cancel`
Cancels auto-renewal while maintaining paid access through the paid cycle.
- **Auth:** Required (ASPIRANT)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Auto-renewal cancelled. You will have full access until 27 Jan 2027.",
    "subscription": { "cancelAtPeriodEnd": true, "status": "ACTIVE" }
  }
  ```

---

## 10. Administrative Billing Endpoints (Admin RBAC Required)

### 10.1 GET `/admin/plans`
Retrieves all configured plans including inactive draft tiers with full price matrices.
- **Auth:** Required (ADMIN)
- **Response `200 OK`:** Array of all plans, pricing models, and feature bounds.

### 10.2 PUT `/admin/plans`
Updates plan information, active toggle, or interval prices.
- **Auth:** Required (ADMIN)
- **Request Body:**
  ```json
  {
    "planId": "plan_achiever",
    "name": "Achiever (Prelims Pro)",
    "description": "Full access to timed exam simulator and diagnostic engine.",
    "tier": 2,
    "isActive": true,
    "prices": [
      { "billingPeriod": "MONTHLY", "amount": 799 },
      { "billingPeriod": "QUARTERLY", "amount": 1899 },
      { "billingPeriod": "ANNUAL", "amount": 5499 }
    ]
  }
  ```
- **Response `200 OK`:** Updated plan object.

### 10.3 GET `/admin/subscriptions`
Retrieves the complete subscriber roster, payment transactions, and revenue stats.
- **Auth:** Required (ADMIN)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalSubscribers": 48,
        "activeSubscribers": 42,
        "totalRevenue": 94800,
        "recentPayments": [ ... ]
      },
      "subscriptions": [ ... ]
    }
  }
  ```
