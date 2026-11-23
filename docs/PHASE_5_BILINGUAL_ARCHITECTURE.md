# PHASE 5 — BILINGUAL LEARNING ENGINE ARCHITECTURE

**Platform:** Pravaah UPSC  
**Scope:** English & Hindi Dual-Medium Preparation Support  
**Status:** IMPLEMENTED & AUDITED  

---

## 1. The UPSC Bilingual Challenge

Over 40% of civil services aspirants attempt the Preliminary and Main examinations in the Hindi medium. A frequent failure of EdTech platforms is relying on mechanical, raw machine translation. In the civil services examination, ambiguous translations cause immediate marks loss (e.g., translating legal directives incorrectly, or confusing *'Assent'* with *'Consent'*).

Pravaah UPSC implements a **Bilingual Learning Architecture** designed around civil services terminology:
1. Native language context state (`useLanguage` hook via React Context).
2. Institutional glossary alignment (Constitutional articles, Commission names, Directive words).
3. Persistent user preference storage (`UserProfile.medium: "ENGLISH" | "HINDI"`).
4. Graceful fallback typography with Devanagari font rendering optimization.

---

## 2. Technical Implementation Architecture

### 2.1 Language Context & State Flow
```
                      ┌────────────────────────────┐
                      │    LanguageContext         │
                      │  (lib/i18n/context.tsx)    │
                      └─────────────┬──────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
        [Language: "en"]                          [Language: "hi"]
               │                                         │
               ▼                                         ▼
   - English Question Stems                 - Hindi Question Stems
   - Standard Terminology                   - Academic Devanagari Lexicon
   - English Guidance Rubrics               - Hindi Guidance Rubrics
   - English UI Labels                      - Hindi UI Labels
```

### 2.2 Terminology Standardization Table

The engine enforces authentic Union Public Service Commission terminology standards:

| English Term | Inaccurate Machine Translation | UPSC Official Standard Hindi (Pravaah) |
| :--- | :--- | :--- |
| **Directive Word (Critically Examine)** | गंभीर जांच | आलोचनात्मक परीक्षण कीजिए |
| **Judicial Review** | न्यायिक समीक्षा / पुनः निरीक्षण | न्यायिक पुनरावलोकन |
| **Separation of Powers** | शक्तियों का अलगाव | शक्तियों का पृथक्करण |
| **Money Bill** | धन का बिल | धन विधेयक (अनुच्छेद 110) |
| **Discretionary Powers** | मर्जी की शक्तियां | विवेकाधीन शक्तियां |
| **Assertion & Reason** | दावा और कारण | अभिकथन (A) और तर्क (R) |
| **Elimination Technique** | हटाने की तकनीक | विकल्प निष्कासन विधि (विकल्प निरसन) |

---

## 3. Bilingual Coverage Across Phase 5 Modules

| Feature Module | Bilingual Capabilities | Verified Routes |
| :--- | :--- | :--- |
| **Mission Control** | Dual-language widget headings, readiness indicators, and the 5 Core Daily questions. | `/mission-control` |
| **CSAT Survival Coach** | Dual-medium comprehension passages, syllogism rules, and qualifying alerts. | `/csat-coach` |
| **Syllabus Intelligence** | 3-tier micro-node roadmaps with English titles and Hindi contextual explanations. | `/syllabus/intelligence` |
| **Mistake Intelligence** | 6 cognitive mistake tags in both English and Hindi. | `/revision`, `/api/v1/user/mistakes` |
| **Mains Answer Lab** | Framework guidelines and examiner feedback disclaimers in English and Hindi. | `/mains` |
| **Contact Desk** | Bilingual categories, field labels, and submission confirmations. | `/contact` |

---

## 4. Typography & Font Performance

Devanagari scripts require proper line-height and letter-spacing adjustments to prevent vowel diacritics (*matras*) from clipping:
- CSS enforces `font-sans` with fallback to `system-ui, -apple-system, 'Noto Sans Devanagari', sans-serif`.
- Textarea inputs for Mains answer writing dynamically expand vertical line height to `leading-relaxed` (1.625) when Hindi input is detected.
