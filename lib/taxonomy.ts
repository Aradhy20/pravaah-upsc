/**
 * PRAVAAH UPSC 2.0 — CENTRALIZED OFFICIAL EXAMINATION TAXONOMY
 * 
 * Versioned, authoritative taxonomy governing all 14 official examination tracks
 * conducted or archived by the Union Public Service Commission (UPSC).
 * 
 * Features:
 * - Differentiates marking schemes, paper structures, and stages per examination
 * - Admin-extensible without code rewrites
 * - Bi-directional synchronization with PostgreSQL (Exam, ExamStage, Paper, ExamDirectory)
 */

export interface ExamMarkingScheme {
  positiveMark: number;
  negativeMark: number;
  qualifyingPercentage?: number;
  isNegativeApplicable: boolean;
  notes?: string;
}

export interface ExamPaperTaxonomy {
  paperCode: string;
  name: string;
  type: "OBJECTIVE_MCQ" | "SUBJECTIVE_CONVENTIONAL";
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  markingScheme: ExamMarkingScheme;
  subjects: string[];
  syllabusOverview: string;
}

export interface ExamStageTaxonomy {
  stageCode: "PRELIMS" | "MAINS" | "INTERVIEW" | "RECRUITMENT_TEST" | "PET_MEDICAL";
  name: string;
  orderIndex: number;
  isQualifyingOnly: boolean;
  papers?: ExamPaperTaxonomy[];
  interviewComponents?: string[];
  totalMarks?: number;
}

export interface ExamTaxonomyEntry {
  code: string;
  name: string;
  conductingBody: "UPSC";
  category: 
    | "Civil Services"
    | "All India Services"
    | "Defence Services"
    | "Paramilitary & Police"
    | "Engineering Services"
    | "Medical Services"
    | "Economic & Statistical"
    | "Geological Services"
    | "Recruitment & Special"
    | "Departmental LDCE"
    | "Historical Archive";
  overview: string;
  currentStatus: "ACTIVE" | "UPCOMING" | "CONCLUDED" | "HISTORICAL_ARCHIVE";
  officialNotificationUrl: string;
  syllabusOverview: string;
  eligibilityQualifications: string;
  ageLimit: string;
  attemptsAllowed: string;
  examCycleDates: string;
  totalVacanciesTypical: string;
  stages: ExamStageTaxonomy[];
  subjectTaxonomy: Array<{ subjectName: string; topics: string[] }>;
  studyMaterialGuidance: string[];
}

