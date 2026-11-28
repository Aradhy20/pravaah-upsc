import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const EXPANDED_VIDEOS = [
  // --- GS1 (History, Geography, Society) ---
  {
    title: "Modern Indian History: 1857 Revolt to Non-Cooperation Movement",
    titleHi: "आधुनिक भारतीय इतिहास: 1857 का विद्रोह से असहयोग आंदोलन तक",
    description: "Detailed chronological breakdown of civil rebellions, socio-religious reform movements (Brahmo Samaj, Arya Samaj, Satyashodhak Samaj), and Gandhian mass mobilization techniques.",
    descriptionHi: "नागरिक विद्रोहों, सामाजिक-धार्मिक सुधार आंदोलनों और गांधीवादी जन आंदोलनों का विस्तृत कालानुक्रमिक विश्लेषण।",
    youtubeUrl: "https://www.youtube.com/watch?v=kYv9qQvPqJg",
    youtubeId: "kYv9qQvPqJg",
    durationMinutes: 45,
    paperCode: "GS1",
    subject: "Modern Indian History",
    topic: "Freedom Struggle & Mass Movements",
    facultyName: "Dr. Anand Sharma (Senior History Faculty)",
    orderIndex: 1,
    isFree: true,
  },
  {
    title: "Indian Temple Architecture: Nagara, Dravida & Vesara Evolution",
    titleHi: "भारतीय मंदिर वास्तुकला: नागर, द्रविड़ एवं वेसर शैलियों का विकास",
    description: "Visual analysis of Shikhara, Vimana, Mandapa, and Gopuram features, with special focus on Khajuraho, Thanjavur Brihadisvara, and Hoysala temples (UNESCO World Heritage).",
    descriptionHi: "शिखर, विमान, मंडप एवं गोपुरम की विशेषताओं सहित खजुराहो, तंजावुर एवं होयसल मंदिरों का विस्तृत स्थापत्य विश्लेषण।",
    youtubeUrl: "https://www.youtube.com/watch?v=0yJ5B9hV_7k",
    youtubeId: "0yJ5B9hV_7k",
    durationMinutes: 38,
    paperCode: "GS1",
    subject: "Indian Art & Culture",
    topic: "Architecture & Sculpture",
    facultyName: "Smt. Meera Sengupta (Art Historian)",
    orderIndex: 2,
    isFree: true,
  },
  {
    title: "Plate Tectonics, Earthquakes & Himalayan Geomorphology",
    titleHi: "प्लेट विवर्तनिकी, भूकंप एवं हिमालयी भू-आकृति विज्ञान",
    description: "Mechanisms of continent-continent collision, Main Central Thrust (MCT), Main Boundary Thrust (MBT), seismic zonation of India, and landslide mitigation.",
    descriptionHi: "महाद्वीपीय अभिसरण, मुख्य केंद्रीय भ्रंश, भूकंपीय क्षेत्र वर्गीकरण एवं भूस्खलन न्यूनीकरण की वैज्ञानिक विवेचना।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    durationMinutes: 40,
    paperCode: "GS1",
    subject: "Physical Geography",
    topic: "Geomorphology & Geotectonics",
    facultyName: "Prof. R. Venkatraman",
    orderIndex: 3,
    isFree: true,
  },
  {
    title: "Urbanization Challenges, Slums & Smart Cities in India",
    titleHi: "भारत में शहरीकरण की चुनौतियाँ, मलिन बस्तियाँ एवं स्मार्ट शहर",
    description: "Spatial segregation, solid waste management, urban heat island effects, and AMRUT / Smart Cities Mission assessment.",
    descriptionHi: "स्थानिक पृथक्करण, ठोस अपशिष्ट प्रबंधन, नगरीय ऊष्मा द्वीप प्रभाव एवं स्मार्ट सिटी मिशन की समीक्षा।",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    durationMinutes: 30,
    paperCode: "GS1",
    subject: "Indian Society",
    topic: "Urbanization & Social Dynamics",
    facultyName: "Pooja Malhotra",
    orderIndex: 4,
    isFree: true,
  },

  // --- GS2 (Polity, Governance, IR) ---
  {
    title: "Basic Structure Doctrine & Kesavananda Bharati Landmark Analysis",
    titleHi: "मूल संरचना सिद्धांत एवं केशवानंद भारती ऐतिहासिक विश्लेषण",
    description: "Evolution from Shankari Prasad, Golaknath to Kesavananda Bharati (1973), Minerva Mills, and recent constitutional challenges under Article 368.",
    descriptionHi: "शंकरी प्रसाद से केशवानंद भारती एवं मिनर्वा मिल्स तक अनुच्छेद 368 के तहत न्यायिक समीक्षा का पूर्ण विकास।",
    youtubeUrl: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
    youtubeId: "2vjPBrBU-TM",
    durationMinutes: 42,
    paperCode: "GS2",
    subject: "Indian Polity & Constitution",
    topic: "Constitutional Framework & Amendment",
    facultyName: "Dr. Anand Sharma",
    orderIndex: 5,
    isFree: true,
  },
  {
    title: "Parliamentary Committees: DRSCs, Public Accounts & Estimates Committee",
    titleHi: "संसदीय समितियाँ: विभागीय स्थायी समितियाँ, लोक लेखा एवं प्राक्कलन समिति",
    description: "Role in executive accountability, pre-legislative scrutiny, CAG audit reports examination, and reasons for declining referral of bills.",
    descriptionHi: "कार्यपालिका की जवाबदेही, सीएजी रिपोर्टों की जांच एवं विधेयकों की जांच में संसदीय समितियों की महत्ता।",
    youtubeUrl: "https://www.youtube.com/watch?v=0yJ5B9hV_7k",
    youtubeId: "0yJ5B9hV_7k",
    durationMinutes: 34,
    paperCode: "GS2",
    subject: "Indian Polity & Governance",
    topic: "Union Legislature & Parliamentary Accountability",
    facultyName: "Shri K. S. Rathore (Retd. IAS)",
    orderIndex: 6,
    isFree: true,
  },
  {
    title: "Indian Federalism: Fiscal Federalism, Finance Commission & Centrally Sponsored Schemes",
    titleHi: "भारतीय संघवाद: वित्तीय संघवाद, वित्त आयोग एवं केंद्र प्रायोजित योजनाएं",
    description: "Horizontal vs vertical tax devolution, Article 275 grants-in-aid, cess and surcharge debates, and cooperative federalism in GST Council.",
    descriptionHi: "क्षैतिज एवं ऊर्ध्वाधर कर विभाजन, अनुच्छेद 275 अनुदान, उपकर विवाद एवं जीएसटी परिषद में सहकारी संघवाद।",
    youtubeUrl: "https://www.youtube.com/watch?v=kYv9qQvPqJg",
    youtubeId: "kYv9qQvPqJg",
    durationMinutes: 36,
    paperCode: "GS2",
    subject: "Governance & Federal Relations",
    topic: "Fiscal Federalism & Devolution",
    facultyName: "Dr. Anand Sharma",
    orderIndex: 7,
    isFree: true,
  },
  {
    title: "India's Neighborhood First Policy & Indo-Pacific Maritime Strategy",
    titleHi: "भारत की पड़ोसी प्रथम नीति एवं हिंद-प्रशांत समुद्री रणनीति",
    description: "Geopolitical dynamics with Bangladesh, Nepal, Sri Lanka, Malacca Strait chokepoint security, QUAD, and SAGAR doctrine.",
    descriptionHi: "पड़ोसी देशों के साथ कूटनीतिक संबंध, मलक्का जलडमरूमध्य सुरक्षा, क्वाड (QUAD) एवं सागर (SAGAR) पहल।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    durationMinutes: 38,
    paperCode: "GS2",
    subject: "International Relations",
    topic: "Bilateral & Regional Strategic Groupings",
    facultyName: "Ambassador S. Mukerji (Retd. IFS)",
    orderIndex: 8,
    isFree: true,
  },

  // --- GS3 (Economy, Agriculture, Environment, Tech, Security) ---
  {
    title: "Fiscal Deficit, FRBM Act & Sovereign Debt Management",
    titleHi: "राजकोषीय घाटा, FRBM अधिनियम एवं संप्रभु ऋण प्रबंधन",
    description: "Primary deficit vs fiscal deficit, NK Singh Committee recommendations (debt-to-GDP ratio targets), and counter-cyclical fiscal policy.",
    descriptionHi: "प्राथमिक घाटा बनाम राजकोषीय घाटा, एन.के. सिंह समिति सिफारिशें एवं प्रति-चक्रीय राजकोषीय नीति।",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    durationMinutes: 35,
    paperCode: "GS3",
    subject: "Indian Economy",
    topic: "Fiscal Policy & Public Debt",
    facultyName: "Prof. R. Venkatraman",
    orderIndex: 9,
    isFree: true,
  },
  {
    title: "Agricultural Supply Chain: APMC Reforms, MSP Formula & Food Processing",
    titleHi: "कृषि आपूर्ति श्रृंखला: APMC सुधार, MSP फॉर्मूला एवं खाद्य प्रसंस्करण",
    description: "Swaminathan Committee C2+50% formula, PM-KISAN, PMFBY crop insurance, e-NAM integration, and cold chain infrastructure.",
    descriptionHi: "स्वामीनाथन आयोग C2+50% फॉर्मूला, पीएम-किसान, फसल बीमा योजना एवं राष्ट्रीय कृषि बाजार (e-NAM)।",
    youtubeUrl: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
    youtubeId: "2vjPBrBU-TM",
    durationMinutes: 40,
    paperCode: "GS3",
    subject: "Agriculture & Food Security",
    topic: "Agricultural Economics & MSP",
    facultyName: "Prof. R. Venkatraman",
    orderIndex: 10,
    isFree: true,
  },
  {
    title: "Biodiversity Conservation & Wildlife Protection Act (1972 & 2022 Amendments)",
    titleHi: "जैव विविधता संरक्षण एवं वन्यजीव संरक्षण अधिनियम (1972 एवं 2022 संशोधन)",
    description: "Rationalization of Schedules from 6 to 4, CITES compliance, invasive alien species regulation, and Community Reserves.",
    descriptionHi: "अनुसूचियों का सरलीकरण (6 से 4), साइट्स (CITES) अनुपालन एवं सामुदायिक रिज़र्व का प्रबंधन।",
    youtubeUrl: "https://www.youtube.com/watch?v=0yJ5B9hV_7k",
    youtubeId: "0yJ5B9hV_7k",
    durationMinutes: 32,
    paperCode: "GS3",
    subject: "Environment & Ecology",
    topic: "Environmental Legislation & Conservation",
    facultyName: "Smt. Meera Sengupta",
    orderIndex: 11,
    isFree: true,
  },
  {
    title: "UNFCCC COP Milestones: Paris Agreement, Article 6 & Carbon Markets",
    titleHi: "UNFCCC कॉप उपलब्धियां: पेरिस समझौता, अनुच्छेद 6 एवं कार्बन बाजार",
    description: "Nationally Determined Contributions (NDCs), Panchamrit targets, Loss and Damage Fund, and Carbon Border Adjustment Mechanism (CBAM).",
    descriptionHi: "राष्ट्रीय स्तर पर निर्धारित योगदान (NDC), पंचामृत लक्ष्य, हानि एवं क्षति कोष एवं कार्बन बाजार।",
    youtubeUrl: "https://www.youtube.com/watch?v=kYv9qQvPqJg",
    youtubeId: "kYv9qQvPqJg",
    durationMinutes: 36,
    paperCode: "GS3",
    subject: "Environment & Climate Change",
    topic: "International Environmental Agreements",
    facultyName: "Smt. Meera Sengupta",
    orderIndex: 12,
    isFree: true,
  },
  {
    title: "Frontier Technologies: CRISPR-Cas9, Quantum Computing & Semiconductor Mission",
    titleHi: "अग्रणी प्रौद्योगिकियां: CRISPR-Cas9, क्वांटम कंप्यूटिंग एवं सेमीकंडक्टर मिशन",
    description: "Base editing, national quantum mission pillars, silicon fab incentives (India Semiconductor Mission), and cybersecurity risks.",
    descriptionHi: "जीन संपादन, राष्ट्रीय क्वांटम मिशन, भारत सेमीकंडक्टर मिशन एवं साइबर सुरक्षा चुनौतियाँ।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    durationMinutes: 33,
    paperCode: "GS3",
    subject: "Science & Technology",
    topic: "Biotechnology & Emerging Tech",
    facultyName: "Dr. Anand Sharma",
    orderIndex: 13,
    isFree: true,
  },
  {
    title: "Internal Security: Border Management, LWE & Cyber Threat Architecture",
    titleHi: "आंतरिक सुरक्षा: सीमा प्रबंधन, वामपंथी उग्रवाद एवं साइबर सुरक्षा ढांचा",
    description: "Comprehensive Integrated Border Management System (CIBMS), National Cyber Security Policy, CERT-In guidelines, and illicit trafficking.",
    descriptionHi: "एकीकृत सीमा प्रबंधन प्रणाली, वामपंथी उग्रवाद न्यूनीकरण एवं राष्ट्रीय साइबर सुरक्षा ढांचा।",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    durationMinutes: 35,
    paperCode: "GS3",
    subject: "Internal Security",
    topic: "Border Security & Defense Policy",
    facultyName: "Shri K. S. Rathore (Retd. IAS)",
    orderIndex: 14,
    isFree: true,
  },

  // --- GS4 (Ethics, Integrity & Aptitude) ---
  {
    title: "Foundational Ethics Principles: Deontology vs Utilitarianism vs Virtue Ethics",
    titleHi: "नीतिशास्त्र के मूलभूत सिद्धांत: कर्तव्यशास्त्र बनाम उपयोगितावाद बनाम सद्गुण नीतिशास्त्र",
    description: "Kant's Categorical Imperative, Bentham & Mill's Greatest Happiness Principle, Aristotle's Golden Mean, and their application to administrative decision making.",
    descriptionHi: "कांट का निरपेक्ष आदेश, बेंथम-मिल का उपयोगितावाद एवं अरस्तू का मध्यम मार्ग प्रशासनिक संदर्भ में।",
    youtubeUrl: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
    youtubeId: "2vjPBrBU-TM",
    durationMinutes: 40,
    paperCode: "GS4",
    subject: "Ethics, Integrity & Aptitude",
    topic: "Moral Philosophies & Ethical Theories",
    facultyName: "Shri K. S. Rathore (Retd. IAS)",
    orderIndex: 15,
    isFree: true,
  },
  {
    title: "Emotional Intelligence in Public Administration & Crisis Negotiation",
    titleHi: "लोक प्रशासन एवं संकट प्रबंधन में भावनात्मक बुद्धिमत्ता (EI)",
    description: "Daniel Goleman's 5 components of EI: self-awareness, self-regulation, motivation, empathy, and social skills in crowd control and disaster response.",
    descriptionHi: "डैनियल गोलमैन के भावनात्मक बुद्धिमत्ता सिद्धांत एवं प्रशासनिक आपदा प्रबंधन में उनका व्यावहारिक उपयोग।",
    youtubeUrl: "https://www.youtube.com/watch?v=0yJ5B9hV_7k",
    youtubeId: "0yJ5B9hV_7k",
    durationMinutes: 30,
    paperCode: "GS4",
    subject: "Ethics, Integrity & Aptitude",
    topic: "Emotional Intelligence in Governance",
    facultyName: "Shri K. S. Rathore (Retd. IAS)",
    orderIndex: 16,
    isFree: true,
  },

  // --- CSAT (Paper II) ---
  {
    title: "Permutations, Combinations & Probability: Complete CSAT Mastery",
    titleHi: "क्रमचय, संचय एवं प्रायिकता: संपूर्ण CSAT समाधान",
    description: "Fundamental principle of counting, circular permutations, selection with repetition, conditional probability, and solving 2021-2024 UPSC trap questions.",
    descriptionHi: "गणना के मूलभूत सिद्धांत, वृत्तीय क्रमचय, प्रतिबंधी प्रायिकता एवं विगत वर्षों के कठिन प्रश्नों का सरलीकृत समाधान।",
    youtubeUrl: "https://www.youtube.com/watch?v=kYv9qQvPqJg",
    youtubeId: "kYv9qQvPqJg",
    durationMinutes: 45,
    paperCode: "CSAT",
    subject: "CSAT Paper II",
    topic: "Permutations, Combinations & Probability",
    facultyName: "Pooja Malhotra (CSAT Aptitude Lead)",
    orderIndex: 17,
    isFree: true,
  },
  {
    title: "Syllogisms & Deductive Reasoning: Venn Diagram & 100-50 Method",
    titleHi: "न्याय निगमन एवं तार्किक क्षमता: वेन आरेख एवं 100-50 नियम",
    description: "Handling 'All', 'Some', 'No', and 'Some Not' statements, possibility cases, and avoiding negative premise fallacies.",
    descriptionHi: "कथन एवं निष्कर्ष, संभावनाओं वाले प्रश्न एवं वेन आरेख पद्धति द्वारा त्रुटिरहित समाधान।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    durationMinutes: 32,
    paperCode: "CSAT",
    subject: "CSAT Paper II",
    topic: "Logical & Analytical Reasoning",
    facultyName: "Pooja Malhotra",
    orderIndex: 18,
    isFree: true,
  },

  // --- ESSAY & TOPPER STRATEGY ---
  {
    title: "Mastering Philosophical Essays: The PESTLE + Temporal Structuring Matrix",
    titleHi: "दार्शनिक निबंध लेखन: PESTLE एवं कालानुक्रमिक संरचना तकनीक",
    description: "How to unpack abstract quotes, build thesis statements, counter-arguments, and weave ethical examples into seamless 1000-1200 word essays.",
    descriptionHi: "अमूर्त विषयों को डिकोड करना, बहुआयामी दृष्टिकोण, नैतिक दृष्टांत एवं प्रभावी उपसंहार रचना।",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    durationMinutes: 38,
    paperCode: "ESSAY",
    subject: "UPSC Mains Essay",
    topic: "Essay Structuring & Philosophical Analysis",
    facultyName: "Dr. Anand Sharma",
    orderIndex: 19,
    isFree: true,
  },
  {
    title: "AIR 1 Topper Masterclass: 12-Month Integrated Prelims-Cum-Mains Blueprint",
    titleHi: "AIR 1 टॉपर मास्टरक्लास: 12-महीने की प्रारंभिक एवं मुख्य परीक्षा एकीकृत योजना",
    description: "Daily hour allocation, micro-theme notes making, newspaper reading vs monthly compilation, mock test frequency, and revision loops.",
    descriptionHi: "दैनिक समय सारिणी, सूक्ष्म नोट्स निर्माण, समाचार पत्र अध्ययन एवं मॉक टेस्ट विश्लेषण की संपूर्ण रणनीति।",
    youtubeUrl: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
    youtubeId: "2vjPBrBU-TM",
    durationMinutes: 50,
    paperCode: "GS1",
    subject: "Preparation Strategy",
    topic: "Topper Masterclasses & Mentorship",
    facultyName: "Pravaah Academic Council (AIR 1 Mentors)",
    orderIndex: 20,
    isFree: true,
  },
];

