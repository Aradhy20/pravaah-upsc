#!/usr/bin/env python3
"""
Pravaah UPSC — Comprehensive Multi-Exam Catalogue Seeder
Populates authoritative details for 8 major UPSC examinations:
CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO.
"""

import sys
import sqlite3
import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "prisma" / "dev.db"

EXAMS = [
    {
        "code": "CSE",
        "name": "Civil Services Examination",
        "conductingBody": "UPSC",
        "category": "Civil Services",
        "overview": "India's premier recruitment examination for the Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), Indian Revenue Service (IRS), and other Group A/B Central Services.",
        "eligibilityQualifications": "Bachelor's Degree in any discipline from a recognized University or equivalent qualification.",
        "ageLimit": "21 to 32 years as of August 1 of examination year. Category relaxations: OBC (+3 yrs), SC/ST (+5 yrs), PwBD (+10 yrs).",
        "attemptsAllowed": "General: 6 attempts, OBC: 9 attempts, SC/ST: Unlimited (within age limit), PwBD: 9 attempts.",
        "stagesDescription": "Three Stages: 1. Prelims (Objective: GS Paper I 200 marks + CSAT 200 marks qualifying 33%); 2. Mains (Written: 9 descriptive papers, 1750 marks); 3. Personality Test (Interview: 275 marks).",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Civil%20Services%20%28Preliminary%29%20Examination",
        "syllabusOverview": "Prelims: Current events, History, Geography, Polity, Governance, Economy, Ecology/Biodiversity, General Science, CSAT comprehension and logic. Mains: Essay, GS I-IV, and Optional Subject (2 papers).",
        "examCycleDates": "Notification: January/February | Prelims: May/June | Mains: September | Interviews: January-April",
        "totalVacanciesTypical": "900 - 1,150 vacancies per year",
        "orderIndex": 1
    },
    {
        "code": "IFS",
        "name": "Indian Forest Service Examination",
        "conductingBody": "UPSC",
        "category": "All India Services",
        "overview": "All-India technical civil service dedicated to scientific forestry, biodiversity preservation, wildlife sanctuaries, national parks, and ecological governance.",
        "eligibilityQualifications": "Bachelor's degree with at least one of the subjects: Animal Husbandry & Veterinary Science, Botany, Chemistry, Geology, Mathematics, Physics, Statistics and Zoology or Bachelor's in Agriculture, Forestry or Engineering.",
        "ageLimit": "21 to 32 years. Category relaxations apply.",
        "attemptsAllowed": "General: 6, OBC: 9, SC/ST: Unlimited.",
        "stagesDescription": "Prelims: Common with Civil Services (Prelims); Mains: Written Examination (6 papers including English, GK, and two technical optionals); Interview: 300 marks + Physical standards test.",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Indian%20Forest%20Service%20Examination",
        "syllabusOverview": "Mains emphasizes scientific depth: General English, General Knowledge, plus two Optional subjects selected from prescribed science/engineering list.",
        "examCycleDates": "Prelims: Common with CSE in May/June | IFS Mains: November",
        "totalVacanciesTypical": "110 - 150 vacancies per year",
        "orderIndex": 2
    },
    {
        "code": "CDS",
        "name": "Combined Defence Services Examination",
        "conductingBody": "UPSC",
        "category": "Defence Services",
        "overview": "Recruitment examination conducted twice annually (CDS I and CDS II) for commissioning officers into the Indian Military Academy (IMA), Officers Training Academy (OTA), Indian Naval Academy (INA), and Air Force Academy (AFA).",
        "eligibilityQualifications": "IMA & OTA: Degree of a recognized University; INA: Degree in Engineering; AFA: Degree with Physics & Mathematics at 10+2 level or Bachelor of Engineering.",
        "ageLimit": "IMA/INA: 19-24 years; AFA: 20-24 years; OTA: 19-25 years. Unmarried candidates.",
        "attemptsAllowed": "No attempt limit as long as age and educational eligibility criteria are met.",
        "stagesDescription": "Written Examination (English 100m, General Knowledge 100m, Elementary Mathematics 100m - OTA candidates exempt from Maths) followed by SSB Interview (5 days psychological, ground tests and conference).",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination",
        "syllabusOverview": "English grammar and comprehension, General Knowledge (Current affairs, Indian history, Geography, General Science), and Elementary Mathematics (Arithmetic, Algebra, Trigonometry, Geometry, Mensuration, Statistics).",
        "examCycleDates": "Conducted biannually: CDS I (April) | CDS II (September)",
        "totalVacanciesTypical": "340 - 460 vacancies per cycle",
        "orderIndex": 3
    },
    {
        "code": "NDA",
        "name": "National Defence Academy & Naval Academy Examination",
        "conductingBody": "UPSC",
        "category": "Defence Services",
        "overview": "Premier joint training academy entrance for 10+2 cadets joining the Army, Navy, and Air Force wings of the Armed Forces, conducted twice a year (NDA I and NDA II).",
        "eligibilityQualifications": "Army Wing: 12th Class pass of 10+2 pattern; Air Force, Navy and Naval Academy: 12th Class pass with Physics, Chemistry and Mathematics.",
        "ageLimit": "16.5 to 19.5 years. Both unmarried male and female candidates are eligible.",
        "attemptsAllowed": "No attempt limit within the prescribed age window.",
        "stagesDescription": "Written Examination (Mathematics 300 marks + General Ability Test 600 marks) followed by 5-day Service Selection Board (SSB) Interview (900 marks).",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination",
        "syllabusOverview": "Mathematics: Trigonometry, Differential Calculus, Vector Algebra, Probability; GAT: Part A English (200m), Part B General Knowledge (Physics, Chemistry, General Science, Social Studies, Geography, Current Events 400m).",
        "examCycleDates": "Biannually: NDA I (April) | NDA II (September)",
        "totalVacanciesTypical": "390 - 420 vacancies per cycle",
        "orderIndex": 4
    },
    {
        "code": "CAPF",
        "name": "Central Armed Police Forces (Assistant Commandants)",
        "conductingBody": "UPSC",
        "category": "Paramilitary & Police",
        "overview": "Recruitment of directly appointed Assistant Commandants (Gazetted Group A Officers) into BSF, CRPF, CISF, ITBP, and SSB under the Ministry of Home Affairs.",
        "eligibilityQualifications": "Bachelor's degree of a recognized University in any discipline.",
        "ageLimit": "20 to 25 years as of August 1. Category relaxations apply.",
        "attemptsAllowed": "No attempt limit within eligible age window.",
        "stagesDescription": "Written Examination: Paper I (General Ability & Intelligence - 250 marks, MCQ) + Paper II (General Studies, Essay & Comprehension - 200 marks, Descriptive); Physical Standards/Physical Efficiency Tests (PET); Personality Test (150 marks).",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Central%20Armed%20Police%20Forces%20%28ACs%29%20Examination",
        "syllabusOverview": "Paper I: General Science, National/International Current Events, Indian Polity and Economy, History of India, World & Indian Geography. Paper II: Modern Indian History, Security, Human Rights, Precis writing, Comprehension.",
        "examCycleDates": "Notification: April/May | Written Exam: August | PET: November-December | Interviews: Spring",
        "totalVacanciesTypical": "300 - 550 vacancies per year",
        "orderIndex": 5
    },
    {
        "code": "ESE",
        "name": "Engineering Services Examination (IES)",
        "conductingBody": "UPSC",
        "category": "Engineering Services",
        "overview": "Recruitment for prestigious engineering leadership cadres in Indian Railways, Central Engineering Service, Central Water Engineering, Border Roads, and Defence Aeronautical Quality Assurance.",
        "eligibilityQualifications": "Degree in Engineering (B.E./B.Tech) in Civil, Mechanical, Electrical, or Electronics & Telecommunication Engineering.",
        "ageLimit": "21 to 30 years as of January 1. Relaxations apply for SC/ST/OBC and departmental candidates.",
        "attemptsAllowed": "Unlimited attempts within the prescribed age bracket.",
        "stagesDescription": "Stage I: Preliminary (Objective: Paper I General Studies & Engineering Aptitude 200m + Paper II Discipline Specific 300m); Stage II: Mains (Conventional: 2 discipline papers, 600m); Stage III: Personality Test (200m).",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Engineering%20Services%20%28Preliminary%29%20Examination",
        "syllabusOverview": "Paper I GS: Current issues, Engineering Ethics, Project Management, Environmental pollution, ICT tools, Standards and Quality. Paper II & Mains: Advanced branch-specific engineering disciplines.",
        "examCycleDates": "Notification: September | Stage I Prelims: February | Stage II Mains: June",
        "totalVacanciesTypical": "220 - 400 vacancies per year",
        "orderIndex": 6
    },
    {
        "code": "CMS",
        "name": "Combined Medical Services Examination",
        "conductingBody": "UPSC",
        "category": "Medical Services",
        "overview": "Recruitment for Medical Officers in Central Health Service, Indian Ordnance Factories, Railways Assistant Division Medical Officers (ADMO), and New Delhi Municipal Council (NDMC).",
        "eligibilityQualifications": "Passed the written and practical parts of the final M.B.B.S. examination (candidates appearing in final MBBS may also apply).",
        "ageLimit": "Up to 32 years as of August 1 (up to 35 years for certain Central Health Services cadres).",
        "attemptsAllowed": "Unlimited within age limits.",
        "stagesDescription": "Computer-based Objective Examination: Paper I (General Medicine and Paediatrics - 250 marks) + Paper II (Surgery, Gynaecology & Obstetrics, Preventive & Social Medicine - 250 marks); Personality Test: 100 marks.",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/Combined%20Medical%20Services%20Examination",
        "syllabusOverview": "Clinical Cardiology, Respiratory Diseases, GI, Neurology, Hematology, Emergency Medicine, Paediatrics, General Surgery, Orthopaedics, Ophthalmology, ENT, Obstetrics, Family Planning, Community Medicine & Epidemiology.",
        "examCycleDates": "Notification: March/April | Computer Exam: July | Interviews: Autumn",
        "totalVacanciesTypical": "600 - 850 vacancies per year",
        "orderIndex": 7
    },
    {
        "code": "EPFO",
        "name": "EPFO Enforcement Officer & APFC Recruitment Examination",
        "conductingBody": "UPSC",
        "category": "Recruitment Tests",
        "overview": "Special recruitment test for Enforcement Officer/Accounts Officer (EO/AO) and Assistant Provident Fund Commissioner (APFC) in the Employees' Provident Fund Organisation under Ministry of Labour & Employment.",
        "eligibilityQualifications": "Bachelor's Degree in any discipline from a recognized University. (Desirable for APFC: Diploma in Company Law/Labour Laws/Chartered Accountancy).",
        "ageLimit": "EO/AO: Up to 30 years; APFC: Up to 35 years. Relaxations for reserved categories.",
        "attemptsAllowed": "Unlimited within age limit.",
        "stagesDescription": "Recruitment Test (RT: Objective, 2 hours, 300 marks, 75% weightage) + Interview (100 marks, 25% weightage). Negative marking of 1/3rd applies in RT.",
        "officialNotificationUrl": "https://upsc.gov.in/examinations/recruitment-tests",
        "syllabusOverview": "General English, Indian Freedom Struggle, Current Events, Indian Polity and Economy, General Accounting Principles, Industrial Relations and Labour Laws, General Science & Computer Applications, Social Security in India.",
        "examCycleDates": "Recruitment conducted as per requisition vacancies (Periodic notification cycles).",
        "totalVacanciesTypical": "400 - 580 vacancies per cycle",
        "orderIndex": 8
    }
]

