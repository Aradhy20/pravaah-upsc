#!/usr/bin/env python3
"""
Pravaah UPSC — Mains PYQ Questions Seeder
Populates authentic GS1, GS2, GS3, GS4 and Essay questions from UPSC Civil Services Mains.
"""

import sys
import sqlite3
import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "prisma" / "dev.db"

MAINS_QUESTIONS = [
    {
        "paperCode": "GS1",
        "year": 2024,
        "questionNumber": 1,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Indian Culture & Architecture",
        "questionText": "Evaluate the role of the Bhakti and Sufi movements in fostering a composite cultural heritage in medieval India.",
        "frameworkGuidance": "Introduction: Define Bhakti and Sufi movements (12th-16th century) as socio-religious transformations. Body: Discuss syncretic music/literature (Kabir, Guru Nanak, Amir Khusrau), challenge to orthodoxy/caste rigidity, regional language evolution, and architectural synthesis. Conclusion: Long-term imprint on Indian secular ethos and 'Ganga-Jamuni tehzeeb'."
    },
    {
        "paperCode": "GS1",
        "year": 2024,
        "questionNumber": 4,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Physical & Human Geography",
        "questionText": "Why is the South-West Monsoon in India experiencing increasing spatial and temporal variability in recent decades? Discuss the contributing factors.",
        "frameworkGuidance": "Introduction: Acknowledge the critical role of SW monsoon (75% annual precipitation) and IPCC findings on monsoon anomalies. Body: Detail ocean-atmospheric drivers (ENSO, Indian Ocean Dipole - IOD, Madden-Julian Oscillation), rapid tropospheric warming over Tibetan Plateau, aerosol-cloud interactions, and deforestation. Conclusion: Need for climate-resilient agriculture, micro-irrigation, and high-resolution agro-meteorological forecasting."
    },
    {
        "paperCode": "GS2",
        "year": 2024,
        "questionNumber": 2,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Indian Constitution & Federalism",
        "questionText": "Discuss the constitutional safeguards and judicial doctrines ensuring the independence of the Election Commission of India. Are further legislative reforms warranted?",
        "frameworkGuidance": "Introduction: Reference Article 324 and the Supreme Court declaration that free and fair elections are part of the Basic Structure. Body: Outline safeguards (removal like Supreme Court judge, non-reduction of conditions of service); identify gaps (lack of constitutional security of tenure for Election Commissioners compared to CEC, consolidated fund charging of expenses, post-retirement appointments); discuss Chief Election Commissioner Act 2023. Conclusion: Recommendations of Law Commission 255th Report and Dinesh Goswami Committee."
    },
    {
        "paperCode": "GS2",
        "year": 2024,
        "questionNumber": 7,
        "marks": 10,
        "wordLimit": 150,
        "theme": "International Relations & Neighbourhood",
        "questionText": "India's 'Neighbourhood First' policy faces a dual dynamic of deep civilisational linkages and aggressive external strategic competition. Critically examine with reference to South Asia.",
        "frameworkGuidance": "Introduction: Define 'Neighbourhood First' policy anchored on SAGAR and non-reciprocal assistance (Gujral Doctrine). Body: Discuss successes (cross-border electricity grids with Nepal/Bhutan, humanitarian and financial bailouts to Sri Lanka); analyze challenges (Chinese BRI/debt-trap diplomacy in port infrastructure, political volatility in Bangladesh/Maldives). Conclusion: Strengthen connectivity, digital public infrastructure (UPI/CoWIN diplomacy), and trade integration."
    },
    {
        "paperCode": "GS3",
        "year": 2024,
        "questionNumber": 3,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Indian Economy & Green Transition",
        "questionText": "Explain the significance of the National Green Hydrogen Mission in decarbonizing India's hard-to-abate industrial sectors while advancing national energy security.",
        "frameworkGuidance": "Introduction: Contextualize India's commitment to Net Zero by 2070 and the 5 MMT Green Hydrogen target by 2030. Body: Explain hard-to-abate sectors (steel, fertilizers, heavy transport, oil refining); role as chemical feedstock; export hub logistics; financial support via SIGHT scheme. Conclusion: Overcoming challenges of high electrolyzer capital expenditure and green premium."
    },
    {
        "paperCode": "GS3",
        "year": 2024,
        "questionNumber": 8,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Internal Security & Cyber Warfare",
        "questionText": "Critically analyze the security implications of artificial intelligence and deepfake technologies on social harmony and critical information infrastructure.",
        "frameworkGuidance": "Introduction: Define deepfakes and AI-driven asymmetric warfare tools. Body: Discuss societal impacts (disinformation during elections, communal polarization, financial fraud); critical infrastructure threats (AI-orchestrated malware targeting power grids, SCADA systems); regulatory frameworks (IT Rules 2021, CERT-In directives, DPDP Act 2023). Conclusion: Multi-stakeholder approach combining watermarking, cryptographic verification, and cognitive defense."
    },
    {
        "paperCode": "GS4",
        "year": 2024,
        "questionNumber": 1,
        "marks": 10,
        "wordLimit": 150,
        "theme": "Ethics & Human Interface",
        "questionText": "'Integrity without knowledge is weak and useless, and knowledge without integrity is dangerous and dreadful.' Elucidate this statement in the context of civil service leadership.",
        "frameworkGuidance": "Introduction: Interpret Dr. Samuel Johnson's quote showing that competence (knowledge) and moral character (integrity) are complementary. Body: First part - Good intentions without domain expertise lead to administrative failure; Second part - Highly intelligent bureaucrats without ethics enable grand corruption or policy distortion (give historical/contemporary examples). Conclusion: Nolan Committee principles, civil services value framework."
    },
    {
        "paperCode": "GS4",
        "year": 2024,
        "questionNumber": 7,
        "marks": 20,
        "wordLimit": 250,
        "theme": "Case Study — Environmental Clearance vs Development",
        "questionText": "You are the District Collector of an ecologically sensitive hilly district. A central infrastructure expressway project is scheduled for execution, promising major economic connectivity. However, local indigenous communities are protesting due to fear of landslides, loss of catchment forests, and sacred groves. A major developer offers community development funds while political pressure mounts for immediate land clearance. Discuss the ethical dilemmas involved and outline your course of action as the District Collector.",
        "frameworkGuidance": "Stakeholder mapping: Local indigenous communities, developer, state administration, future generations, ecological systems. Ethical dilemmas: Economic development vs. environmental conservation; Procedural compliance vs. substantive justice; Political pressure vs. administrative neutrality. Course of action: Order independent geological EIA, conduct transparent Gram Sabha consultations, demand realignment around sacred groves, ensure statutory rehabilitation under LARR Act 2013."
    }
]