export const EXPANDED_TOPPERS = [
  {
    topperName: "Aditya Srivastava",
    rank: 1,
    year: 2023,
    examType: "UPSC_CSE",
    paperCode: "GS3",
    optionalSubject: "Electrical Engineering",
    title: "GS Paper 3: Infrastructure, Energy Transition & Disaster Management",
    titleHi: "GS प्रश्नपत्र 3: अवसंरचना, ऊर्जा संक्रमण एवं आपदा प्रबंधन",
    description: "Exemplary engineering precision: structured answers with quantitative data on renewable capacity, National Logistics Policy targets, and Sendai Framework pillars.",
    scoreMarks: "131/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs3-air1-aditya.pdf",
    keyTakeaways: "1. Used quantitative statistics in introductions (e.g. 500 GW non-fossil target by 2030).\n2. Drew a clean box diagram illustrating early warning systems in coastal Odisha.\n3. Evaluated PM Gati Shakti on multi-modal logistics efficiency.",
  },
  {
    topperName: "Aditya Srivastava",
    rank: 1,
    year: 2023,
    examType: "UPSC_CSE",
    paperCode: "GS4",
    optionalSubject: "Electrical Engineering",
    title: "GS Paper 4: Applied Ethics & Bureaucratic Dilemmas",
    titleHi: "GS प्रश्नपत्र 4: व्यावहारिक नीतिशास्त्र एवं प्रशासनिक दुविधाएं",
    description: "Balanced approach between rule of law (Weberian model) and citizen empathy, with explicit quotes from Indian thinkers.",
    scoreMarks: "143/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs4-air1-aditya.pdf",
    keyTakeaways: "1. Used 3-pillar evaluation matrix: Legality, Public Interest, and Long-Term Precedent.\n2. Addressed administrative inertia with whistleblower safeguards.\n3. Concluded with practical Standard Operating Procedures (SOPs).",
  },
  {
    topperName: "Shruti Sharma",
    rank: 1,
    year: 2021,
    examType: "UPSC_CSE",
    paperCode: "GS1",
    optionalSubject: "History",
    title: "GS Paper 1: Ancient Port Towns, Bhakti Movement & Social Reform",
    titleHi: "GS प्रश्नपत्र 1: प्राचीन पत्तन नगर, भक्ति आंदोलन एवं समाज सुधार",
    description: "Rich historical vocabulary, integrating archaeological evidence (Lothal, Muziris) with socio-religious movements.",
    scoreMarks: "119/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs1-air1-shruti.pdf",
    keyTakeaways: "1. Hand-sketched coastal trade routes connecting Roman Empire to Muziris and Arikamedu.\n2. Contrasted Saguna vs Nirguna Bhakti saint-poets.\n3. Structured 19th-century reforms by gender equality, caste abolition, and education.",
  },
  {
    topperName: "Anudeep Durishetty",
    rank: 1,
    year: 2017,
    examType: "UPSC_CSE",
    paperCode: "GS4",
    optionalSubject: "Anthropology",
    title: "GS Paper 4: Ethics in Governance & Probity in Public Life",
    titleHi: "GS प्रश्नपत्र 4: शासन में नीतिशास्त्र एवं सार्वजनिक जीवन में शुचिता",
    description: "The gold standard in ethical answer structuring: concise paragraphs, distinct headings, and real-world district governance examples.",
    scoreMarks: "148/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs4-air1-anudeep.pdf",
    keyTakeaways: "1. Explicitly defined every key term in 2 lines with etymological roots.\n2. Used real IAS case studies (e.g. Tukaram Munde, Armstrong Pame).\n3. Clean, legible handwriting with double underlines on keywords.",
  },
  {
    topperName: "Tina Dabi",
    rank: 1,
    year: 2015,
    examType: "UPSC_CSE",
    paperCode: "GS2",
    optionalSubject: "Political Science",
    title: "GS Paper 2: Judicial Independence, Tribunals & Citizen Charters",
    titleHi: "GS प्रश्नपत्र 2: न्यायिक स्वतंत्रता, अधिकरण एवं नागरिक अधिकार पत्र",
    description: "Lucid constitutional articulation highlighting the tension between executive efficiency and judicial oversight under Article 50.",
    scoreMarks: "128/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs2-air1-tina.pdf",
    keyTakeaways: "1. Cited Chandra Kumar case (1997) for tribunal judicial review.\n2. Point-wise analysis of Sevottam model in Citizen Charters.\n3. Forward-looking reform agenda based on 2nd ARC 4th Report.",
  },
  {
    topperName: "Ravi Kumar Sihag",
    rank: 18,
    year: 2021,
    examType: "UPSC_CSE",
    paperCode: "GS4",
    optionalSubject: "Hindi Literature",
    title: "GS प्रश्नपत्र 4: नीतिशास्त्र एवं प्रशासनिक मूल्य (हिंदी माध्यम मॉडल उत्तर)",
    titleHi: "GS प्रश्नपत्र 4: नीतिशास्त्र एवं प्रशासनिक मूल्य (हिंदी माध्यम मॉडल उत्तर)",
    description: "Hindi Medium benchmark script showcasing precise technical vocabulary (सत्यनिष्ठा, वस्तुनिष्ठता, सहानुभूति, पारदर्शिता) and nuanced ethical reasoning.",
    scoreMarks: "136/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs4-air18-ravi.pdf",
    keyTakeaways: "1. शुद्ध मानक हिंदी शब्दावली का सहज प्रयोग (जैसे: लोक सेवा मूल्य, तटस्थता).\n2. केस स्टडी में व्यक्तिगत मूल्यों बनाम प्रशासनिक नियमों का संतुलन.\n3. व्यावहारिक एवं व्यावहारिक रूप से लागू होने योग्य समाधान।",
  },
  {
    topperName: "Srushti Jayant Deshmukh",
    rank: 5,
    year: 2018,
    examType: "UPSC_CSE",
    paperCode: "GS1",
    optionalSubject: "Sociology",
    title: "GS Paper 1: Secularism in India vs Western Secularism",
    titleHi: "GS प्रश्नपत्र 1: भारतीय धर्मनिरपेक्षता बनाम पश्चिमी धर्मनिरपेक्षता",
    description: "Brilliant comparative analysis demonstrating Sarva Dharma Sambhava vs strict wall of separation between church and state.",
    scoreMarks: "115/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs1-air5-srushti.pdf",
    keyTakeaways: "1. 2-column comparative table highlighting Principled Distance (Rajeev Bhargava concept).\n2. Constitutional grounding in Articles 25-28.\n3. Contemporary relevance in composite cultural heritage.",
  },
  {
    topperName: "Junaid Ahmad",
    rank: 3,
    year: 2018,
    examType: "UPSC_CSE",
    paperCode: "GS2",
    optionalSubject: "Geography",
    title: "GS Paper 2: 73rd & 74th Amendments, Devolution of 3Fs",
    titleHi: "GS प्रश्नपत्र 2: 73वां एवं 74वां संशोधन, 3F (Funds, Functions, Functionaries) का हस्तांतरण",
    description: "Thorough grassroots democracy assessment explaining state finance commissions, proxy women sarpanches (Sarpanch Pati), and district planning committees.",
    scoreMarks: "123/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs2-air3-junaid.pdf",
    keyTakeaways: "1. Flowchart of 3Fs (Funds, Functions, Functionaries) blockages.\n2. Quoted Kerala and Karnataka PRIs best practices.\n3. Proposed social audit mandates under Gram Sabha.",
  },
];

