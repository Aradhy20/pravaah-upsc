# INTERVIEW PREPARATION MODULE REPORT

**Platform:** Pravaah UPSC SaaS Platform  
**Feature:** UPSC Personality Test & DAF Thematic Studio  
**Route:** `/interview` & `/api/v1/interview`  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Full-Stack Engineer & UPSC Academic Content Specialist  

---

## 1. Architectural Overview & Examination Scope

The UPSC Personality Test (Interview) accounts for 275 marks in the final merit ranking. Unlike the Preliminary and Main written examinations, the Union Public Service Commission conducts the Personality Test as a directed board conversation and **does not publish official written interview question papers**.

A critical integrity failure in EdTech platforms is misleading students into believing that mock interview prompts or candidate-reported recollections represent "Official UPSC PYQs."

To uphold academic integrity and pedagogical rigor:
1. **Clear Source Demarcation:** Every question in Pravaah UPSC's Personality Test studio is transparently attributed to its true origin:
   - `CANDIDATE_REPORTED`: Recollected interview transcripts from successful candidates.
   - `DAF_THEME`: Structured thematic drills based on standard Detailed Application Form parameters (Home state geography, graduation background, employment history, hobbies).
   - `SITUATIONAL`: Simulated administrative dilemmas, law and order challenges, and civil services ethics scenarios.
   - `MOCK_INTERVIEW`: Public mock interview transcripts from reputable academy panels.
2. **Prominent Accuracy Notice:** A persistent warning banner on the page states:
   > *"The Union Public Service Commission conducts an oral personality test and does NOT publish an official written interview question paper. All items in this repository are candidate-reported interview experiences, DAF preparation themes, or situational administrative drills with transparent attribution. They are never labeled as official written UPSC PYQs."*
3. **Interactive Oral Response Studio:** Candidates can draft their oral responses, monitor word counts against calibrated speaking times (120–180 words ≈ 60–90 seconds spoken), and receive instant diagnostic feedback assessing constitutional anchor, administrative hierarchy/SOPs, and balanced nuance.

---

## 2. Ingested Thematic Domains

The Personality Test module is populated with 5 benchmark situational and DAF scenarios representing the most common board examination angles:

| ID | Thematic Domain | Source Type | Key Administrative Focus |
| :--- | :--- | :---: | :--- |
| `cmwtl3owg` | Public Administration & Law and Order | `SITUATIONAL` | District Magistrate managing conflicting religious processions along identical market corridors under Section 144 / Police Act. |
| `cmwtl3owk` | Education & Career Motivation | `DAF_THEME` | Engineering graduate justifying allocation of technical skills towards general civil administration. |
| `cmwtl3owm` | Home State & Disaster Management | `CANDIDATE_REPORTED` | Managing simultaneous northern riverine floods and southern plateau droughts via structural and non-structural watershed policies. |
| `cmwtl3owo` | Ethics & Probity in Governance | `SITUATIONAL` | Handling irregular political executive procurement directives under threat of punitive administrative transfer. |
| `cmwtl3owq` | Current Affairs & Technology Policy | `CANDIDATE_REPORTED` | Balancing democratic regulation of Generative AI deepfakes and disinformation with technological innovation. |

---

## 3. Communication Diagnostic Engine

The client-side communication engine analyzes candidate responses across 3 foundational criteria assessed by UPSC interview boards:

1. **Constitutional & Statutory Anchor:**
   Evaluates whether the candidate roots their decision-making in the Constitution of India (Articles 14, 19, 21, 25), Directive Principles, statutory acts (CrPC, Disaster Management Act, Prevention of Corruption Act), or Supreme Court guidelines.
2. **Administrative Process & SOPs:**
   Detects references to institutional hierarchy, preventive stakeholder dialogue (Peace Committees, inter-departmental task forces), surveillance, and standard operating procedures rather than arbitrary personalized action.
3. **Balanced Nuance & Pragmatic Objectivity:**
   Rewards balanced reasoning that acknowledges competing legitimate interests (e.g. freedom of assembly vs public order, technological growth vs information integrity) instead of rigid, aggressive, or dismissive extremes.

---

## 4. UI/UX & Design Token Compliance

The interview module has been redesigned in full compliance with Pravaah UPSC's Indian Heritage aesthetic:
- **Header & Footer:** Integrated with global navigation and language switcher.
- **Color Palette:** Warm ivory background (`bg-heritage-ivory`), deep burgundy accents (`bg-heritage-burgundy`, `text-heritage-burgundy`), antique gold highlights (`border-heritage-gold/40`), and warm card backgrounds.
- **Typography:** Serif headlines (`font-serif`) for academic authority, with crisp sans-serif body text for readability.
- **Persistence:** In-progress interview drafts are automatically saved to browser local storage so aspirants can rehearse and refine their DAF answers over multiple study sessions.

---

## 5. Verification Sign-Off

- [x] Zero questions labeled as "Official UPSC Written PYQs".
- [x] Source attribution pills displayed on every question card.
- [x] Interactive response practice box functional with dynamic word counting.
- [x] Oral Communication Diagnostic Checklist renders immediate objective feedback.
- [x] Header and Footer navigation verified.