def seed_catalogue():
    print("=" * 60)
    print("PRAVAAH UPSC: MULTI-EXAM CATALOGUE SEEDER")
    print("=" * 60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    count = 0
    for ex in EXAMS:
        exam_id = f"exam_dir_{ex['code'].lower()}"
        cursor.execute("""
            INSERT INTO ExamDirectory (
                id, code, name, conductingBody, category, overview,
                eligibilityQualifications, ageLimit, attemptsAllowed,
                stagesDescription, officialNotificationUrl, syllabusOverview,
                examCycleDates, totalVacanciesTypical, isActive, orderIndex,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
                name = excluded.name,
                overview = excluded.overview,
                eligibilityQualifications = excluded.eligibilityQualifications,
                ageLimit = excluded.ageLimit,
                attemptsAllowed = excluded.attemptsAllowed,
                stagesDescription = excluded.stagesDescription,
                officialNotificationUrl = excluded.officialNotificationUrl,
                syllabusOverview = excluded.syllabusOverview,
                examCycleDates = excluded.examCycleDates,
                totalVacanciesTypical = excluded.totalVacanciesTypical,
                updatedAt = excluded.updatedAt
        """, (
            exam_id, ex["code"], ex["name"], ex["conductingBody"], ex["category"],
            ex["overview"], ex["eligibilityQualifications"], ex["ageLimit"],
            ex["attemptsAllowed"], ex["stagesDescription"], ex["officialNotificationUrl"],
            ex["syllabusOverview"], ex["examCycleDates"], ex["totalVacanciesTypical"],
            ex["orderIndex"], now, now
        ))
        count += 1
        print(f"  ✓ Seeded {ex['code']}: {ex['name']}")
        
    conn.commit()
    conn.close()
    print("=" * 60)
    print(f"Successfully seeded {count} UPSC examinations in ExamDirectory.")
    print("=" * 60)

if __name__ == "__main__":
    seed_catalogue()