export const EXPANDED_INTERVIEW_QUESTIONS = [
  {
    questionTextEn: "You graduated in Computer Science / Engineering. Why do you want to switch to Civil Services instead of contributing to India's thriving IT economy?",
    questionTextHi: "आपने कंप्यूटर साइंस / इंजीनियरिंग से स्नातक किया है। भारत की संपन्न आईटी अर्थव्यवस्था में योगदान देने के बजाय आप सिविल सेवा में क्यों आना चाहते हैं?",
    contextEn: "Standard opening question for technical and professional graduates facing UPSC Personality Test board.",
    contextHi: "तकनीकी एवं पेशेवर स्नातकों के लिए संघ लोक सेवा आयोग बोर्ड का मानक उद्घाटन प्रश्न।",
    sourceType: "DAF_THEME",
    sourceAttribution: "UPSC Board 2023 - Candidate Transcripts",
    year: 2023,
    topic: "DAF & Educational Background",
    tags: "DAF, Education, Career Choice, Public Service",
    frameworkGuidance: "1. Acknowledge the immense value of technical industry.\n2. Highlight how technology can be directly deployed in public administration (Direct Benefit Transfer, digital land records, AI in grievance redressal).\n3. State the scale, multi-sectoral impact, and grassroots public touchpoint unique to civil services without disparaging the private sector.",
    frameworkGuidanceHi: "1. तकनीकी उद्योग के महत्व को स्वीकार करें।\n2. बताएं कि लोक प्रशासन में तकनीक का उपयोग कैसे किया जा सकता है (DBT, डिजिटल भूमि अभिलेख).\n3. निजी क्षेत्र को कमतर आंके बिना सिविल सेवा के वृहद प्रभाव को स्पष्ट करें।",
  },
  {
    questionTextEn: "You are the District Magistrate of a communally sensitive district. Two communities demand to hold processions on the exact same route on the same evening. How will you handle this situation without curtailing religious freedom?",
    questionTextHi: "आप एक सांप्रदायिक रूप से संवेदनशील जिले के जिलाधिकारी (DM) हैं। दो समुदाय एक ही शाम को एक ही मार्ग पर जुलूस निकालने की मांग करते हैं। आप धार्मिक स्वतंत्रता को सीमित किए बिना इस स्थिति को कैसे संभालेंगे?",
    contextEn: "Situational administrative crisis testing public order, conflict resolution, legal powers (Section 144 BNSS / CrPC), and stakeholder consensus.",
    contextHi: "कानून-व्यवस्था, संघर्ष समाधान, विधिक शक्तियों और हितधारक सहमति का परीक्षण करने वाली स्थितिगत चुनौती।",
    sourceType: "SITUATIONAL",
    sourceAttribution: "UPSC Board Simulated Drill",
    year: 2024,
    topic: "Law & Order & Administrative Crisis",
    tags: "Situational Judgement, Law and Order, Police Administration, Secularism",
    frameworkGuidance: "1. Immediate Preemptive Steps: Convene Peace Committees (Shanti Samiti) with respected elders and religious leaders from both communities.\n2. Negotiation: Offer staggered timings or alternative parallel routes of equal dignity and security coverage.\n3. Security Deployment: Pre-position police force, drone surveillance, and CCTV along the route.\n4. Legal Readiness: Keep preventive orders (Sec 144) as an absolute last resort, emphasizing cooperative dialogue first.\n5. Zero Rumor Policy: Deploy verified district social media handles to refute malicious misinformation.",
    frameworkGuidanceHi: "1. दोनों समुदायों के वरिष्ठ नागरिकों के साथ शांति समिति की तत्काल बैठक।\n2. वैकल्पिक मार्गों या समय के अंतराल पर सहमति बनाने का प्रयास।\n3. ड्रोन और सीसीटीवी के साथ सुरक्षा बलों की तैनाती।\n4. बातचीत को प्राथमिकता देते हुए विधिक निवारक उपायों को अंतिम विकल्प के रूप में रखना।\n5. अफवाहों के त्वरित खंडन के लिए आधिकारिक तंत्र का उपयोग।",
  },
  {
    questionTextEn: "What is your stance on the debate between targeted welfare vs universal basic income (UBI) for poverty alleviation in India?",
    questionTextHi: "भारत में गरीबी उन्मूलन के लिए लक्षित कल्याण (Targeted Welfare) बनाम सार्वभौमिक बुनियादी आय (UBI) पर आपका क्या दृष्टिकोण है?",
    contextEn: "Economic policy and socio-economic justice question assessing fiscal prudence versus inclusive distribution.",
    contextHi: "आर्थिक नीति एवं सामाजिक-आर्थिक न्याय पर राजकोषीय विवेक बनाम समावेशी वितरण का परीक्षण।",
    sourceType: "CANDIDATE_REPORTED",
    sourceAttribution: "UPSC Board 2022 Transcripts",
    year: 2022,
    topic: "Economy & Social Welfare",
    tags: "Economy, Welfare, Poverty Alleviation, Fiscal Prudence",
    frameworkGuidance: "1. Balanced Economic Perspective: Explain the benefits of UBI (zero exclusion errors, administrative simplicity, dignity).\n2. Fiscal Constraints: Highlight that a true universal UBI requires ~10-11% of GDP, which would strain fiscal consolidation.\n3. The Golden Mean: Support quasi-universal basic income (QUBI) targeting vulnerable demographics (widows, elderly, disabled, smallholder farmers via PM-KISAN) while phasing out regressive subsidies.",
    frameworkGuidanceHi: "1. UBI के लाभ: बहिष्करण त्रुटियों की समाप्ति एवं प्रशासनिक सरलता।\n2. राजकोषीय सीमाएं: सकल घरेलू उत्पाद के 10-11% व्यय का राजकोषीय घाटे पर प्रभाव।\n3. संतुलित समाधान: वंचित वर्गों (वृद्ध, दिव्यांग, सीमांत किसान) के लिए लक्षित बुनियादी आय सहायता।",
  },
  {
    questionTextEn: "Recently there has been intense debate surrounding the Collegium System vs National Judicial Appointments Commission (NJAC). Should the executive have a say in judicial appointments?",
    questionTextHi: "हाल ही में कॉलेजियम प्रणाली बनाम राष्ट्रीय न्यायिक नियुक्ति आयोग (NJAC) पर गहन बहस हुई है। क्या न्यायिक नियुक्तियों में कार्यपालिका की भूमिका होनी चाहिए?",
    contextEn: "Constitutional law and institutional checks-and-balances probe.",
    contextHi: "संवैधानिक विधि एवं संस्थागत संतुलन की समझ का परीक्षण।",
    sourceType: "CANDIDATE_REPORTED",
    sourceAttribution: "UPSC Board 2023 Transcripts",
    year: 2023,
    topic: "Constitutional Law & Judiciary",
    tags: "Judiciary, Separation of Powers, Collegium, NJAC",
    frameworkGuidance: "1. Constitutional Benchmark: Article 50 mandates separation of judiciary from executive.\n2. Critique of Collegium: Opaque deliberations, lack of diversity, and memorandum of procedure (MoP) logjams.\n3. Way Forward: Support a restructured, transparent appointment body with broad representation while ensuring judicial primacy to prevent executive veto, alongside an institutionalized secretariat and published eligibility criteria.",
    frameworkGuidanceHi: "1. अनुच्छेद 50 के अनुसार न्यायपालिका की स्वतंत्रता का सिद्धांत।\n2. कॉलेजियम प्रणाली में पारदर्शिता एवं प्रक्रिया ज्ञापन (MoP) की आवश्यकता।\n3. न्यायिक स्वतंत्रता को बनाए रखते हुए पारदर्शी चयन प्रक्रिया का समर्थन।",
  },
  {
    questionTextEn: "Your superior officer instructs you to clear an environmental clearance file for an industrial project that provides 5,000 local jobs, but you notice serious groundwater contamination risks in the EIA report. What will you do?",
    questionTextHi: "आपके वरिष्ठ अधिकारी आपको 5,000 स्थानीय रोजगार प्रदान करने वाली एक औद्योगिक परियोजना की पर्यावरण मंजूरी फाइल को स्वीकृत करने का निर्देश देते हैं, लेकिन आप EIA रिपोर्ट में भूजल प्रदूषण के गंभीर जोखिम पाते हैं। आप क्या करेंगे?",
    contextEn: "Classic administrative dilemma: economic development vs environmental sustainability and subordinate accountability.",
    contextHi: "प्रशासनिक दुविधा: आर्थिक विकास बनाम पर्यावरण संरक्षण एवं वरिष्ठ-कनिष्ठ उत्तरदायित्व।",
    sourceType: "SITUATIONAL",
    sourceAttribution: "Ethics Board Simulation",
    year: 2024,
    topic: "Ethics in Governance",
    tags: "Ethics, Environment, Administrative Discretion, Accountability",
    frameworkGuidance: "1. Deontological & Legal Duty: Subordinate cannot approve an illegal clearance that violates Environment Protection Act (1986).\n2. Constructive Administrative Action: Do not simply reject out of hand. Record the specific EIA groundwater hazards on file objectively.\n3. Collaborative Solution: Meet the project developers and technical committee to mandate zero liquid discharge (ZLD) plant and secondary filtration before issuing conditional clearance, thereby protecting both jobs and public health.",
    frameworkGuidanceHi: "1. विधिक कर्तव्य: पर्यावरण संरक्षण अधिनियम 1986 का अनुपालन अनिवार्य।\n2. वस्तुनिष्ठ अभिलेख: भूजल प्रदूषण के विशिष्ट जोखिमों को आधिकारिक फाइल पर दर्ज करना।\n3. रचनात्मक समाधान: शून्य तरल निर्वहन (ZLD) संयंत्र जैसी तकनीकी शर्तों के साथ ही सशर्त स्वीकृति पर विचार।",
  },
];

