# PRAVAAH UPSC — PHASE 6 GROWTH & CONVERSION SYSTEM

**Document Version:** 1.0.0  
**Target:** Ethical Student Growth, Referral Engine & Funnel Optimization  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Guiding Principle:** Value-First Freemium without Dark Patterns

---

## 1. The Aspirant Journey Funnel

```
[ 1. Visitor / Search Discovery ]
              │
              ▼ (Register / Social Login)
[ 2. Free Aspirant Habit Building ]
  - Daily 5-Question Quiz
  - 15 PYQs / day practice
  - Basic Syllabus Explorer
              │
              ▼ (Contextual Upgrade Trigger)
[ 3. Feature Discovery & Value Realization ]
  - Aspirant hits 15-question daily limit or seeks AI Mentor
  - Contextual prompt: "Upgrade to Aspirant Pro for 100 AI queries"
              │
              ▼ (Checkout & Transparent Terms)
[ 4. Paid Conversion (Pro / Elite) ]
  - 7-day unconditional money-back guarantee
  - GST-inclusive transparent pricing
              │
              ▼ (Consistency & Success)
[ 5. Spaced Repetition, Retention & Referral ]
  - Share unique referral code for bonus credits
  - High annual renewal retention
```

---

## 2. Contextual Upgrade Triggers (Anti-Dark Pattern)

Pravaah UPSC strictly avoids coercive or manipulative dark patterns (e.g., fake countdown timers, false stock scarcity, or locking students out of their own past test results).

Instead, upgrade prompts are **contextual and transparent**:
- **Daily PYQ Limit:** When a free aspirant finishes 15 questions:  
  *"You have completed your 15 daily free questions. Come back tomorrow, or upgrade to Aspirant Plus (50/day) or Aspirant Pro (Unlimited)."*
- **AI Personal Mentor:** When trial credits are consumed:  
  *"You have experienced your trial AI Mentor queries. Upgrade to Aspirant Pro for 100 in-depth syllabus-grounded queries every month."*
- **Syllabus Deep-Dive:** When clicking a micro-node in the Syllabus Intelligence Map:  
  *"Full 3-tier micro-node telemetry is included with Aspirant Pro."*

---

## 3. Aspirant Referral Engine

- Every registered student receives an automated, unique referral code (e.g., `PRAVAAH-ARADHY-482`).
- When a fellow student registers using the link `https://pravaah-upsc.vercel.app/register?ref=CODE`:
  1. The referral is recorded in the `Referral` table with status `PENDING`.
  2. Upon completing 50 practice questions, the status updates to `QUALIFIED`, awarding bonus mock test credits to both aspirants.
  3. Built-in abuse detection blocks self-referrals and duplicate IP registrations.
