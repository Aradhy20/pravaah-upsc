# PRAVAAH UPSC — MISTAKE INTELLIGENCE LAB

**Routes:** `/revision`, `/mistakes`  
**API Endpoint:** `/api/v1/user/mistakes`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Core Methodology:** 6 Cognitive Error Classifications + SuperMemo-2 (SM-2) Spaced Repetition

---

## 1. Scientific Philosophy: The Error Log as Strategic Asset

To qualify in the UPSC Civil Services Examination, an aspirant does not merely need to acquire knowledge; they must systematically eliminate cognitive errors. Two candidates with identical syllabus coverage can achieve drastically different Prelims scores (e.g., 78 vs 102) purely based on error discipline.

The **Mistake Intelligence Lab** automatically captures every incorrect response during practice drills and test sessions, cataloging it under a rigorous cognitive taxonomy and scheduling automated remediation.

---

## 2. The 6 Cognitive Mistake Categories

Whenever an aspirant marks an incorrect option, the system prompts classification into one of six distinct cognitive failure modes:

```
                  [ COGNITIVE MISTAKE TAXONOMY ]
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
[ 1. CONCEPTUAL_GAP ]  [ 2. FACTUAL_CONFUSION ]  [ 3. SILLY_MISTAKE ]
(Fundamental flaw)       (Date/Name/Article mixup) (Missed "NOT", misread)
     │                           │                           │
[ 4. OVERTHINKING ]     [ 5. ELIMINATION_FAIL ]  [ 6. TIME_PRESSURE ]
(Second-guessed key)     (Split 50:50 and picked wrong) (Rushed in last 10m)
```

### Detailed Descriptions:

1. **`CONCEPTUAL_GAP` (अवधारणात्मक त्रुटि):**
   - The candidate did not understand the underlying constitutional, economic, or physical mechanism.
   - *Example:* Confusing fiscal deficit with revenue deficit, or understanding the difference between money bills and financial bills.
   - *Remedy:* Re-read NCERT / Standard textbook chapter.

2. **`FACTUAL_CONFUSION` (तथ्यात्मक भ्रम):**
   - Concept is understood, but specific factual data was misremembered.
   - *Example:* Confusing Hundru Falls (Subarnarekha) with Dhuandhar Falls (Narmada).
   - *Remedy:* Flashcard memory drill via SM-2.

3. **`SILLY_MISTAKE` (लापरवाही):**
   - The candidate knew the correct answer but misread the question stem (e.g., overlooked **"Which of the statements given above is NOT correct?"**).
   - *Remedy:* Cognitive awareness warning during future test simulations.

4. **`OVERTHINKING` (अति-विचार):**
   - The candidate initially selected the correct option, then rationalized extreme edge cases and changed their answer to an incorrect option.
   - *Remedy:* Intuition discipline training and review of first-instinct accuracy telemetry.

5. **`ELIMINATION_FAIL` (विलोपन विफलता):**
   - The candidate successfully narrowed options down to two (50:50 probability) but selected the incorrect distractor.
   - *Remedy:* Distractor trap analysis and examiner intent evaluation.

6. **`TIME_PRESSURE` (समय का दबाव):**
   - Answered hastily due to clock anxiety or inadequate pacing.
   - *Remedy:* Paced 20-question section timers.

---

## 3. SuperMemo-2 (SM-2) Spaced Repetition Integration

Pravaah UPSC applies an adapted variant of the SuperMemo-2 algorithm (`ReviewSchedule` model) to automate error recovery:

$$I(n) = \begin{cases} 1 & \text{if } n = 1 \\ 6 & \text{if } n = 2 \\ I(n-1) \times EF & \text{if } n > 2 \end{cases}$$

Where:
- $I(n)$ is the interval in days until the next scheduled review.
- $n$ is the repetition number.
- $EF$ is the Easiness Factor (initialized at $2.5$ and adjusted based on review quality from $0$ to $5$):

$$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$

If the aspirant rates their recall quality $q < 3$, the repetition count resets to $n=0$ and the item returns to the daily review queue.

---

## 4. UI Capabilities in `/revision`

- **Filter by Cognitive Trap:** Review exclusively "Silly Mistakes" or "Elimination Failures".
- **Daily Due Badge:** Highlighted counter showing exact number of question flashcards due today.
- **Instant Retry Mode:** Re-attempt the question in blinded mode (without seeing previous selection or answer key).
- **Personal Annotations:** Markdown editor to write personal memory triggers and reference page citations.