export const OFFICIAL_UPSC_EXAM_TAXONOMY: ExamTaxonomyEntry[] = [
  {
    code: "CSE",
    name: "Civil Services Examination",
    conductingBody: "UPSC",
    category: "Civil Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Preliminary%29%20Examination",
    overview: "Premier national competitive examination to recruit officers for IAS, IPS, IFS (Diplomatic), IRS, and Group 'A' & 'B' Central Services.",
    eligibilityQualifications: "Graduate degree in any discipline from a recognized university.",
    ageLimit: "21 to 32 years (Relaxations: OBC +3 yrs, SC/ST +5 yrs, PwBD +10 yrs).",
    attemptsAllowed: "General: 6 attempts, OBC: 9 attempts, SC/ST: Unlimited (up to age limit).",
    examCycleDates: "Notification: February, Prelims: May/June, Mains: September/October, Personality Test: Jan-April.",
    totalVacanciesTypical: "900 - 1,100 vacancies annually",
    syllabusOverview: "General Studies Paper I (Polity, History, Economy, Geography, Environment, Science & Tech, Current Affairs) and CSAT Paper II (Reading Comprehension, Reasoning, Quantitative Aptitude).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Preliminary Examination (Objective Screening)",
        orderIndex: 1,
        isQualifyingOnly: true,
        papers: [
          {
            paperCode: "GS1",
            name: "General Studies Paper I",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 100,
            totalMarks: 200,
            durationMinutes: 120,
            markingScheme: {
              positiveMark: 2.0,
              negativeMark: 0.666,
              isNegativeApplicable: true,
              notes: "Cutoff determines qualification for Mains. Merit determined solely by GS1."
            },
            subjects: ["Indian Polity", "History & Culture", "Economy", "Geography", "Environment & Ecology", "General Science", "Current Affairs"],
            syllabusOverview: "National & international current events, Indian history, Indian & world geography, governance & constitution, economic & social development, environmental ecology, general science."
          },
          {
            paperCode: "CSAT",
            name: "Civil Services Aptitude Test (Paper II)",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 80,
            totalMarks: 200,
            durationMinutes: 120,
            markingScheme: {
              positiveMark: 2.5,
              negativeMark: 0.833,
              qualifyingPercentage: 33.33,
              isNegativeApplicable: true,
              notes: "Qualifying paper only. Candidate must score at least 66 marks (33.33%)."
            },
            subjects: ["Reading Comprehension", "Logical Reasoning", "Analytical Ability", "Decision Making", "Basic Numeracy", "Data Interpretation"],
            syllabusOverview: "Comprehension, interpersonal skills including communication skills, logical reasoning and analytical ability, decision-making and problem-solving, general mental ability, basic numeracy (Class X level)."
          }
        ]
      },
      {
        stageCode: "MAINS",
        name: "Main Examination (Descriptive Written)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 1750,
        papers: [
          { paperCode: "LANG_QUAL", name: "Paper A: Indian Language", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 6, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, qualifyingPercentage: 25, isNegativeApplicable: false }, subjects: ["Eighth Schedule Language"], syllabusOverview: "Comprehension, precis writing, translation, usage." },
          { paperCode: "ENG_QUAL", name: "Paper B: English", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 6, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, qualifyingPercentage: 25, isNegativeApplicable: false }, subjects: ["English"], syllabusOverview: "Comprehension, precis writing, usage & vocabulary, short essay." },
          { paperCode: "ESSAY", name: "Paper I: Essay", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 2, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Philosophical & Socio-Economic Essays"], syllabusOverview: "Two essays to be written from Section A & Section B." },
          { paperCode: "GS1_MAINS", name: "Paper II: General Studies I", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 20, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Indian Heritage & Culture", "Modern History", "World History", "Geography", "Society"], syllabusOverview: "Indian Culture, Modern Indian History, Freedom Struggle, Post-independence consolidation, World History, Indian Society, Physical Geography, Resources." },
          { paperCode: "GS2_MAINS", name: "Paper III: General Studies II", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 20, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Governance", "Constitution", "Polity", "Social Justice", "International Relations"], syllabusOverview: "Indian Constitution, functions of Union & States, Separation of powers, RPA, Statutory bodies, Welfare schemes, Health/Education/HR, International Relations." },
          { paperCode: "GS3_MAINS", name: "Paper IV: General Studies III", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 20, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Technology", "Economic Development", "Bio-diversity", "Environment", "Security", "Disaster Management"], syllabusOverview: "Indian Economy, Inclusive growth, Budgeting, Agriculture & Food processing, Science & Technology, Environment & Climate, Internal Security, Disaster management." },
          { paperCode: "GS4_MAINS", name: "Paper V: General Studies IV", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 12, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Ethics", "Integrity", "Aptitude", "Case Studies"], syllabusOverview: "Ethics & Human Interface, Attitude, Aptitude & Foundational values for Civil Service, Emotional Intelligence, Moral thinkers, Public values & Governance ethics, Case Studies." },
          { paperCode: "OPT1_MAINS", name: "Paper VI: Optional Subject Paper 1", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Candidate Selected Optional"], syllabusOverview: "Specialized undergraduate/postgraduate curriculum in chosen discipline." },
          { paperCode: "OPT2_MAINS", name: "Paper VII: Optional Subject Paper 2", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 250, durationMinutes: 180, markingScheme: { positiveMark: 250, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Candidate Selected Optional"], syllabusOverview: "Applied and advanced problems in chosen optional discipline." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test (Interview)",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 275,
        interviewComponents: [
          "Detailed Application Form (DAF) verification",
          "Situational decision-making and administrative ethics",
          "Knowledge of home state, culture, and governance challenges",
          "Current national and international developments",
          "Intellectual integrity, analytical composure, and balance of judgment"
        ]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Indian Polity", topics: ["Constitutional Framework", "Preamble & Fundamental Rights", "Directive Principles & Fundamental Duties", "Union Executive & Parliament", "Judiciary & Judicial Review", "Federalism & Centre-State Relations", "Local Governance (Panchayats & Municipalities)", "Constitutional & Statutory Bodies", "Elections & Political Dynamics"] },
      { subjectName: "History & Art & Culture", topics: ["Ancient India & Indus Valley", "Buddhism, Jainism & Vedic Philosophy", "Mauryan & Gupta Empires", "Medieval India & Bhakti-Sufi Traditions", "Mughal Empire & Architecture", "Modern India & British Expansion", "Socio-Religious Reform Movements", "Indian National Movement (1857-1947)", "Classical Dances, Music & Paintings", "UNESCO Heritage & Temple Architecture"] },
      { subjectName: "Economy", topics: ["National Income & GDP", "Fiscal Policy & Union Budget", "Monetary Policy & Banking (RBI)", "Inflation & Price Indices", "External Sector & BoP", "Agriculture & Food Security", "Industrial Sector & Infrastructure", "Poverty, Inequality & Employment", "International Financial Institutions (IMF, WB, WTO)"] },
      { subjectName: "Geography", topics: ["Geomorphology & Plate Tectonics", "Climatology & Monsoon Dynamics", "Oceanography & Marine Resources", "Biogeography & Soil Systems", "Indian Physical Geography", "Drainage Systems & River Basins", "Economic & Mineral Geography", "Human Geography & Urbanization"] },
      { subjectName: "Environment & Ecology", topics: ["Ecosystem Concepts & Biomes", "Biodiversity Conservation & Hotspots", "Wildlife Protection Act & Protected Areas", "Climate Change, IPCC & UNFCCC", "Pollution Control & Waste Management", "Environmental Legislation in India", "International Environmental Conventions"] },
      { subjectName: "Science & Technology", topics: ["Space Technology & ISRO Missions", "Defense Technology & Missiles", "Biotechnology & Genetic Engineering", "Nanotechnology & Robotics", "Information & Communication Tech (5G, AI, Quantum)", "Public Health, Vaccines & Immunology"] }
    ],
    studyMaterialGuidance: [
      "NCERT Textbooks Class 6 to 12 (Foundational)",
      "Indian Polity by M. Laxmikanth",
      "A Brief History of Modern India by Rajiv Ahir (Spectrum)",
      "Indian Economy by Ramesh Singh or Nitin Singhania",
      "Certificate Physical & Human Geography by G.C. Leong",
      "Environment by Shankar IAS or PMF IAS",
      "Economic Survey & Union Budget (Current Year)",
      "The Hindu / Indian Express + PIB Daily Releases"
    ]
  },
  {
    code: "IFS",
    name: "Indian Forest Service Examination (IFoS)",
    conductingBody: "UPSC",
    category: "All India Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Indian%20Forest%20Service%20%28Preliminary%29%20Examination",
    overview: "Recruits All-India Service officers dedicated to managing the ecological security, wildlife conservation, and national forestry assets of India.",
    eligibilityQualifications: "Bachelor's degree with at least one subject among Animal Husbandry, Veterinary Science, Botany, Chemistry, Geology, Mathematics, Physics, Statistics, Zoology, Agriculture, or Forestry, or Bachelor in Engineering.",
    ageLimit: "21 to 32 years (Relaxations: OBC +3, SC/ST +5).",
    attemptsAllowed: "General: 6, OBC: 9, SC/ST: Unlimited.",
    examCycleDates: "Prelims conducted jointly with CSE. IFoS Mains: November.",
    totalVacanciesTypical: "100 - 150 vacancies annually",
    syllabusOverview: "Joint Prelims with CSE (higher cutoff). Dedicated descriptive Mains: General English, General Knowledge, plus two scientific optional subjects.",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Civil Services (Preliminary) Examination (Screening)",
        orderIndex: 1,
        isQualifyingOnly: true,
        papers: [
          { paperCode: "GS1", name: "General Studies Paper I", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["Environment", "General Studies"], syllabusOverview: "Same as CSE Prelims GS1, with significantly higher qualifying cutoff due to environmental emphasis." },
          { paperCode: "CSAT", name: "CSAT Paper II", type: "OBJECTIVE_MCQ", totalQuestions: 80, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.5, negativeMark: 0.833, qualifyingPercentage: 33.33, isNegativeApplicable: true }, subjects: ["Aptitude"], syllabusOverview: "33% qualifying requirement." }
        ]
      },
      {
        stageCode: "MAINS",
        name: "IFoS Main Examination",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 1400,
        papers: [
          { paperCode: "ENG_IFOS", name: "Paper I: General English", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 5, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, isNegativeApplicable: false }, subjects: ["English"], syllabusOverview: "Essay, precis, comprehension." },
          { paperCode: "GK_IFOS", name: "Paper II: General Knowledge", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 10, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, isNegativeApplicable: false }, subjects: ["GK, Indian History & Geography"], syllabusOverview: "General knowledge including knowledge of current events." },
          { paperCode: "OPT1_P1", name: "Paper III: Optional Subject 1 (Paper 1)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Forestry/Botany/Zoology/Engg"], syllabusOverview: "Technical forestry/science syllabus." },
          { paperCode: "OPT1_P2", name: "Paper IV: Optional Subject 1 (Paper 2)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Forestry/Botany/Zoology/Engg"], syllabusOverview: "Advanced technical problems." },
          { paperCode: "OPT2_P1", name: "Paper V: Optional Subject 2 (Paper 1)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Second Science/Engineering Discipline"], syllabusOverview: "Second optional curriculum." },
          { paperCode: "OPT2_P2", name: "Paper VI: Optional Subject 2 (Paper 2)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Second Science/Engineering Discipline"], syllabusOverview: "Advanced second optional." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 300,
        interviewComponents: ["Forestry policy, biodiversity conservation, wildlife management, personality assessment."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Forestry & Silviculture", topics: ["Silvicultural Systems", "Forest Mensuration & Inventory", "Forest Policy & Law", "Agroforestry & Social Forestry", "Forest Protection & Pathology"] },
      { subjectName: "Environmental Biology", topics: ["Ecology & Ecosystems", "Wildlife Biology & Management", "Conservation Genetics", "Watershed Management"] }
    ],
    studyMaterialGuidance: ["Indian Forestry by K. Manikandan and S. Prabhu", "Prabhu & Manikandan Silviculture & Agroforestry", "NCERT Biology 11 & 12"]
  },
  {
    code: "CDS",
    name: "Combined Defence Services Examination (CDS)",
    conductingBody: "UPSC",
    category: "Defence Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination",
    overview: "Recruits Commissioned Officers into the Indian Military Academy (IMA), Indian Naval Academy (INA), Air Force Academy (AFA), and Officers Training Academy (OTA).",
    eligibilityQualifications: "IMA/OTA: Degree from recognized university. INA: Degree in Engineering. AFA: Degree with Physics and Math at 10+2 or Bachelor of Engineering.",
    ageLimit: "19 to 24 years (depending on academy choice). Unmarried status required.",
    attemptsAllowed: "No fixed attempt limit (governed by age window).",
    examCycleDates: "Conducted twice yearly: CDS I (April) and CDS II (September).",
    totalVacanciesTypical: "340 - 450 vacancies per cycle",
    syllabusOverview: "English, General Knowledge, and Elementary Mathematics (IMA/INA/AFA). For OTA candidates, Mathematics is exempted.",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "ENG_CDS", name: "English", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 100, durationMinutes: 120, markingScheme: { positiveMark: 0.833, negativeMark: 0.277, isNegativeApplicable: true }, subjects: ["Grammar", "Vocabulary", "Comprehension"], syllabusOverview: "Designed to test the candidate's understanding of English and workmanlike use of words." },
          { paperCode: "GK_CDS", name: "General Knowledge", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 100, durationMinutes: 120, markingScheme: { positiveMark: 0.833, negativeMark: 0.277, isNegativeApplicable: true }, subjects: ["Current Events", "History", "Geography", "Science"], syllabusOverview: "Knowledge of current events and matters of everyday observation and experience in their scientific aspects." },
          { paperCode: "MATH_CDS", name: "Elementary Mathematics (IMA/INA/AFA only)", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 100, durationMinutes: 120, markingScheme: { positiveMark: 1.0, negativeMark: 0.333, isNegativeApplicable: true }, subjects: ["Arithmetic", "Algebra", "Trigonometry", "Geometry", "Mensuration", "Statistics"], syllabusOverview: "Number system, elementary algebra, plane geometry, mensuration, and elementary statistics." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Services Selection Board (SSB) Interview",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 300,
        interviewComponents: ["Stage I: OIR (Officer Intelligence Rating) & PPDT (Picture Perception and Description Test)", "Stage II: Psychology Tests, GTO (Group Testing Officer) tasks, Personal Interview, and Conference."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Defence General Knowledge", topics: ["Indian Armed Forces Structure", "Military History & Operations", "Modern Defense Hardware", "Geopolitics & Security Issues"] },
      { subjectName: "Elementary Mathematics", topics: ["Number Systems & Divisibility", "Time & Work, Speed & Distance", "Trigonometric Ratios & Heights/Distances", "Mensuration of 2D/3D Figures", "Measures of Central Tendency"] }
    ],
    studyMaterialGuidance: ["Pathfinder for CDS Examination (Arihant)", "Quantitative Aptitude for Competitive Examinations by R.S. Aggarwal", "Objective General English by S.P. Bakshi"]
  },
  {
    code: "NDA",
    name: "National Defence Academy & Naval Academy Examination (NDA/NA)",
    conductingBody: "UPSC",
    category: "Defence Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination",
    overview: "Joint training institution for Army, Navy and Air Force cadets prior to commissioning. Admits male and female candidates straight after 10+2.",
    eligibilityQualifications: "Army Wing: 12th Class pass of 10+2 pattern. Air Force & Navy: 12th Class pass with Physics, Chemistry and Mathematics.",
    ageLimit: "16.5 to 19.5 years. Unmarried status required.",
    attemptsAllowed: "Governed strictly by date-of-birth age window.",
    examCycleDates: "Conducted twice yearly: NDA I (April) and NDA II (September).",
    totalVacanciesTypical: "395 - 400 vacancies per cycle",
    syllabusOverview: "Mathematics (Class 11 & 12 CBSE curriculum) and General Ability Test (English + General Knowledge comprising Physics, Chemistry, General Science, History, Geography, Current Events).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          {
            paperCode: "MATH_NDA",
            name: "Mathematics (Paper I)",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 120,
            totalMarks: 300,
            durationMinutes: 150,
            markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true, notes: "Requires ~25% sectional minimum qualification." },
            subjects: ["Algebra", "Matrices & Determinants", "Trigonometry", "Analytical Geometry", "Differential Calculus", "Integral Calculus & Differential Equations", "Vector Algebra", "Statistics & Probability"],
            syllabusOverview: "Rigorous 10+2 mathematics."
          },
          {
            paperCode: "GAT_NDA",
            name: "General Ability Test (Paper II)",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 150,
            totalMarks: 600,
            durationMinutes: 150,
            markingScheme: { positiveMark: 4.0, negativeMark: 1.333, isNegativeApplicable: true, notes: "Part A (English, 50 Q, 200 M) + Part B (General Knowledge, 100 Q, 400 M)." },
            subjects: ["English", "Physics", "Chemistry", "General Science", "History & Freedom Movement", "Geography", "Current Events"],
            syllabusOverview: "English comprehension and grammar; General knowledge across fundamental sciences and Indian history/geography."
          }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "SSB Interview (Officer Potential & Psychology)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 900,
        interviewComponents: ["Screening test (OIR & PPDT)", "Psychology tests (TAT, WAT, SRT, Self-Description)", "Group Testing (GD, GPE, PGT, HGT, Snake Race, Command Task)", "Board Interview and Conference."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "NDA Mathematics", topics: ["Sets, Relations & Functions", "Complex Numbers & Quadratic Equations", "Binomial Theorem & Logarithms", "Permutations & Combinations", "2D & 3D Geometry", "Limits, Continuity & Derivatives", "Definite & Indefinite Integrals", "Probability Distributions"] },
      { subjectName: "GAT Physical Sciences", topics: ["Mechanics & Gravitation", "Thermodynamics & Heat", "Optics & Wave Motion", "Current Electricity & Magnetism", "Chemical Reactions & Atomic Structure", "Acids, Bases & Salts"] }
    ],
    studyMaterialGuidance: ["Pathfinder for NDA & NA (Arihant)", "Mathematics for NDA/NA by R.S. Aggarwal", "NCERT Physics & Chemistry Class 11 & 12"]
  },
  {
    code: "CAPF",
    name: "Central Armed Police Forces (Assistant Commandants) Examination",
    conductingBody: "UPSC",
    category: "Paramilitary & Police",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Central%20Armed%20Police%20Forces%20%28ACs%29%20Examination",
    overview: "Recruits Assistant Commandants (Group 'A' Gazetted Officers) into BSF, CRPF, CISF, ITBP, and SSB.",
    eligibilityQualifications: "Bachelor's degree of a recognized university.",
    ageLimit: "20 to 25 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: April/May, Written Examination: August.",
    totalVacanciesTypical: "300 - 500 vacancies annually",
    syllabusOverview: "Paper I (General Ability and Intelligence - Objective) and Paper II (General Studies, Essay and Comprehension - Descriptive).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          {
            paperCode: "CAPF_P1",
            name: "Paper I: General Ability & Intelligence",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 125,
            totalMarks: 250,
            durationMinutes: 120,
            markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true, notes: "Evaluation of Paper II is conditional on qualifying Paper I." },
            subjects: ["General Mental Ability", "General Science", "Current Events", "Indian Polity & Economy", "History of India", "World & Indian Geography"],
            syllabusOverview: "Logical reasoning, quantitative aptitude, everyday science, polity, security challenges, Indian history and geography."
          },
          {
            paperCode: "CAPF_P2",
            name: "Paper II: General Studies, Essay & Comprehension",
            type: "SUBJECTIVE_CONVENTIONAL",
            totalQuestions: 6,
            totalMarks: 200,
            durationMinutes: 180,
            markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false, notes: "Essay can be written in English or Hindi; precis, report writing and comprehension in English only." },
            subjects: ["Essay Writing", "Argument Writing", "Report Writing", "Precis Writing", "Comprehension & Grammar"],
            syllabusOverview: "Essays on modern Indian history, security issues, geography, economy; arguments for/against; report writing; English precis and grammar."
          }
        ]
      },
      {
        stageCode: "PET_MEDICAL",
        name: "Physical Standards / Physical Efficiency Tests (PST/PET)",
        orderIndex: 2,
        isQualifyingOnly: true,
        interviewComponents: ["100m Race (16s male / 18s female)", "800m Race (3m45s male / 4m45s female)", "Long Jump (3.5m male / 3.0m female)", "Shot Put 7.26kg (4.5m male)"]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test / Interview",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 150,
        interviewComponents: ["Leadership potential, knowledge of internal security, paramilitary roles, border management, personal integrity."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Internal Security & Border Management", topics: ["Border Security Challenges & Cross-border Infiltration", "Left Wing Extremism (Naxalism)", "Insurgency in North-East", "Cyber Security & Critical Infrastructure", "Disaster Relief Operations by CAPFs", "Modern Police Reforms & Human Rights"] },
      { subjectName: "CAPF Analytical Reasoning", topics: ["Data Sufficiency & Syllogisms", "Speed, Distance & Work Calculations", "Basic Logical Deduction & Coding"] }
    ],
    studyMaterialGuidance: ["CAPF Assistant Commandant by Arihant", "Challenges to Internal Security of India by Ashok Kumar IPS", "English Grammar & Composition by Wren & Martin"]
  },
  {
    code: "ESE",
    name: "Engineering Services Examination (ESE / IES)",
    conductingBody: "UPSC",
    category: "Engineering Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Engineering%20Services%20%28Preliminary%29%20Examination",
    overview: "Recruits technical Group 'A' engineering officers into Indian Railway Service of Engineers, Central Engineering Service, Central Water Engineering Service, and Defence Aeronautical Quality Assurance.",
    eligibilityQualifications: "Degree in Engineering (Civil, Mechanical, Electrical, or Electronics & Telecommunication).",
    ageLimit: "21 to 30 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: September, Prelims: February, Mains: June.",
    totalVacanciesTypical: "250 - 450 vacancies annually",
    syllabusOverview: "Three-tier exam: Preliminary (Objective Stage I), Main (Conventional Stage II), and Personality Test (Stage III). Four engineering streams: Civil, Mechanical, Electrical, E&T.",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Stage I: Preliminary Examination (Objective)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "ESE_GS", name: "Paper I: General Studies & Engineering Aptitude", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["Engineering Aptitude", "Ethics in Engineering", "Project Management", "Environment", "Material Science", "ICT"], syllabusOverview: "Current issues of national and international importance relating to social, economic and industrial development; engineering ethics; project management; environment and ecology; material science; ICT." },
          { paperCode: "ESE_ENGG_OBJ", name: "Paper II: Engineering Discipline Specific Paper", type: "OBJECTIVE_MCQ", totalQuestions: 150, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["Civil / Mech / Electrical / E&T Core"], syllabusOverview: "Technical objective paper covering core branch concepts." }
        ]
      },
      {
        stageCode: "MAINS",
        name: "Stage II: Main Examination (Conventional Technical)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 600,
        papers: [
          { paperCode: "ESE_CONV_1", name: "Paper I: Discipline Specific Conventional 1", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Engineering Branch Group 1"], syllabusOverview: "Conventional numerical, derivations, and engineering design problems." },
          { paperCode: "ESE_CONV_2", name: "Paper II: Discipline Specific Conventional 2", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 300, durationMinutes: 180, markingScheme: { positiveMark: 300, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Engineering Branch Group 2"], syllabusOverview: "Advanced engineering design and industrial applications." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Stage III: Personality Test",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Technical mastery, practical problem solving, leadership in infrastructure projects, field engineering challenges."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "General Engineering Aptitude", topics: ["Project Management Tools (PERT/CPM)", "Engineering Drawing & Design Standards", "Quality & Maintenance Practices", "Environmental Pollution & Green Buildings", "Safety Standards & Disaster Mitigation"] }
    ],
    studyMaterialGuidance: ["Made Easy / IES Master ESE Prelims Series", "Standard discipline textbooks (Timoshenko, Rajput, Kothari, Haykin)"]
  },
  {
    code: "CMS",
    name: "Combined Medical Services Examination (CMS)",
    conductingBody: "UPSC",
    category: "Medical Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Combined%20Medical%20Services%20Examination",
    overview: "Recruits Medical Officers into Central Health Service, Indian Railway Medical Service, New Delhi Municipal Council, and Municipal Corporation of Delhi.",
    eligibilityQualifications: "Passed the written and practical parts of final M.B.B.S. examination.",
    ageLimit: "Must not have attained 32 years (Relaxations: OBC +3, SC/ST +5).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: April, Computer Based Examination (CBT): July.",
    totalVacanciesTypical: "600 - 800 vacancies annually",
    syllabusOverview: "Two Computer Based Test (CBT) objective papers: Paper I (General Medicine and Paediatrics) and Paper II (Surgery, Gynaecology & Obstetrics, Preventive & Social Medicine).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Computer Based Examination (Objective CBT)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "CMS_P1", name: "Paper I: General Medicine & Paediatrics", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 250, durationMinutes: 120, markingScheme: { positiveMark: 2.083, negativeMark: 0.694, isNegativeApplicable: true }, subjects: ["General Medicine (96 Q)", "Paediatrics (24 Q)"], syllabusOverview: "Cardiology, Respiratory diseases, GI, Endocrine, Neurology, Infections, Haematology, Paediatric nutrition and emergencies." },
          { paperCode: "CMS_P2", name: "Paper II: Surgery, Gynae & Obs, Preventive & Social Medicine", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 250, durationMinutes: 120, markingScheme: { positiveMark: 2.083, negativeMark: 0.694, isNegativeApplicable: true }, subjects: ["Surgery (40 Q)", "Gynaecology & Obstetrics (40 Q)", "Preventive & Social Medicine (40 Q)"], syllabusOverview: "General surgery, Trauma, Orthopaedics, Antenatal care, Labour complications, National Health Programmes, Epidemiology." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test (Viva Voce)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 100,
        interviewComponents: ["Clinical judgment, emergency management, public health ethics, national disease eradication programmes."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Clinical Medicine & Paediatrics", topics: ["Emergency Resuscitation & Shock", "Myocardial Infarction & Arrhythmias", "Tuberculosis & Multi-Drug Resistance", "Neonatal Jaundice & Congenital Anomalies", "Immunization Schedules (Universal Immunization Programme)"] },
      { subjectName: "Community Medicine & Surgery", topics: ["Epidemiological Study Designs", "Biomedical Waste Management Rules", "High Risk Pregnancy & Eclampsia", "Burns & Wound Care", "National Health Mission Framework"] }
    ],
    studyMaterialGuidance: ["Harrison's Principles of Internal Medicine", "Park's Textbook of Preventive and Social Medicine", "Bailey & Love's Short Practice of Surgery", "D.C. Dutta's Textbook of Obstetrics"]
  },
  {
    code: "IES",
    name: "Indian Economic Service Examination (IES)",
    conductingBody: "UPSC",
    category: "Economic & Statistical",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Indian%20Economic%20Service%20-%20Indian%20Statistical%20Service%20Examination",
    overview: "Recruits economic analysts and policy planners for Ministry of Finance, NITI Aayog, Department of Economic Affairs, and various economic ministries.",
    eligibilityQualifications: "Post-Graduate degree in Economics / Applied Economics / Business Economics / Econometrics from a recognized university.",
    ageLimit: "21 to 30 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: April, Written Examination: June.",
    totalVacanciesTypical: "20 - 40 vacancies annually",
    syllabusOverview: "Rigorous descriptive economic examination: General English, General Studies, General Economics I, General Economics II, General Economics III, and Indian Economics.",
    stages: [
      {
        stageCode: "MAINS",
        name: "Written Examination (Descriptive)",
        orderIndex: 1,
        isQualifyingOnly: false,
        totalMarks: 1000,
        papers: [
          { paperCode: "IES_ENG", name: "General English", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 5, totalMarks: 100, durationMinutes: 180, markingScheme: { positiveMark: 100, negativeMark: 0, isNegativeApplicable: false }, subjects: ["English"], syllabusOverview: "Essay, comprehension, vocabulary." },
          { paperCode: "IES_GS", name: "General Studies", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 15, totalMarks: 100, durationMinutes: 180, markingScheme: { positiveMark: 100, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Current Events", "Indian History", "Geography"], syllabusOverview: "General knowledge of India and its constitution." },
          { paperCode: "IES_ECON_1", name: "General Economics Paper I", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Microeconomics", "Econometrics", "Mathematical Methods"], syllabusOverview: "Consumer behaviour, producer theory, welfare economics, econometrics, optimization." },
          { paperCode: "IES_ECON_2", name: "General Economics Paper II", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Macroeconomics", "International Economics", "Growth Models"], syllabusOverview: "Keynesian, Classical, and New Classical macro models, international trade theories, growth models." },
          { paperCode: "IES_ECON_3", name: "General Economics Paper III", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Public Finance", "Environmental Economics", "Industrial Economics"], syllabusOverview: "Fiscal federalism, taxation, public debt, market structures, environmental externalities." },
          { paperCode: "IES_IND_ECON", name: "Indian Economics", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Indian Economy Policy & Structure"], syllabusOverview: "Agricultural policy, industrial planning, monetary policy transmission in India, external debt, economic reforms." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Viva Voce (Interview)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Macroeconomic policy formulation, fiscal management, economic reforms, trade diplomacy."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Advanced Economics", topics: ["Game Theory & Oligopoly Models", "Time Series Analysis & Cointegration", "Dynamic Stochastic General Equilibrium (DSGE)", "GST Architecture & Fiscal Council Debates", "Monetary Policy Committee (MPC) Functioning"] }
    ],
    studyMaterialGuidance: ["Microeconomic Analysis by Hal Varian", "Macroeconomics by Blanchard / Dornbusch & Fischer", "Basic Econometrics by Damodar Gujarati", "Indian Economy by Uma Kapila"]
  },
  {
    code: "ISS",
    name: "Indian Statistical Service Examination (ISS)",
    conductingBody: "UPSC",
    category: "Economic & Statistical",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Indian%20Economic%20Service%20-%20Indian%20Statistical%20Service%20Examination",
    overview: "Recruits statistical scientists and data architects for National Statistical Office (NSO), MoSPI, CSO, and NSSO.",
    eligibilityQualifications: "Bachelor's Degree with Statistics / Mathematical Statistics / Applied Statistics as one of the subjects, or a Master's degree in Statistics.",
    ageLimit: "21 to 30 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: April, Written Examination: June.",
    totalVacanciesTypical: "25 - 50 vacancies annually",
    syllabusOverview: "Two Objective Papers (Statistics I & II) + Two Descriptive Papers (Statistics III & IV) + General English and General Studies.",
    stages: [
      {
        stageCode: "MAINS",
        name: "Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        totalMarks: 1000,
        papers: [
          { paperCode: "ISS_ENG", name: "General English", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 5, totalMarks: 100, durationMinutes: 180, markingScheme: { positiveMark: 100, negativeMark: 0, isNegativeApplicable: false }, subjects: ["English"], syllabusOverview: "English composition." },
          { paperCode: "ISS_GS", name: "General Studies", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 15, totalMarks: 100, durationMinutes: 180, markingScheme: { positiveMark: 100, negativeMark: 0, isNegativeApplicable: false }, subjects: ["GK"], syllabusOverview: "General knowledge." },
          { paperCode: "ISS_STAT_1", name: "Statistics I (Objective)", type: "OBJECTIVE_MCQ", totalQuestions: 80, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true }, subjects: ["Probability", "Descriptive Statistics", "Numerical Analysis"], syllabusOverview: "Probability, standard distributions, correlation & regression, finite differences." },
          { paperCode: "ISS_STAT_2", name: "Statistics II (Objective)", type: "OBJECTIVE_MCQ", totalQuestions: 80, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true }, subjects: ["Linear Models", "Statistical Inference", "Official Statistics"], syllabusOverview: "Estimation, hypothesis testing, non-parametric tests, national income estimation, price indices." },
          { paperCode: "ISS_STAT_3", name: "Statistics III (Descriptive)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 6, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Sampling Techniques", "Econometrics", "Applied Statistics"], syllabusOverview: "SRS, Stratified, Systematic, Cluster sampling; Index numbers; Time series analysis." },
          { paperCode: "ISS_STAT_4", name: "Statistics IV (Descriptive Specialized)", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 6, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Operations Research", "Demography", "Design of Experiments"], syllabusOverview: "Candidate chooses 2 sections out of 7 specialized areas." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Viva Voce",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Survey design, data ethics, statistical modeling of socio-economic data, census methodologies."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Theoretical & Applied Statistics", topics: ["Multivariate Normal Distributions", "Neyman-Pearson Lemma & UMP Tests", "Gauss-Markov Theorem & Multicollinearity", "Sampling and Non-Sampling Errors", "Vital Statistics & Life Tables"] }
    ],
    studyMaterialGuidance: ["Fundamentals of Mathematical Statistics by S.C. Gupta & V.K. Kapoor", "Sampling Techniques by W.G. Cochran", "An Introduction to Probability and Statistics by V.K. Rohatgi"]
  },
  {
    code: "CGSE",
    name: "Combined Geo-Scientist Examination (CGSE)",
    conductingBody: "UPSC",
    category: "Geological Services",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/Combined%20Geo-Scientist%20%28Preliminary%29%20Examination",
    overview: "Recruits Geologists, Geophysicists, and Chemists into the Geological Survey of India (GSI) and Central Ground Water Board (CGWB).",
    eligibilityQualifications: "Master's degree in Geological Science / Geology / Applied Geology / Geophysics / Marine Geophysics / Chemistry / Applied Chemistry.",
    ageLimit: "21 to 32 years (Relaxations: OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Notification: September, Prelims: February, Mains: June.",
    totalVacanciesTypical: "60 - 120 vacancies annually",
    syllabusOverview: "Stage I (Computer-based objective screening) and Stage II (Descriptive technical examination in 3 papers) + Stage III (Interview).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Stage I: Preliminary Examination (Objective)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "CGSE_GS", name: "Paper I: General Studies", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 100, durationMinutes: 120, markingScheme: { positiveMark: 1.0, negativeMark: 0.333, isNegativeApplicable: true }, subjects: ["Current Events", "History", "Geography", "Ecology"], syllabusOverview: "Current events, Indian history, geography, environment and everyday science." },
          { paperCode: "CGSE_STREAM_OBJ", name: "Paper II: Stream Specific Discipline (Geology/Geophysics/Chemistry)", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 300, durationMinutes: 120, markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true }, subjects: ["Core Earth Science Discipline"], syllabusOverview: "Branch technical objective paper." }
        ]
      },
      {
        stageCode: "MAINS",
        name: "Stage II: Main Examination (Conventional)",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 600,
        papers: [
          { paperCode: "CGSE_CONV_1", name: "Paper I: Discipline Conventional 1", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Stream Paper 1"], syllabusOverview: "Detailed technical problems." },
          { paperCode: "CGSE_CONV_2", name: "Paper II: Discipline Conventional 2", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Stream Paper 2"], syllabusOverview: "Applied geological / geophysical / chemical methods." },
          { paperCode: "CGSE_CONV_3", name: "Paper III: Discipline Conventional 3", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Stream Paper 3"], syllabusOverview: "Field investigations, mineral exploration, hydrogeology." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Stage III: Personality Test",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Mineral exploration, seismic hazard assessment, groundwater sustainability, field mapping."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Earth Sciences & Exploration", topics: ["Structural Geology & Tectonics", "Stratigraphy & Palaeontology", "Seismic & Electrical Geophysical Methods", "Geochemistry & Analytical Instrumentation", "Hydrogeology & Aquifer Mapping"] }
    ],
    studyMaterialGuidance: ["Principles of Engineering Geology by K.M. Bangar", "Introduction to Geophysical Prospecting by Milton Dobrin"]
  },
  {
    code: "EPFO_EO",
    name: "EPFO Enforcement Officer / Accounts Officer (EO/AO)",
    conductingBody: "UPSC",
    category: "Recruitment & Special",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/special-recruitment-tests",
    overview: "Recruits Enforcement Officers & Accounts Officers (Group 'B' Non-Ministerial) in the Employees' Provident Fund Organisation (Ministry of Labour & Employment).",
    eligibilityQualifications: "Bachelor's Degree in any subject from a recognized university. Desirable: Law, CA/CWA, MBA.",
    ageLimit: "Up to 30 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age limit.",
    examCycleDates: "Conducted periodically upon cadre vacancy notification.",
    totalVacanciesTypical: "400 - 550 vacancies per cycle",
    syllabusOverview: "Single Recruitment Test (RT) of 2 hours covering General English, Indian Freedom Struggle, Current Events, Indian Polity & Economy, General Accounting Principles, Industrial Relations & Labour Laws, General Science, Computer Applications, Quantitative Aptitude & Reasoning, and Social Security in India.",
    stages: [
      {
        stageCode: "RECRUITMENT_TEST",
        name: "Recruitment Test (Objective RT)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          {
            paperCode: "EPFO_RT",
            name: "Recruitment Test Paper",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 120,
            totalMarks: 300,
            durationMinutes: 120,
            markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true, notes: "Weightage of RT to Interview is 75:25." },
            subjects: ["General English", "Indian Freedom Struggle", "Current Events & Developmental Issues", "Indian Polity & Economy", "General Accounting Principles", "Industrial Relations & Labour Laws", "General Science & Computer Knowledge", "Quantitative Aptitude & Reasoning", "Social Security in India"],
            syllabusOverview: "Comprehensive evaluation of labour laws, accounting concepts, freedom struggle, polity, economics, and social security."
          }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Interview",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 100,
        interviewComponents: ["Understanding of EPFO schemes (EPF, EPS, EDLI), labour code reforms, financial audit, grievance handling."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Industrial Relations & Labour Laws", topics: ["Trade Unions Act & Industrial Disputes Act", "Occupational Safety, Health and Working Conditions Code", "Code on Wages 2019", "Industrial Relations Code 2020", "Code on Social Security 2020", "Factories Act & Workmens Compensation"] },
      { subjectName: "General Accounting Principles", topics: ["Accounting Concepts & Conventions", "Trial Balance & Financial Statements", "Depreciation Accounting", "Consignment & Joint Venture", "Bank Reconciliation Statements"] },
      { subjectName: "Social Security in India", topics: ["EPF Act 1952 Provisions", "ESIC Act 1948 & Maternity Benefit Act", "Unorganized Workers Social Security Act", "Pension Schemes (APY, PM-SYM, PM-KMY)"] }
    ],
    studyMaterialGuidance: ["Industrial Relations and Labour Laws by Piyali Ghosh", "Double Entry Book Keeping by T.S. Grewal", "Social Security Schemes Document (Ministry of Labour & Employment)"]
  },
  {
    code: "EPFO_APFC",
    name: "EPFO Assistant Public Provident Commissioner (APFC)",
    conductingBody: "UPSC",
    category: "Recruitment & Special",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/special-recruitment-tests",
    overview: "Recruits Assistant Public Provident Commissioners (Group 'A' Junior Scale) in EPFO, performing quasi-judicial assessment, enforcement, and regional fund governance.",
    eligibilityQualifications: "Degree of a recognized University or equivalent. Desirable: Diploma in Company Law/Labour Laws/Public Administration.",
    ageLimit: "Up to 35 years (OBC +3 yrs, SC/ST +5 yrs).",
    attemptsAllowed: "Governed by age limit.",
    examCycleDates: "Conducted periodically.",
    totalVacanciesTypical: "150 - 200 vacancies per cycle",
    syllabusOverview: "Broader syllabus than EO/AO including Indian Culture, Heritage and Freedom Movements, Population, Development and Globalization, Governance, Accounting and Auditing, Industrial Relations and Labour Laws, Insurance, Basic Computer Knowledge, Elementary Mathematics & Statistics, and Social Security.",
    stages: [
      {
        stageCode: "RECRUITMENT_TEST",
        name: "Recruitment Test (Objective RT)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          {
            paperCode: "APFC_RT",
            name: "APFC Recruitment Test Paper",
            type: "OBJECTIVE_MCQ",
            totalQuestions: 120,
            totalMarks: 300,
            durationMinutes: 120,
            markingScheme: { positiveMark: 2.5, negativeMark: 0.833, isNegativeApplicable: true, notes: "75:25 weightage between RT and Interview." },
            subjects: ["General English", "Indian Culture & Freedom Movements", "Population, Development & Globalization", "Governance & Constitution", "Present Trends in Indian Economy", "Accounting & Auditing", "Industrial Relations & Labour Laws", "Insurance & Risk Management", "Basic Computer & General Science", "Elementary Mathematics & Statistics", "Social Security in India"],
            syllabusOverview: "Comprehensive multi-disciplinary assessment with emphasis on auditing, insurance, and quasi-judicial principles."
          }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Interview",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 100,
        interviewComponents: ["Quasi-judicial inquiries (Section 7A of EPF Act), investment patterns of provident fund, pension reforms, administrative aptitude."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Auditing & Insurance", topics: ["Types of Audit & Audit Evidence", "Internal Control & Vouching", "Principles of Insurance & Insurable Interest", "Life & Non-Life Insurance Regulations (IRDAI)", "Pension Fund Regulatory and Development Authority (PFRDA)"] },
      { subjectName: "Population & Globalization", topics: ["Demographic Transition in India", "Urbanization Trends & Migration", "Impact of Globalization on Labour Markets", "Social Protection Floor Initiatives (ILO)"] }
    ],
    studyMaterialGuidance: ["Auditing Principles by B.N. Tandon", "Insurance Management by S.C. Sahoo", "Indian Economy by Sanjiv Verma", "Social Security Code 2020 Gazette"]
  },
  {
    code: "CISF_LDCE",
    name: "CISF Assistant Commandants (Executive) LDCE",
    conductingBody: "UPSC",
    category: "Departmental LDCE",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/CISF%20AC%20%28EXE%29%20LDCE",
    overview: "Limited Departmental Competitive Examination for serving Sub-Inspectors and Inspectors in CISF seeking accelerated promotion to Assistant Commandant.",
    eligibilityQualifications: "Completed 4 years of regular service as Sub-Inspector (GD) / Inspector (GD) in CISF with clean service record.",
    ageLimit: "Must not have attained 35 years (SC/ST +5 yrs).",
    attemptsAllowed: "Maximum 3 attempts.",
    examCycleDates: "Notification: December, Examination: March.",
    totalVacanciesTypical: "25 - 40 vacancies annually",
    syllabusOverview: "Paper I (General Ability & Intelligence and Professional Skills - Objective) and Paper II (Essay, Precis Writing and Comprehension - Descriptive).",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "CISF_P1", name: "Paper I: General Ability & Professional Skills", type: "OBJECTIVE_MCQ", totalQuestions: 150, totalMarks: 300, durationMinutes: 150, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["General Ability (75 Q)", "Professional Skills in Industrial Security (75 Q)"], syllabusOverview: "Part A General Ability; Part B CISF Act and Rules, Industrial Security, Aviation Security, VIP Security, Disaster Management, IPC, CrPC, Evidence Act." },
          { paperCode: "CISF_P2", name: "Paper II: Essay, Precis Writing & Comprehension", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 5, totalMarks: 100, durationMinutes: 120, markingScheme: { positiveMark: 100, negativeMark: 0, isNegativeApplicable: false }, subjects: ["English Essay", "Precis Writing", "Comprehension"], syllabusOverview: "Professional communication and analysis." }
        ]
      },
      {
        stageCode: "PET_MEDICAL",
        name: "PST / PET",
        orderIndex: 2,
        isQualifyingOnly: true,
        interviewComponents: ["Physical efficiency standards."]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test",
        orderIndex: 3,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Airport and critical infrastructure security, crisis management, tactical commanding."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "CISF Professional Knowledge", topics: ["CISF Act 1968 & CISF Rules 2001", "Aviation Security (BCAS Regulations)", "Atomic Energy & Space Installation Security", "Use of Fire Arms & Non-Lethal Weapons", "Major Provisions of IPC, CrPC and Indian Evidence Act"] }
    ],
    studyMaterialGuidance: ["CISF Manual & Operating Procedures", "Bare Acts: IPC, CrPC, Evidence Act, CISF Act"]
  },
  {
    code: "CBI_LDCE",
    name: "CBI Deputy Superintendent of Police (DSP) LDCE",
    conductingBody: "UPSC",
    category: "Departmental LDCE",
    currentStatus: "ACTIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/departmental-examinations",
    overview: "Limited Departmental Competitive Examination for Inspector rank officers in Central Bureau of Investigation for promotion to DSP.",
    eligibilityQualifications: "5 years of regular service as Inspector in CBI with exemplary record.",
    ageLimit: "Must not have attained 45 years.",
    attemptsAllowed: "Maximum 3 attempts.",
    examCycleDates: "Conducted periodically by UPSC on request of DoPT/CBI.",
    totalVacanciesTypical: "15 - 30 vacancies per notification",
    syllabusOverview: "Criminal Law, Anti-Corruption Laws, Forensic Science, Cyber Crime Investigation, International Police Cooperation, Case Law, and Criminal Procedure.",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Written Examination (Law & Criminal Jurisprudence)",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "CBI_P1", name: "Paper I: Criminal Law & Special Acts", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["PC Act 1988", "IPC / BNS", "CrPC / BNSS", "Evidence Act / BSA"], syllabusOverview: "Prevention of Corruption Act, PMLA, Fugitive Economic Offenders Act, DSPE Act." },
          { paperCode: "CBI_P2", name: "Paper II: Investigation Techniques & Forensics", type: "SUBJECTIVE_CONVENTIONAL", totalQuestions: 8, totalMarks: 200, durationMinutes: 180, markingScheme: { positiveMark: 200, negativeMark: 0, isNegativeApplicable: false }, subjects: ["Cyber Forensics", "Financial Fraud Investigation", "Letters Rogatory & Extradition"], syllabusOverview: "Practical investigation problem solving and charge sheet drafting." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Personality Test",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 100,
        interviewComponents: ["Investigation leadership, trial court presentation, judicial oversight, anti-corruption strategy."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "Anti-Corruption & Financial Crime Law", topics: ["Prevention of Corruption Act 1988 (2018 Amendments)", "Prevention of Money Laundering Act (PMLA)", "Fugitive Economic Offenders Act", "Benami Transactions Prohibition Act", "Digital Forensics & Evidence Admissibility (Sec 65B/Sec 63)"] }
    ],
    studyMaterialGuidance: ["CBI Crime Manual", "Commentary on PC Act by Justice P.V. Ramakrishna", "Electronic Evidence & Cyber Crimes by Vakul Sharma"]
  },
  {
    code: "SCRA",
    name: "Special Class Railway Apprentices Examination (SCRA Archive)",
    conductingBody: "UPSC",
    category: "Historical Archive",
    currentStatus: "HISTORICAL_ARCHIVE",
    officialNotificationUrl: "https://www.upsc.gov.in/examinations/previous-question-papers/archives",
    overview: "Prestigious historic examination (conducted by UPSC from 1927 until 2015) for high-caliber 10+2 science students to train at Indian Railways Institute of Mechanical and Electrical Engineering (IRIMEE), Jamalpur.",
    eligibilityQualifications: "Intermediate/10+2 with Mathematics and at least one of Physics or Chemistry with First/Second division.",
    ageLimit: "17 to 21 years (Historical rule).",
    attemptsAllowed: "Governed by age window.",
    examCycleDates: "Historical cycle: January notification, June examination. Discontinued post-2015 by Ministry of Railways and UPSC.",
    totalVacanciesTypical: "30 - 45 vacancies per historic cycle",
    syllabusOverview: "Renowned for its rigorous testing of mathematical agility, physics, chemistry, general knowledge, and psychological/mechanical aptitude.",
    stages: [
      {
        stageCode: "PRELIMS",
        name: "Historical Written Examination",
        orderIndex: 1,
        isQualifyingOnly: false,
        papers: [
          { paperCode: "SCRA_P1", name: "Paper I: General Knowledge, English & Psychological Test", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 1.666, negativeMark: 0.555, isNegativeApplicable: true }, subjects: ["GK", "English", "Psychological Aptitude"], syllabusOverview: "General knowledge, english comprehension, and mechanical/spatial aptitude." },
          { paperCode: "SCRA_P2", name: "Paper II: Physics & Chemistry", type: "OBJECTIVE_MCQ", totalQuestions: 120, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 1.666, negativeMark: 0.555, isNegativeApplicable: true }, subjects: ["Physics", "Chemistry"], syllabusOverview: "Advanced 10+2 physics and chemistry problems." },
          { paperCode: "SCRA_P3", name: "Paper III: Mathematics", type: "OBJECTIVE_MCQ", totalQuestions: 100, totalMarks: 200, durationMinutes: 120, markingScheme: { positiveMark: 2.0, negativeMark: 0.666, isNegativeApplicable: true }, subjects: ["Calculus", "Vectors", "Coordinate Geometry", "Algebra"], syllabusOverview: "High-level algebraic and calculus challenges." }
        ]
      },
      {
        stageCode: "INTERVIEW",
        name: "Historical Personality Test",
        orderIndex: 2,
        isQualifyingOnly: false,
        totalMarks: 200,
        interviewComponents: ["Mechanical aptitude, spatial reasoning, dedication to railway engineering."]
      }
    ],
    subjectTaxonomy: [
      { subjectName: "SCRA Historical Science & Aptitude", topics: ["Rotational Dynamics & Thermodynamics", "Electromagnetism & Wave Optics", "Organic Synthesis & Coordination Chemistry", "Spatial Orientation & Mechanical Comprehension"] }
    ],
    studyMaterialGuidance: ["UPSC SCRA 10-Year Solved Papers Archive (Historical reference for analytical rigor)"]
  }
];

/**
 * Resolves an examination taxonomy entry by code (case-insensitive)
 */
export function getTaxonomyByCode(code: string): ExamTaxonomyEntry | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  return OFFICIAL_UPSC_EXAM_TAXONOMY.find(e => e.code === normalized);
}

/**
 * Returns all taxonomy entries grouped by category
 */
export function getTaxonomyByCategory(): Record<string, ExamTaxonomyEntry[]> {
  const grouped: Record<string, ExamTaxonomyEntry[]> = {};
  for (const entry of OFFICIAL_UPSC_EXAM_TAXONOMY) {
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
    }
    grouped[entry.category].push(entry);
  }
  return grouped;
}

/**
 * Synchronizes the official taxonomy into the PostgreSQL database.
 * Idempotently creates or updates ExamDirectory, Exam, ExamStage, and Paper records.
 */
export async function syncTaxonomyToDatabase(prisma: any): Promise<{ syncedExams: number; syncedPapers: number }> {
  let syncedExams = 0;
  let syncedPapers = 0;

  for (let idx = 0; idx < OFFICIAL_UPSC_EXAM_TAXONOMY.length; idx++) {
    const item = OFFICIAL_UPSC_EXAM_TAXONOMY[idx];

    // 1. Upsert ExamDirectory record
    await prisma.examDirectory.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        conductingBody: item.conductingBody,
        category: item.category,
        overview: item.overview,
        eligibilityQualifications: item.eligibilityQualifications,
        ageLimit: item.ageLimit,
        attemptsAllowed: item.attemptsAllowed,
        stagesDescription: item.stages.map(s => `${s.name} (${s.papers?.length || 0} papers)`).join(" -> "),
        officialNotificationUrl: item.officialNotificationUrl,
        syllabusOverview: item.syllabusOverview,
        examCycleDates: item.examCycleDates,
        totalVacanciesTypical: item.totalVacanciesTypical,
        isActive: true,
        orderIndex: idx + 1
      },
      create: {
        code: item.code,
        name: item.name,
        conductingBody: item.conductingBody,
        category: item.category,
        overview: item.overview,
        eligibilityQualifications: item.eligibilityQualifications,
        ageLimit: item.ageLimit,
        attemptsAllowed: item.attemptsAllowed,
        stagesDescription: item.stages.map(s => `${s.name} (${s.papers?.length || 0} papers)`).join(" -> "),
        officialNotificationUrl: item.officialNotificationUrl,
        syllabusOverview: item.syllabusOverview,
        examCycleDates: item.examCycleDates,
        totalVacanciesTypical: item.totalVacanciesTypical,
        isActive: true,
        orderIndex: idx + 1
      }
    });

    // 2. Upsert Exam model record
    const examRecord = await prisma.exam.upsert({
      where: { code: item.code },
      update: { name: item.name },
      create: { code: item.code, name: item.name }
    });

    syncedExams++;

    // 3. Upsert Stages and Papers
    for (const stage of item.stages) {
      // Find or create ExamStage
      let stageRecord = await prisma.examStage.findFirst({
        where: { examId: examRecord.id, name: stage.name }
      });

      if (!stageRecord) {
        stageRecord = await prisma.examStage.create({
          data: {
            examId: examRecord.id,
            name: stage.name,
            orderIndex: stage.orderIndex
          }
        });
      }

      if (stage.papers && stage.papers.length > 0) {
        for (const p of stage.papers) {
          await prisma.paper.upsert({
            where: { code: p.paperCode },
            update: {
              name: p.name,
              totalQuestions: p.totalQuestions,
              totalMarks: p.totalMarks,
              durationMinutes: p.durationMinutes,
              positiveMark: p.markingScheme.positiveMark,
              negativeMark: p.markingScheme.negativeMark
            },
            create: {
              code: p.paperCode,
              name: p.name,
              stageId: stageRecord.id,
              totalQuestions: p.totalQuestions,
              totalMarks: p.totalMarks,
              durationMinutes: p.durationMinutes,
              positiveMark: p.markingScheme.positiveMark,
              negativeMark: p.markingScheme.negativeMark
            }
          });
          syncedPapers++;
        }
      }
    }
  }

  return { syncedExams, syncedPapers };
}