export const EXPANDED_MAP_FEATURES = [
  {
    name: "Kaziranga National Park",
    nameHi: "काजीरंगा राष्ट्रीय उद्यान",
    category: "NATIONAL_PARK",
    stateOrCountry: "Assam, India",
    latitude: 26.6638,
    longitude: 93.3547,
    keyFacts: "Home to two-thirds of the world's great one-horned rhinoceroses. Traversed by the Brahmaputra River and national highway NH-715. UNESCO World Heritage Site with high tiger density.",
    keyFactsHi: "विश्व के दो-तिहाई एक-सींग वाले गैंडों का आवास। ब्रह्मपुत्र नदी और राष्ट्रीय राजमार्ग द्वारा घिरा हुआ यूनेस्को विश्व धरोहर स्थल।",
    upscReference: "UPSC CSE Prelims 2015, 2019 & 2023",
  },
  {
    name: "Great Nicobar Biosphere Reserve",
    nameHi: "ग्रेट निकोबार बायोस्फीयर रिजर्व",
    category: "BIOSPHERE_RESERVE",
    stateOrCountry: "Andaman & Nicobar Islands, India",
    latitude: 7.0000,
    longitude: 93.8000,
    keyFacts: "Southernmost territory of India containing Galathea National Park and Campbell Bay National Park. Inhabited by the indigenous Shompen and Nicobarese tribes. Strategic site for the proposed International Container Transhipment Terminal (ICTT).",
    keyFactsHi: "भारत का दक्षिणतम बायोस्फीयर रिजर्व जिसमें गलाथिया एवं कैंपबेल बे राष्ट्रीय उद्यान शामिल हैं। शोम्पेन जनजाति का निवास स्थल।",
    upscReference: "UPSC CSE Prelims 2013, 2017 & 2022",
  },
  {
    name: "Strait of Hormuz",
    nameHi: "होर्मुज जलडमरूमध्य",
    category: "STRAIT",
    stateOrCountry: "Between Oman and Iran",
    latitude: 26.5667,
    longitude: 56.2500,
    keyFacts: "World's most critical oil transit chokepoint connecting Persian Gulf to the Gulf of Oman and Arabian Sea. Over 20% of global petroleum petroleum consumption passes through its shipping lanes daily.",
    keyFactsHi: "फारस की खाड़ी को ओमान की खाड़ी से जोड़ने वाला दुनिया का सबसे महत्वपूर्ण पेट्रोलियम चोकपॉइंट।",
    upscReference: "UPSC CSE Prelims 2018 & 2020",
  },
  {
    name: "Zojila Pass",
    nameHi: "ज़ोजिला दर्रा",
    category: "MOUNTAIN_PASS",
    stateOrCountry: "Ladakh / Jammu & Kashmir, India",
    latitude: 34.2833,
    longitude: 75.4667,
    keyFacts: "Strategic mountain pass in the Zanskar Range connecting Srinagar to Leh (NH-1). Asia's longest bi-directional tunnel (14.15 km Zojila Tunnel) is under construction to ensure all-weather connectivity.",
    keyFactsHi: "श्रीनगर को लेह से जोड़ने वाला ज़ांस्कर श्रेणी में स्थित रणनीतिक दर्रा। एशिया की सबसे लंबी द्वि-दिशात्मक सुरंग का निर्माण प्रगति पर।",
    upscReference: "UPSC CSE Prelims 2016 & 2021",
  },
  {
    name: "Pangong Tso",
    nameHi: "पैंगोंग त्सो",
    category: "RAMSAR_SITE",
    stateOrCountry: "Eastern Ladakh / Tibet",
    latitude: 33.7200,
    longitude: 78.7300,
    keyFacts: "World's highest endorheic saline lake situated at 4,225 m altitude. Spans across India and China (Line of Actual Control passes through it). Important breeding ground for migratory black-necked cranes.",
    keyFactsHi: "4,225 मीटर की ऊंचाई पर स्थित विश्व की सबसे ऊंची खारे पानी की एंडोर्फिक झील। वास्तविक नियंत्रण रेखा (LAC) इसके बीच से गुजरती है।",
    upscReference: "UPSC CSE Prelims 2020 & 2021",
  },
  {
    name: "Bab-el-Mandeb Strait",
    nameHi: "बाब-अल-मंदेब जलडमरूमध्य",
    category: "STRAIT",
    stateOrCountry: "Between Yemen, Djibouti and Eritrea",
    latitude: 12.5833,
    longitude: 43.3333,
    keyFacts: "The 'Gate of Tears' strategic maritime chokepoint connecting the Red Sea to the Gulf of Aden and the Indian Ocean. Critical gateway for European-Asian trade via the Suez Canal.",
    keyFactsHi: "लाल सागर को अदन की खाड़ी और हिंद महासागर से जोड़ने वाला रणनीतिक समुद्री मार्ग (गेट ऑफ टीयर्स)।",
    upscReference: "UPSC CSE Prelims 2019 & 2024",
  },
  {
    name: "Sundarbans Biosphere Reserve",
    nameHi: "सुंदरबन बायोस्फीयर रिजर्व",
    category: "RAMSAR_SITE",
    stateOrCountry: "West Bengal, India / Bangladesh",
    latitude: 21.9497,
    longitude: 88.9004,
    keyFacts: "World's largest contiguous mangrove delta formed by the confluence of Ganga, Brahmaputra and Meghna rivers. Ramsar Site and UNESCO World Heritage Site home to the Royal Bengal Tiger.",
    keyFactsHi: "गंगा, ब्रह्मपुत्र और मेघना नदियों द्वारा निर्मित विश्व का सबसे बड़ा मैंग्रोव डेल्टा। रॉयल बंगाल टाइगर का प्रमुख प्राकृतिक आवास।",
    upscReference: "UPSC CSE Prelims 2014 & 2020",
  },
  {
    name: "Nathu La Pass",
    nameHi: "नाथू ला दर्रा",
    category: "MOUNTAIN_PASS",
    stateOrCountry: "Sikkim, India / Tibet, China",
    latitude: 27.3865,
    longitude: 88.8317,
    keyFacts: "Historic Himalayan mountain pass on the Old Silk Route connecting Sikkim to Tibet's Chumbi Valley. One of four designated border personnel meeting points between Indian and Chinese armies.",
    keyFactsHi: "सिक्किम को तिब्बत की चुम्बी घाटी से जोड़ने वाला ऐतिहासिक सिल्क रूट का हिमालयी दर्रा।",
    upscReference: "UPSC CSE Prelims 2015 & 2018",
  },
];

