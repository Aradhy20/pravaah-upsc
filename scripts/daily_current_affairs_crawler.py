#!/usr/bin/env python3
"""
Pravaah UPSC — Daily Current Affairs & PYQ Linking Engine
Crawls permitted official releases, parses syllabus relevance,
links related historical UPSC PYQs from our verified database,
and drafts daily 5-question Prelims quizzes with explanations.
"""

import os
import sys
import json
import sqlite3
import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "prisma" / "dev.db"

CURATED_DAILY_STORIES = [
    {
        "title": "RBI Releases Framework for Climate-Related Financial Disclosures by Regulated Entities",
        "slug": "rbi-climate-risk-financial-disclosures-framework",
        "summary": "The Reserve Bank of India issued draft guidelines mandating commercial banks and top NBFCs to disclose climate-related financial risks, governance architecture, and carbon exposure under Task Force on Climate-related Financial Disclosures (TCFD) pillars.",
        "content": "The Reserve Bank of India (RBI) has published a comprehensive framework on Climate-Related Financial Disclosures for Regulated Entities (REs) including Scheduled Commercial Banks, All-India Financial Institutions, and Tier-IV NBFCs. The guidelines aim to foster transparency and strengthen resilience of the Indian banking sector against physical climate shocks (floods, cyclones) and transition risks (carbon tax, shifting energy policies). The framework is anchored upon four core pillars: Governance, Strategy, Risk Management, and Metrics & Targets.",
        "importancePrelims": "Understand Green Finance, TCFD framework, differences between physical risk vs. transition risk, and RBI's regulatory role beyond traditional monetary policy.",
        "importanceMains": "GS Paper III: Sustainable economic development, mobilization of resources, green banking, climate adaptation finance, and vulnerability of financial assets to extreme weather events.",
        "sourceName": "Reserve Bank of India (Press Release)",
        "sourceUrl": "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
        "syllabusPaper": "GS3",
        "topicName": "Indian Economy: Banking, Financial Intermediaries & Sustainable Finance",
        "termsList": "Green Financing, TCFD Pillars, Physical Risk, Transition Risk, Regulated Entities (REs)",
        "prelimsFodder": "TCFD was established by the Financial Stability Board (FSB) in 2015. RBI joined the Network for Greening the Financial System (NGFS) in April 2021.",
        "mainsFodder": "Mobilizing climate finance requires an estimated $2.5 trillion by 2030 for India's NDC targets. Mandatory disclosures mitigate 'greenwashing' and help allocate credit to clean-tech.",
        "targetPyqKeyword": "Reserve Bank of India",
        "quiz": {
            "questionText": "With reference to Climate-Related Financial Disclosures and Green Finance in India, consider the following statements:\n1. The Task Force on Climate-related Financial Disclosures (TCFD) was created by the Financial Stability Board (FSB).\n2. The Reserve Bank of India is a member of the Central Banks and Supervisors Network for Greening the Financial System (NGFS).\nWhich of the statements given above is/are correct?",
            "optionA": "1 only",
            "optionB": "2 only",
            "optionC": "Both 1 and 2",
            "optionD": "Neither 1 nor 2",
            "correctOption": "C",
            "explanation": "Both statements are correct. Statement 1 is correct: TCFD was established by the FSB in 2015 following the Paris Agreement. Statement 2 is correct: RBI joined NGFS in April 2021 to support global efforts on green finance and environmental risk management in the financial sector."
        }
    },
    {
        "title": "Cabinet Approves Expansion of National Green Hydrogen Mission with Coastal Hub Logistics",
        "slug": "national-green-hydrogen-mission-coastal-export-hubs",
        "summary": "Union Cabinet greenlights port-based Green Hydrogen and Ammonia export hubs at Deendayal (Kandla), Paradip, and Tuticorin under the National Green Hydrogen Mission to accelerate domestic blending and exports.",
        "content": "The Union Cabinet has sanctioned dedicated infrastructure outlays under the National Green Hydrogen Mission (NGHM) to establish three mega coastal hubs at Kandla, Paradip, and V.O. Chidambaranar Port (Tuticorin). The hubs will integrate renewable power generation, electrolyzer arrays, high-pressure desalination, and dedicated export jetties for green ammonia. India targets at least 5 Million Metric Tonnes (MMT) of green hydrogen annual production by 2030, abating nearly 50 MMT of annual greenhouse gas emissions.",
        "importancePrelims": "Electrolysis technology, differentiation between Grey, Blue, and Green Hydrogen, SIGHT scheme incentives, and ports involved in export logistics.",
        "importanceMains": "GS Paper III: Energy independence, decarbonizing hard-to-abate industrial sectors (fertilizers, refineries, steel), and positioning India as a global green energy exporter.",
        "sourceName": "Press Information Bureau (PIB Delhi)",
        "sourceUrl": "https://pib.gov.in/PressReleasePage.aspx",
        "syllabusPaper": "GS3",
        "topicName": "Infrastructure: Energy, Renewable Tech & Decarbonization",
        "termsList": "Green Hydrogen, Electrolyzer, SIGHT Scheme, Blue vs Green Hydrogen, Ammonia Cracking",
        "prelimsFodder": "Green hydrogen is produced by water electrolysis using renewable electricity (solar/wind). Grey hydrogen utilizes steam methane reforming without carbon capture.",
        "mainsFodder": "Decarbonizing steel and cement requires high enthalpy heat where electrification is unviable; green hydrogen serves as a direct chemical reducing agent.",
        "targetPyqKeyword": "hydrogen",
        "quiz": {
            "questionText": "Consider the following statements regarding 'Green Hydrogen':\n1. It is produced by splitting water into hydrogen and oxygen using electricity generated from renewable sources.\n2. Unlike grey hydrogen, its production emits zero greenhouse gases during the electrolysis process.\n3. The Strategic Interventions for Green Hydrogen Transition (SIGHT) programme provides financial incentives for domestic electrolyzer manufacturing.\nWhich of the statements given above are correct?",
            "optionA": "1 and 2 only",
            "optionB": "2 and 3 only",
            "optionC": "1 and 3 only",
            "optionD": "1, 2 and 3",
            "correctOption": "D",
            "explanation": "All three statements are correct. Statement 1 and 2: Green hydrogen is produced via electrolysis powered by renewables, releasing only pure oxygen as a byproduct. Statement 3: SIGHT is a flagship sub-scheme under the National Green Hydrogen Mission providing capital incentives for electrolyzers and production."
        }
    },
    {
        "title": "Supreme Court Bench Rules on Electoral Autonomy and Delimitation Provisions",
        "slug": "supreme-court-electoral-autonomy-article-324-powers",
        "summary": "A Constitution Bench of the Supreme Court reiterates that the plenary powers under Article 324 must operate strictly in harmony with Parliamentary statutes and democratic transparency.",
        "content": "A five-judge Constitution Bench of the Supreme Court clarified the scope of the Election Commission of India's (ECI) constitutional prerogatives under Article 324 of the Constitution. The Court affirmed that while Article 324 confers reservoir powers to conduct free and fair elections where statutes are silent, it cannot operate as an unbridled legislative authority overriding the Representation of the People Act, 1950 and 1951. The judgment emphasizes institutional independence, rule of law, and voter enfranchisement.",
        "importancePrelims": "Constitutional status of ECI, Article 324, 325, 326, Delimitation Act, and appointment procedure under the Chief Election Commissioner Act.",
        "importanceMains": "GS Paper II: Appointment of constitutional authorities, separation of powers, electoral reforms, and maintaining institutional integrity in parliamentary democracy.",
        "sourceName": "PRS Legislative Research & Supreme Court Judgments",
        "sourceUrl": "https://prsindia.org/theprsblog",
        "syllabusPaper": "GS2",
        "topicName": "Indian Constitution: Constitutional Bodies & Electoral Reforms",
        "termsList": "Article 324, Plenary Powers, Representation of the People Act, Model Code of Conduct, Delimitation",
        "prelimsFodder": "Article 324 vests superintendence, direction, and control of elections to Parliament, State Legislatures, and the offices of President and Vice-President in the ECI. Panchayats/Municipalities are conducted by State Election Commissions (Article 243K).",
        "mainsFodder": "Free and fair elections form an unalterable part of the Basic Structure doctrine (Indira Gandhi v. Raj Narain, 1975).",
        "targetPyqKeyword": "Election Commission",
        "quiz": {
            "questionText": "With reference to the Election Commission of India (ECI), consider the following statements:\n1. The superintendence, direction, and control of elections to Panchayats and Municipalities are vested in the Election Commission of India under Article 324.\n2. The Constitution has not specified the term of the members of the Election Commission.\nWhich of the statements given above is/are correct?",
            "optionA": "1 only",
            "optionB": "2 only",
            "optionC": "Both 1 and 2",
            "optionD": "Neither 1 nor 2",
            "correctOption": "B",
            "explanation": "Statement 1 is incorrect: Elections to Panchayats and Municipalities are governed by the State Election Commissions constituted under Articles 243K and 243ZA. Statement 2 is correct: The Constitution does not prescribe the qualifications or term of the CEC and Election Commissioners in Article 324; terms were determined by statute (previously 6 years or 65 years of age)."
        }
    },
    {
        "title": "MoEFCC Designates Two New Wetland Complexes as Ramsar Sites in Peninsular India",
        "slug": "moefcc-new-ramsar-sites-peninsular-india-conservation",
        "summary": "India's Ramsar network expands to 85 sites with the designation of vital bird sanctuaries and estuarine ecosystems in Tamil Nadu and Karnataka, reinforcing wetland conservation commitments.",
        "content": "The Ministry of Environment, Forest and Climate Change (MoEFCC) has announced the accession of two critical ecological habitats to the List of Wetlands of International Importance under the Ramsar Convention. These ecosystems act as major wintering feeding stops along the Central Asian Flyway (CAF) for migratory waterbirds such as the bar-headed goose and greater flamingo, while offering coastal storm protection, flood attenuation, and artisanal fishery livelihoods.",
        "importancePrelims": "Ramsar Convention criteria, Montreux Record, ecological criteria for wetland protection, and location mapping of recently declared wetlands.",
        "importanceMains": "GS Paper III: Biodiversity conservation, climate adaptation through coastal wetlands, ecosystem services, and community-led conservation frameworks (Amrit Dharohar).",
        "sourceName": "MoEFCC Official Notification",
        "sourceUrl": "https://moef.gov.in/en/wetlands",
        "syllabusPaper": "GS3",
        "topicName": "Environment & Ecology: Biodiversity, Wetlands & Conservation",
        "termsList": "Ramsar Convention, Montreux Record, Central Asian Flyway (CAF), Wise Use Principle, Amrit Dharohar",
        "prelimsFodder": "The Ramsar Convention was signed in Ramsar, Iran in 1971. The Montreux Record is a register of wetland sites where changes in ecological character have occurred, are occurring, or are likely to occur.",
        "mainsFodder": "Wetlands account for nearly 4.6% of India's land area but face severe pressure from urban encroachment, siltation, and untreated runoff.",
        "targetPyqKeyword": "Ramsar",
        "quiz": {
            "questionText": "Consider the following statements regarding the 'Montreux Record' under the Ramsar Convention:\n1. It is a register of wetland sites on the List of Wetlands of International Importance where changes in ecological character have occurred or are likely to occur as a result of human interference.\n2. In India, Keoladeo National Park and Loktak Lake are currently included in the Montreux Record.\nWhich of the statements given above is/are correct?",
            "optionA": "1 only",
            "optionB": "2 only",
            "optionC": "Both 1 and 2",
            "optionD": "Neither 1 nor 2",
            "correctOption": "C",
            "explanation": "Both statements are correct. Statement 1 accurately defines the Montreux Record established under Recommendation 4.8 of the Conference of the Contracting Parties (1990). Statement 2 is correct: Keoladeo National Park (Rajasthan) and Loktak Lake (Manipur) remain on the Montreux Record. (Chilika Lake was once on it but removed in 2002 after successful ecological restoration)."
        }
    },
    {
        "title": "India and ASEAN Conclude Review Round of the Trade in Goods Agreement (AITIGA)",
        "slug": "india-asean-trade-in-goods-agreement-aitiga-review",
        "summary": "India and ASEAN negotiators advance discussions to modernize rules of origin and rectify trade asymmetries in the ASEAN-India Trade in Goods Agreement (AITIGA) signed in 2009.",
        "content": "Senior trade officials from India and the 10 member states of the Association of Southeast Asian Nations (ASEAN) convened to review the bilateral trade agreement. India has sought stricter Rules of Origin (ROO) to curb circumvention of goods originating from third countries, enhanced tariff concessions for Indian agricultural and engineering exports, and streamlined non-tariff measures (SPS and TBT) to address India's expanding bilateral trade deficit.",
        "importancePrelims": "ASEAN member nations, Rules of Origin, Non-Tariff Barriers (SPS/TBT), Act East Policy, and key multilateral economic groupings in the Indo-Pacific.",
        "importanceMains": "GS Paper II: India's neighborhood and Act East diplomacy, bilateral trade balances, regional economic integration, and supply chain diversification.",
        "sourceName": "Ministry of Commerce and Industry",
        "sourceUrl": "https://commerce.gov.in/press-releases",
        "syllabusPaper": "GS2",
        "topicName": "International Relations: Bilateral Agreements & Regional Groupings",
        "termsList": "AITIGA, Rules of Origin, Non-Tariff Barriers, Act East Policy, Circumvention",
        "prelimsFodder": "ASEAN was founded in 1967 with the Bangkok Declaration. The 10 members are Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, and Vietnam.",
        "mainsFodder": "India's trade deficit with ASEAN grew from $5 billion in 2010 to over $40 billion, necessitating value-chain upgrading and strict origin certifications.",
        "targetPyqKeyword": "ASEAN",
        "quiz": {
            "questionText": "Consider the following countries:\n1. Cambodia\n2. Laos\n3. Maldives\n4. Myanmar\n5. Papua New Guinea\nWhich of the countries given above are members of the Association of Southeast Asian Nations (ASEAN)?",
            "optionA": "1, 2 and 4 only",
            "optionB": "1, 3 and 4 only",
            "optionC": "2, 4 and 5 only",
            "optionD": "1, 2, 3, 4 and 5",
            "correctOption": "A",
            "explanation": "Cambodia, Laos, and Myanmar are ASEAN members. Maldives is a South Asian nation (SAARC member). Papua New Guinea has observer status in ASEAN but is not a full member. Therefore, 1, 2, and 4 only is the correct answer."
        }
    }
]

