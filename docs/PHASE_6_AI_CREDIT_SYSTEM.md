# PRAVAAH UPSC — PHASE 6 AI CREDIT & USAGE MANAGEMENT

**Service Location:** [`lib/entitlements.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/entitlements.ts)  
**Database Model:** `UserUsageLedger`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Design Mandate:** Unit Economics Sustainability & Abuse Prevention

---

## 1. Why AI Feature Accounting is Mandatory

Large Language Model inferences (e.g., Gemini 1.5 Pro) incur non-zero token compute costs per API call. Offering "Unlimited AI" on a ₹299/month subscription creates severe financial vulnerability, where a handful of power users consuming thousands of tokens can eliminate platform gross margins.

The Pravaah UPSC AI Credit System enforces **deterministic, sustainable monthly allowances**:
- **Free Aspirant:** 5 trial questions + 1 trial Mains evaluation.
- **Aspirant Plus:** 15 trial questions + 2 trial Mains evaluations.
- **Aspirant Pro (Flagship):** **100 AI Mentor queries/month + 5 Mains evaluations/month**.
- **Aspirant Elite:** **300 AI Mentor queries/month + 15 Mains evaluations/month**.

---

## 2. Usage Ledger Schema (`UserUsageLedger`)

```prisma
model UserUsageLedger {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  periodStart           DateTime  @default(now())
  periodEnd             DateTime
  aiMentorMessagesUsed  Int       @default(0)
  aiMentorMessagesLimit Int       @default(0)
  mainsEvaluationsUsed  Int       @default(0)
  mainsEvaluationsLimit Int       @default(0)
  pyqAttemptsToday      Int       @default(0)
  pyqDailyLimit         Int       @default(15)
  lastPyqAttemptDate    DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId, periodEnd])
}
```

---

## 3. Atomic Deduction & Failure Recovery Protocol

1. **Pre-Execution Check:**
   - Before dispatching the prompt to LLM or RAG pipeline, the system verifies:
     `aiMentorMessagesUsed < aiMentorMessagesLimit`
   - If limit is reached, execution aborts with HTTP 403 `AI_LIMIT_REACHED` without invoking external APIs.
2. **Atomic Increment:**
   - Credit deduction uses atomic SQL increments (`increment: 1`) to eliminate concurrency race conditions.
3. **Failure Restoration:**
   - If the LLM returns an upstream 5xx error or network timeout, `restoreAiCredit()` decrements the usage counter so the student is never penalized for an unfulfilled request.