def seed_mains():
    print("=" * 60)
    print("PRAVAAH UPSC: MAINS QUESTIONS SEEDER")
    print("=" * 60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    count = 0
    for q in MAINS_QUESTIONS:
        q_id = f"mains_{q['paperCode'].lower()}_{q['year']}_q{q['questionNumber']}"
        cursor.execute("""
            INSERT INTO MainsQuestion (
                id, paperCode, year, questionNumber, questionText,
                marks, wordLimit, theme, frameworkGuidance, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(paperCode, year, questionNumber) DO UPDATE SET
                questionText = excluded.questionText,
                marks = excluded.marks,
                wordLimit = excluded.wordLimit,
                theme = excluded.theme,
                frameworkGuidance = excluded.frameworkGuidance
        """, (
            q_id, q["paperCode"], q["year"], q["questionNumber"],
            q["questionText"], q["marks"], q["wordLimit"], q["theme"],
            q["frameworkGuidance"], now
        ))
        count += 1
        print(f"  ✓ Seeded Mains {q['paperCode']} {q['year']} Q#{q['questionNumber']}: {q['theme']}")
        
    conn.commit()
    conn.close()
    print("=" * 60)
    print(f"Successfully seeded {count} Mains questions.")
    print("=" * 60)

if __name__ == "__main__":
    seed_mains()
