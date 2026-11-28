---
name: bilingual-content-quality
description: Protocols for English-Hindi bilingual parity, translation quality assurance, and honest translation availability signaling.
---

# Bilingual Content Quality Skill

## Standards for Hindi & English Parity
1. **Honest Translation Signaling**:
   - When a verified official Hindi question translation exists, display it alongside the English text with an instant language toggle (`EN | HI`).
   - If a translation is not yet officially verified, explicitly label it as `TRANSLATION_PENDING` or `TRANSLATION_MISSING`.
   - Never present unreviewed machine translations as official UPSC Devanagari translations.
2. **Devanagari Typographic Standards**:
   - Ensure font families support Indian scripts cleanly (e.g., Noto Sans Devanagari, Inter, system UI fonts).
   - Check that technical terms match standard UPSC Hindi terminology (e.g., "Fundamental Rights" -> "मूल अधिकार", "Directive Principles" -> "राज्य की नीति के निदेशक तत्व", "Judicial Review" -> "न्यायिक पुनरावलोकन").
3. **Bilingual Question Structure**:
   - Both language versions must maintain exact 1:1 option alignment (Option A in English corresponds strictly to Option A in Hindi).
   - Retain mathematical symbols, diagrams, and Roman numeral statements in synchronized order.
