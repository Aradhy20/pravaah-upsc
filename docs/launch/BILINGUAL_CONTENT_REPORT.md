# Pravaah UPSC — Bilingual Content Quality Report
**Date:** 28 November 2026  
**Auditor:** UPSC Academic Content & Bilingual Verification Organization  
**Mediums Supported:** English and Hindi (Devanagari Script)  

---

## 1. Bilingual Parity Architecture

Pravaah UPSC serves both English medium and Hindi medium Civil Services aspirants with the highest standard of academic rigor and typographic dignity.

| Component | Architecture & Standard | Implementation Status |
|---|---|:---:|
| **Devanagari Typography** | High-readability font rendering (`font-hindi`, Noto Sans Devanagari fallback) with `leading-relaxed` line heights to prevent matra clipping. | 🟢 100% CONFIGURED |
| **Bilingual Toggle** | Instant client-side toggle (`EN \| हि \| Both`) on every `QuestionCard` with preserved user preference. | 🟢 100% CONFIGURED |
| **Option Correspondence** | Synchronized 1:1 option alignment between English and Hindi options. | 🟢 100% CONFIGURED |
| **Honest Translation Signal** | When authentic UPSC Hindi translation is awaiting gazette digitization, the card explicitly presents a "Translation Pending" notice rather than unreviewed machine translation. | 🟢 SOURCE-BACKED STANDARD |
| **Constitutional Glossary** | Bilingual technical glossary covering 100+ civil services terms (e.g., Fundamental Rights / मूल अधिकार, Writs / रिट, Judicial Review / न्यायिक पुनरावलोकन). | 🟢 100% CONFIGURED |

---

## 2. Technical Glossary Alignment Sample

| English Civil Services Term | Official Hindi Translation (राजभाषा मानक) | Context & Subject |
|---|---|---|
| Fundamental Rights | मूल अधिकार | Constitutional Law |
| Directive Principles of State Policy | राज्य की नीति के निदेशक तत्व | Part IV, Constitution of India |
| Judicial Review | न्यायिक पुनरावलोकन | Article 13 & 32 |
| Balance of Payments | भुगतान संतुलन | Macroeconomics |
| Statutory Liquidity Ratio (SLR) | सांविधिक तरलता अनुपात | Monetary Policy / Banking |
| Biosphere Reserve | जैवमंडल आरक्षित क्षेत्र | Environment & Ecology |