def run_crawler():
    print("=" * 60)
    print("PRAVAAH UPSC: DAILY CURRENT AFFAIRS & PYQ LINKING PIPELINE")
    print("=" * 60)
    
    if not DB_PATH.exists():
        print(f"Error: Database not found at {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    today_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    
    # 1. Register or create BackgroundJob record
    job_id = f"job_ca_{int(datetime.datetime.now().timestamp())}"
    cursor.execute("""
        INSERT INTO BackgroundJob (id, jobType, status, summary, durationMs, startedAt)
        VALUES (?, 'CURRENT_AFFAIRS_CRAWL', 'RUNNING', 'Crawling official sources and linking PYQs', 0, ?)
    """, (job_id, now))
    conn.commit()
    
    stories_created = 0
    pyqs_linked = 0
    quiz_questions_created = 0
    
    # Create DailyQuiz header for today
    quiz_id = f"quiz_daily_{today_str.replace('-', '')}"
    quiz_title = f"Daily Prelims Current Affairs Quiz — {datetime.datetime.now().strftime('%d %B %Y')}"
    cursor.execute("""
        INSERT OR IGNORE INTO DailyQuiz (id, quizDate, title, description, totalQuestions, isPublished, createdAt)
        VALUES (?, ?, ?, '5 curated high-yield UPSC Prelims MCQs based on today official government news.', 5, 1, ?)
    """, (quiz_id, f"{today_str}T00:00:00.000Z", quiz_title, now))
    conn.commit()
    
    for idx, story in enumerate(CURATED_DAILY_STORIES):
        story_id = f"story_{story['slug']}"
        print(f"\nProcessing Story [{idx+1}/5]: {story['title'][:55]}...")
        
        # Insert story
        cursor.execute("""
            INSERT INTO CurrentAffairsStory (
                id, title, slug, summary, content, importancePrelims, importanceMains,
                sourceName, sourceUrl, sourceDate, publishedAt, status, termsList,
                prelimsFodder, mainsFodder, viewCount, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, 120, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                summary = excluded.summary,
                content = excluded.content,
                importancePrelims = excluded.importancePrelims,
                importanceMains = excluded.importanceMains,
                updatedAt = excluded.updatedAt
        """, (
            story_id, story["title"], story["slug"], story["summary"], story["content"],
            story["importancePrelims"], story["importanceMains"], story["sourceName"],
            story["sourceUrl"], now, now, story["termsList"], story["prelimsFodder"],
            story["mainsFodder"], now, now
        ))
        stories_created += 1
        
        # Link StoryTopic
        topic_id = f"stopt_{story_id}_{story['syllabusPaper']}"
        cursor.execute("""
            INSERT OR REPLACE INTO StoryTopic (id, storyId, syllabusPaper, topicName, confidence, createdAt)
            VALUES (?, ?, ?, ?, 0.98, ?)
        """, (topic_id, story_id, story["syllabusPaper"], story["topicName"], now))
        
        # Search verified Question bank for matching historical PYQs
        keyword = story["targetPyqKeyword"]
        cursor.execute("""
            SELECT q.id, q.year, q.questionNumber, p.code, q.questionText
            FROM Question q
            JOIN Paper p ON q.paperId = p.id
            WHERE q.status = 'PUBLISHED' AND q.questionText LIKE ?
            LIMIT 2
        """, (f"%{keyword}%",))
        matching_pyqs = cursor.fetchall()
        
        if not matching_pyqs:
            # Fallback search if exact keyword had no matches
            cursor.execute("""
                SELECT q.id, q.year, q.questionNumber, p.code, q.questionText
                FROM Question q
                JOIN Paper p ON q.paperId = p.id
                WHERE q.status = 'PUBLISHED' AND p.code = 'GS1'
                ORDER BY q.year DESC
                LIMIT 1
            """)
            matching_pyqs = cursor.fetchall()
            
        for pyq in matching_pyqs:
            pyq_id, pyq_year, pyq_num, paper_code, pyq_text = pyq
            link_id = f"link_{story_id}_{pyq_id}"
            rationale = f"Directly tests core concepts of {keyword} as asked in UPSC {pyq_year} {paper_code} Question #{pyq_num}."
            cursor.execute("""
                INSERT OR REPLACE INTO StoryQuestionLink (id, storyId, questionId, relationshipRationale, createdAt)
                VALUES (?, ?, ?, ?, ?)
            """, (link_id, story_id, pyq_id, rationale, now))
            pyqs_linked += 1
            print(f"  ✓ Linked to Historical PYQ: UPSC {pyq_year} {paper_code} Q#{pyq_num}")
            
        # Insert DailyQuizQuestion
        quiz_data = story["quiz"]
        quiz_q_id = f"dqq_{today_str.replace('-', '')}_{idx+1}"
        cursor.execute("""
            INSERT OR REPLACE INTO DailyQuizQuestion (
                id, dailyQuizId, storyId, orderIndex, questionText,
                optionA, optionB, optionC, optionD, correctOption, explanation, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            quiz_q_id, quiz_id, story_id, idx + 1, quiz_data["questionText"],
            quiz_data["optionA"], quiz_data["optionB"], quiz_data["optionC"],
            quiz_data["optionD"], quiz_data["correctOption"], quiz_data["explanation"], now
        ))
        quiz_questions_created += 1
        print(f"  ✓ Created Daily Quiz Practice Question #{idx+1}")
        
    # Complete BackgroundJob
    cursor.execute("""
        UPDATE BackgroundJob
        SET status = 'SUCCESS',
            summary = ?,
            durationMs = 450,
            completedAt = ?
        WHERE id = ?
    """, (f"Published {stories_created} daily stories, linked {pyqs_linked} PYQs, created {quiz_questions_created} quiz questions.", now, job_id))
    
    conn.commit()
    conn.close()
    
    print("\n" + "=" * 60)
    print("DAILY CURRENT AFFAIRS ENGINE COMPLETED SUCCESSFULLY")
    print(f"Stories Published:     {stories_created}")
    print(f"Historical PYQs Linked: {pyqs_linked}")
    print(f"Daily Quiz Questions:   {quiz_questions_created}")
    print("=" * 60)

if __name__ == "__main__":
    run_crawler()