async function main() {
  console.log("=========================================");
  console.log("🌱 SEEDING EXPANDED ASPIRANT RESOURCES");
  console.log("=========================================");

  // 1. Seed Videos
  console.log("Seeding Video Lessons...");
  for (const v of EXPANDED_VIDEOS) {
    const existing = await prisma.videoLesson.findFirst({
      where: { title: v.title },
    });
    if (!existing) {
      await prisma.videoLesson.create({ data: v });
      console.log(`  ✓ Created video: ${v.title}`);
    } else {
      await prisma.videoLesson.update({
        where: { id: existing.id },
        data: v,
      });
      console.log(`  ✓ Updated video: ${v.title}`);
    }
  }

  // 2. Seed Topper Copies
  console.log("Seeding Topper Copies...");
  for (const t of EXPANDED_TOPPERS) {
    const existing = await prisma.topperCopy.findFirst({
      where: {
        topperName: t.topperName,
        paperCode: t.paperCode,
        year: t.year,
      },
    });
    if (!existing) {
      await prisma.topperCopy.create({ data: t });
      console.log(`  ✓ Created topper copy: ${t.topperName} (${t.paperCode} ${t.year})`);
    } else {
      await prisma.topperCopy.update({
        where: { id: existing.id },
        data: t,
      });
      console.log(`  ✓ Updated topper copy: ${t.topperName} (${t.paperCode} ${t.year})`);
    }
  }

  // 3. Seed Interview Questions
  console.log("Seeding Interview Questions...");
  for (const iq of EXPANDED_INTERVIEW_QUESTIONS) {
    const existing = await prisma.interviewQuestion.findFirst({
      where: { questionTextEn: iq.questionTextEn },
    });
    if (!existing) {
      await prisma.interviewQuestion.create({ data: iq });
      console.log(`  ✓ Created interview prompt: ${iq.topic}`);
    } else {
      await prisma.interviewQuestion.update({
        where: { id: existing.id },
        data: iq,
      });
      console.log(`  ✓ Updated interview prompt: ${iq.topic}`);
    }
  }

  // 4. Seed Map Features
  console.log("Seeding Map Features...");
  for (const mf of EXPANDED_MAP_FEATURES) {
    const existing = await prisma.mapFeature.findFirst({
      where: { name: mf.name },
    });
    if (!existing) {
      await prisma.mapFeature.create({ data: mf });
      console.log(`  ✓ Created map feature: ${mf.name}`);
    } else {
      await prisma.mapFeature.update({
        where: { id: existing.id },
        data: mf,
      });
      console.log(`  ✓ Updated map feature: ${mf.name}`);
    }
  }

  const finalVideos = await prisma.videoLesson.count();
  const finalToppers = await prisma.topperCopy.count();
  const finalInterviews = await prisma.interviewQuestion.count();
  const finalMaps = await prisma.mapFeature.count();

  console.log("=========================================");
  console.log(`✅ COMPLETE! Total in database:`);
  console.log(`   - Video Lessons: ${finalVideos}`);
  console.log(`   - Topper Copies: ${finalToppers}`);
  console.log(`   - Interview Prompts: ${finalInterviews}`);
  console.log(`   - Map Features: ${finalMaps}`);
  console.log("=========================================");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error seeding resources:", e);
  process.exit(1);
});
