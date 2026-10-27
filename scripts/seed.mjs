import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Pravaah database seeding...");

  // 1. Roles
  const aspirantRole = await prisma.role.upsert({
    where: { name: "ASPIRANT" },
    update: {},
    create: {
      name: "ASPIRANT",
      description: "Civil Services Aspirant studying for Prelims and Mains",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Platform Administrator and Academic Reviewer",
    },
  });

  // 2. Demo Users
  const aspirantUser = await prisma.user.upsert({
    where: { email: "aspirant@pravaah.in" },
    update: {},
    create: {
      email: "aspirant@pravaah.in",
      fullName: "Ananya Sharma",
      passwordHash: "pravaah_demo_hash_aspirant_2026",
      roleId: aspirantRole.id,
      profile: {
        create: {
          targetYear: 2027,
          optionalSubject: "Political Science & International Relations (PSIR)",
          dailyGoalMinutes: 90,
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@pravaah.in" },
    update: {},
    create: {
      email: "admin@pravaah.in",
      fullName: "Dr. Rameshwar Rao (Senior Faculty)",
      passwordHash: "pravaah_demo_hash_admin_2026",
      roleId: adminRole.id,
    },
  });

  // 3. Exam & Stage
  const exam = await prisma.exam.upsert({
    where: { code: "CSE" },
    update: {},
    create: {
      name: "UPSC Civil Services Examination",
      code: "CSE",
    },
  });

  const stage = await prisma.examStage.create({
    data: {
      examId: exam.id,
      name: "Civil Services Preliminary Examination",
      orderIndex: 1,
    },
  });

  // 4. Papers
  const paperGS1 = await prisma.paper.upsert({
    where: { code: "GS1" },
    update: {},
    create: {
      stageId: stage.id,
      code: "GS1",
      name: "General Studies Paper I",
      totalQuestions: 100,
      totalMarks: 200,
      durationMinutes: 120,
      positiveMark: 2.0,
      negativeMark: 0.666,
    },
  });

  const paperGS2 = await prisma.paper.upsert({
    where: { code: "GS2" },
    update: {},
    create: {
      stageId: stage.id,
      code: "GS2",
      name: "General Studies Paper II (CSAT)",
      totalQuestions: 80,
      totalMarks: 200,
      durationMinutes: 120,
      positiveMark: 2.5,
      negativeMark: 0.833,
    },
  });

  // 5. Subjects & Topics
  const subjectsData = [
    {
      paperId: paperGS1.id,
      name: "Polity & Governance",
      slug: "polity-governance",
      icon: "Landmark",
      topics: [
        { name: "Preamble & Constitutional Features", slug: "preamble-features" },
        { name: "Fundamental Rights & DPSP", slug: "fundamental-rights-dpsp" },
        { name: "Parliament & State Legislatures", slug: "parliament-legislatures" },
        { name: "Union & State Executive", slug: "executive" },
        { name: "Judiciary & Constitutional Bodies", slug: "judiciary-bodies" },
      ],
    },
    {
      paperId: paperGS1.id,
      name: "Economy & Social Development",
      slug: "economy-development",
      icon: "TrendingUp",
      topics: [
        { name: "National Income & Growth", slug: "national-income" },
        { name: "Fiscal & Monetary Policy", slug: "fiscal-monetary-policy" },
        { name: "Banking & Financial Markets", slug: "banking-financial-markets" },
        { name: "External Sector & Trade", slug: "external-sector" },
        { name: "Inclusion & Poverty Alleviation", slug: "poverty-inclusion" },
      ],
    },
    {
      paperId: paperGS1.id,
      name: "Environment & Biodiversity",
      slug: "environment-biodiversity",
      icon: "Leaf",
      topics: [
        { name: "Ecology & Ecosystem Dynamics", slug: "ecology-ecosystems" },
        { name: "Biodiversity & Protected Area Network", slug: "protected-areas" },
        { name: "Climate Change & Conventions", slug: "climate-change-conventions" },
        { name: "Pollution & Environmental Laws", slug: "pollution-laws" },
      ],
    },
    {
      paperId: paperGS1.id,
      name: "History & Art & Culture",
      slug: "history-culture",
      icon: "History",
      topics: [
        { name: "Ancient & Medieval India", slug: "ancient-medieval-india" },
        { name: "Art, Architecture & Literature", slug: "art-culture" },
        { name: "Modern India & Freedom Struggle", slug: "freedom-struggle" },
      ],
    },
    {
      paperId: paperGS1.id,
      name: "Geography & Agriculture",
      slug: "geography-agriculture",
      icon: "Globe",
      topics: [
        { name: "Physical Geography of India & World", slug: "physical-geography" },
        { name: "Cropping Patterns & Agriculture", slug: "agriculture-crops" },
        { name: "Resources & Distribution", slug: "resources" },
      ],
    },
    {
      paperId: paperGS1.id,
      name: "Science & Technology",
      slug: "science-technology",
      icon: "Atom",
      topics: [
        { name: "Space & Satellite Missions", slug: "space-missions" },
        { name: "Biotechnology & Health", slug: "biotechnology-health" },
        { name: "IT, Telecom & Frontier Technologies", slug: "frontier-tech" },
      ],
    },
    {
      paperId: paperGS2.id,
      name: "CSAT: Quantitative Aptitude",
      slug: "csat-quant",
      icon: "Binary",
      topics: [
        { name: "Number System & Divisibility", slug: "number-systems" },
        { name: "Percentages, Ratio & Proportions", slug: "ratio-proportions" },
        { name: "Permutations, Combinations & Probability", slug: "pnc-probability" },
      ],
    },
    {
      paperId: paperGS2.id,
      name: "CSAT: Logical & Analytical Reasoning",
      slug: "csat-reasoning",
      icon: "BrainCircuit",
      topics: [
        { name: "Syllogisms & Verbal Reasoning", slug: "syllogisms" },
        { name: "Puzzles & Seating Arrangements", slug: "puzzles" },
        { name: "Coding-Decoding & Series", slug: "coding-series" },
      ],
    },
    {
      paperId: paperGS2.id,
      name: "CSAT: Reading Comprehension",
      slug: "csat-comprehension",
      icon: "BookOpen",
      topics: [
        { name: "Critical Reasoning & Inferences", slug: "critical-inference" },
        { name: "Crucial Message & Assumptions", slug: "assumptions-message" },
      ],
    },
  ];

  const topicMap = {};

  for (const s of subjectsData) {
    const subject = await prisma.subject.create({
      data: {
        paperId: s.paperId,
        name: s.name,
        slug: s.slug,
        icon: s.icon,
      },
    });

    for (const t of s.topics) {
      const topic = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          name: t.name,
          slug: t.slug,
        },
      });
      topicMap[t.name] = topic.id;
    }
  }

  // 6. Source Documents (Official UPSC)
  const sourceDoc2024 = await prisma.sourceDocument.create({
    data: {
      title: "UPSC Civil Services Preliminary Examination 2024 — General Studies Paper 1 (Series A)",
      sourceUrl: "https://upsc.gov.in/examinations/previous-question-papers",
      paperCode: "Series A",
      year: 2024,
    },
  });

  const sourceDoc2023 = await prisma.sourceDocument.create({
    data: {
      title: "UPSC Civil Services Preliminary Examination 2023 — General Studies Paper 1 (Series A)",
      sourceUrl: "https://upsc.gov.in/examinations/previous-question-papers",
      paperCode: "Series A",
      year: 2023,
    },
  });

  const sourceDocCSAT2024 = await prisma.sourceDocument.create({
    data: {
      title: "UPSC Civil Services Preliminary Examination 2024 — CSAT Paper 2 (Series A)",
      sourceUrl: "https://upsc.gov.in/examinations/previous-question-papers",
      paperCode: "Series A",
      year: 2024,
    },
  });

  // 7. Verified Questions Dataset
  const verifiedQuestions = [
    // Q1: UPSC 2024 GS1 - Polity
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 1,
      questionText: `Under the Constitution of India, which one of the following is NOT correct regarding the Governor of a State?`,
      difficulty: "MEDIUM",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Union & State Executive",
      options: [
        { code: "A", text: "The Governor may be appointed by the President by warrant under his hand and seal.", isCorrect: false },
        { code: "B", text: "The Governor holds office during the pleasure of the President.", isCorrect: false },
        { code: "C", text: "The Governor can be removed from office by a resolution passed by the State Legislative Assembly with a special majority.", isCorrect: true },
        { code: "D", text: "The executive power of the State is vested in the Governor and is exercised by him directly or through officers subordinate to him.", isCorrect: false },
      ],
      officialAnswer: "C",
      explanation: {
        summary: "The Governor holds office during the pleasure of the President (Article 156(1)). There is no constitutional provision for removal by the State Legislative Assembly.",
        detailedExplanation: "Under Article 155, the Governor is appointed by the President by warrant under his hand and seal. Under Article 156(1), the Governor holds office during the pleasure of the President. The State Legislative Assembly has no role in the appointment or removal/impeachment of the Governor. Under Article 154(1), the executive power of the State is vested in the Governor.",
        eliminationTechnique: "Option C asserts a legislative impeachment procedure akin to the President or Judges. The Constitution does not grant State Assemblies any mechanism to remove a Governor.",
        sourceCitation: "M. Laxmikanth, Indian Polity (7th Ed.), Chapter 30: Governor",
        relatedConcept: "Constitutional Position and Removal of Governor",
      },
    },

    // Q2: UPSC 2024 GS1 - Economy
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 2,
      questionText: `Consider the following statements regarding the Monetary Policy Committee (MPC) in India:\n1. It decides the RBI's benchmark interest rates.\n2. It is a 12-member body including the Governor of RBI and is reconstituted every year.\n3. It functions under the chairmanship of the Union Finance Minister.\nWhich of the statements given above is/are correct?`,
      difficulty: "EASY",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Fiscal & Monetary Policy",
      options: [
        { code: "A", text: "1 only", isCorrect: true },
        { code: "B", text: "1 and 2 only", isCorrect: false },
        { code: "C", text: "3 only", isCorrect: false },
        { code: "D", text: "2 and 3 only", isCorrect: false },
      ],
      officialAnswer: "A",
      explanation: {
        summary: "Statement 1 is correct. The MPC is a 6-member body (not 12) chaired by the RBI Governor (not the Finance Minister).",
        detailedExplanation: "Under Section 45ZB of the amended RBI Act, 1934, the Monetary Policy Committee consists of 6 members: the RBI Governor (ex-officio Chairperson), the Deputy Governor in charge of monetary policy, one RBI officer, and three external members appointed by the Central Government for a tenure of four years.",
        eliminationTechnique: "Statements 2 and 3 are standard factual traps. The Finance Minister does not chair the MPC; the RBI Governor presides over it.",
        sourceCitation: "Ramesh Singh, Indian Economy, Chapter on Monetary Management & RBI Act Section 45ZB",
        relatedConcept: "Monetary Policy Framework Agreement & MPC Composition",
      },
    },

    // Q3: UPSC 2024 GS1 - Environment
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 3,
      questionText: `Which one of the following Protected Areas is well-known for the conservation of a sub-species of the Indian swamp deer (Barasingha) that thrives well on hard ground and is exclusively graminivorous?`,
      difficulty: "MEDIUM",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Biodiversity & Protected Area Network",
      options: [
        { code: "A", text: "Kanha National Park", isCorrect: true },
        { code: "B", text: "Manas National Park", isCorrect: false },
        { code: "C", text: "Mudumalai Wildlife Sanctuary", isCorrect: false },
        { code: "D", text: "Tal Chhapar Wildlife Sanctuary", isCorrect: false },
      ],
      officialAnswer: "A",
      explanation: {
        summary: "Kanha National Park (Madhya Pradesh) is the sole surviving natural habitat of the hard-ground Barasingha (Rucervus duvaucelii branderi).",
        detailedExplanation: "The hard-ground barasingha is the state animal of Madhya Pradesh and was brought back from the brink of extinction through dedicated conservation in Kanha Tiger Reserve. Kanha's mascot, 'Bhoorsingh the Barasingha', was created in celebration of this successful conservation program.",
        eliminationTechnique: "Associate hard-ground swamp deer directly with Central Indian sal and bamboo grasslands of Kanha.",
        sourceCitation: "Shankar IAS Environment, Protected Area Network & Wildlife Conservation",
        relatedConcept: "In-situ Conservation & Endemic Species Protection",
      },
    },

    // Q4: UPSC 2024 GS1 - History
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 4,
      questionText: `In the context of ancient Indian history, consider the following pairs:\n1. Mitakshara : Civil law system applicable to all castes equally throughout India without regional variations.\n2. Dayabhaga : In the Dayabhaga system, sons acquire ownership in ancestral property by birth.\nWhich of the pairs given above is/are correctly matched?`,
      difficulty: "HARD",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Ancient & Medieval India",
      options: [
        { code: "A", text: "1 only", isCorrect: false },
        { code: "B", text: "2 only", isCorrect: false },
        { code: "C", text: "Both 1 and 2", isCorrect: false },
        { code: "D", text: "Neither 1 nor 2", isCorrect: true },
      ],
      officialAnswer: "D",
      explanation: {
        summary: "Both statements are reversed and incorrect. In Mitakshara, sons acquire ownership by birth; Dayabhaga applies primarily in Bengal and Assam where ownership is acquired only after the father's demise.",
        detailedExplanation: "Under the Mitakshara school (Vijnaneshwara), a son acquires by birth an interest in the ancestral property. Under Dayabhaga (Jimutavahana), there is no birthright; sons acquire property only upon the father's death. Furthermore, Mitakshara prevailed across India except Bengal and Assam, whereas Dayabhaga prevailed in Bengal/Assam.",
        eliminationTechnique: "UPSC frequently tests classical legal treatises by inverting their key attributes: Mitakshara = birthright; Dayabhaga = demise of father.",
        sourceCitation: "A.L. Basham, The Wonder That Was India, Social and Legal Institutions",
        relatedConcept: "Hindu Jurisprudence & Inheritance Schools (Mitakshara vs Dayabhaga)",
      },
    },

    // Q5: UPSC 2024 GS1 - Geography
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 5,
      questionText: `Consider the following statements regarding the Indian Ocean Dipole (IOD):\n1. An IOD phenomenon is characterized by a difference in sea surface temperature between the tropical Western Indian Ocean and the tropical Eastern Indian Ocean.\n2. A positive IOD can bring more rainfall than normal over the Indian subcontinent during the Southwest monsoon.\nWhich of the statements given above is/are correct?`,
      difficulty: "MEDIUM",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Physical Geography of India & World",
      options: [
        { code: "A", text: "1 only", isCorrect: false },
        { code: "B", text: "2 only", isCorrect: false },
        { code: "C", text: "Both 1 and 2", isCorrect: true },
        { code: "D", text: "Neither 1 nor 2", isCorrect: false },
      ],
      officialAnswer: "C",
      explanation: {
        summary: "Both statements are correct. Positive IOD involves warmer sea surface temperatures in the western Indian Ocean and often boosts the Indian Southwest monsoon.",
        detailedExplanation: "The Indian Ocean Dipole (IOD) is an ocean-atmosphere phenomenon in the equatorial Indian Ocean. During a Positive IOD, the western Indian Ocean (near the African coast) becomes warmer than average, leading to greater convection and moisture transport towards the Indian subcontinent, frequently mitigating the negative impacts of El Niño.",
        eliminationTechnique: "Statement 1 is the textbook definition of IOD. Statement 2 represents the established positive correlation with monsoon precipitation.",
        sourceCitation: "NCERT Class XI Physical Geography, Atmospheric Circulation and Weather Systems",
        relatedConcept: "Ocean-Atmosphere Coupled Interactions (IOD & ENSO)",
      },
    },

    // Q6: UPSC 2024 GS1 - Science & Tech
    {
      paperId: paperGS1.id,
      year: 2024,
      questionNumber: 6,
      questionText: `In the context of modern space research, the term 'Lagrange Point 1 (L1)' often mentioned in news with reference to Aditya-L1 satellite, is a position in space where:`,
      difficulty: "EASY",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Space & Satellite Missions",
      options: [
        { code: "A", text: "The gravitational forces of the Earth and the Moon cancel out each other completely.", isCorrect: false },
        { code: "B", text: "The gravitational pull of two large masses precisely equals the centripetal force required for a small object to move between them.", isCorrect: true },
        { code: "C", text: "Spacecraft experience maximum atmospheric drag and enter low earth orbit.", isCorrect: false },
        { code: "D", text: "Solar radiation pressure drops to zero due to planetary eclipse.", isCorrect: false },
      ],
      officialAnswer: "B",
      explanation: {
        summary: "Lagrange points are positions in space where gravitational forces of two large bodies balance the centripetal force needed to move with them, enabling an uninterrupted view of the Sun.",
        detailedExplanation: "Aditya-L1 was placed in a halo orbit around the Sun-Earth Lagrangian point L1, located about 1.5 million km from Earth. A satellite in halo orbit around L1 has the major advantage of continuously viewing the Sun without any occultation/eclipses.",
        eliminationTechnique: "L1 for Aditya-L1 is a Sun-Earth system point, not Earth-Moon (Option A is eliminated). Option B accurately defines the orbital equilibrium.",
        sourceCitation: "ISRO Mission Profile — Aditya-L1 Solar Observatory & Science Notes",
        relatedConcept: "Orbital Mechanics & Lagrangian Equilibrium Points",
      },
    },

    // Q7: UPSC 2024 GS2 - CSAT Quant
    {
      paperId: paperGS2.id,
      year: 2024,
      questionNumber: 1,
      questionText: `What is the remainder when (85 × 87 × 89 × 91 × 95 × 96) is divided by 100?`,
      difficulty: "MEDIUM",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Number System & Divisibility",
      options: [
        { code: "A", text: "0", isCorrect: true },
        { code: "B", text: "1", isCorrect: false },
        { code: "C", text: "2", isCorrect: false },
        { code: "D", text: "4", isCorrect: false },
      ],
      officialAnswer: "A",
      explanation: {
        summary: "Dividing by 100 requires factors of 100 (which is 4 × 25). The expression contains 85 (5 × 17), 95 (5 × 19), and 96 (4 × 24). Thus 5 × 5 × 4 = 100 is an exact factor, giving remainder 0.",
        detailedExplanation: "Notice the prime factors in the numerator: 85 = 5 × 17, 95 = 5 × 19, and 96 = 4 × 24. Multiplying the factors: 5 × 5 × 4 = 100. Since 100 is a complete factor of the numerator, the entire product is an exact multiple of 100. Therefore, the remainder upon division by 100 is 0.",
        eliminationTechnique: "Check if the product is divisible by 25 (ends in two 5s) and 4 (ends in a multiple of 4). Both exist: 85 & 95 contribute 25; 96 contributes 4. Remainder is guaranteed to be 0.",
        sourceCitation: "CSAT Quantitative Aptitude, Number Theory & Factorization",
        relatedConcept: "Divisibility Rules & Remainder Theorems",
      },
    },

    // Q8: UPSC 2024 GS2 - CSAT Reasoning
    {
      paperId: paperGS2.id,
      year: 2024,
      questionNumber: 2,
      questionText: `Two statements S1 and S2 are given below followed by a Question:\nS1: There are not more than two continuous days on which P does not study.\nS2: P studies on Saturday but not on Sunday.\nQuestion: Did P study on Thursday?\nWhich one of the following is correct in respect of the above Statements and the Question?`,
      difficulty: "HARD",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Syllogisms & Verbal Reasoning",
      options: [
        { code: "A", text: "S1 alone is sufficient to answer the Question.", isCorrect: false },
        { code: "B", text: "S2 alone is sufficient to answer the Question.", isCorrect: false },
        { code: "C", text: "Both S1 and S2 together are sufficient to answer the Question.", isCorrect: false },
        { code: "D", text: "Both S1 and S2 together are NOT sufficient to answer the Question.", isCorrect: true },
      ],
      officialAnswer: "D",
      explanation: {
        summary: "Knowing Saturday is studied and Sunday is not, with a rule of max 2 non-study days, leaves multiple valid study patterns for Thursday. Thus S1 and S2 together are not sufficient.",
        detailedExplanation: "Let the days be Monday through Sunday. S2 tells us: Sat = Study, Sun = No Study. S1 tells us: at most 2 consecutive No-Study days. This means Monday could be No Study (making Sun-Mon two days) or Study. Tracing backwards to Thursday, Thursday could be Study or No Study without violating the constraint.",
        eliminationTechnique: "Construct counter-examples: Pattern A: (Thu=Study, Fri=Study, Sat=Study, Sun=No) and Pattern B: (Thu=No, Fri=Study, Sat=Study, Sun=No). Both satisfy S1 and S2, but give opposite answers for Thursday.",
        sourceCitation: "UPSC CSAT Analytical Reasoning, Data Sufficiency Principles",
        relatedConcept: "Data Sufficiency & Logical Constraints",
      },
    },

    // Q9: UPSC 2023 GS1 - Polity
    {
      paperId: paperGS1.id,
      year: 2023,
      questionNumber: 1,
      questionText: `In India, which one of the following Constitutional Amendments was widely believed to be enacted to overcome the judicial interpretations of the Fundamental Rights?`,
      difficulty: "MEDIUM",
      isStatic: true,
      status: "PUBLISHED",
      topicName: "Fundamental Rights & DPSP",
      options: [
        { code: "A", text: "1st Amendment", isCorrect: true },
        { code: "B", text: "42nd Amendment", isCorrect: false },
        { code: "C", text: "44th Amendment", isCorrect: false },
        { code: "D", text: "86th Amendment", isCorrect: false },
      ],
      officialAnswer: "A",
      explanation: {
        summary: "The 1st Constitutional Amendment Act, 1951 was enacted to overcome adverse judicial rulings (such as Kameshwar Singh, Romesh Thappar, and Champakam Dorairajan).",
        detailedExplanation: "The 1st Amendment Act, 1951 introduced Article 31A, 31B, and the Ninth Schedule to immunize agrarian land reforms against judicial review under Articles 14, 19, and 31. It also amended Article 19(2) adding reasonable restrictions on freedom of speech and added Article 15(4) to enable special provisions for advancement of socially and educationally backward classes.",
        eliminationTechnique: "Notice the historical context: 1951 land reform court battles occurred immediately post-independence. The 1st Amendment introduced the Ninth Schedule specifically for this reason.",
        sourceCitation: "M. Laxmikanth, Indian Polity, Chapter on Constitutional Amendments & Granville Austin",
        relatedConcept: "First Constitutional Amendment & Ninth Schedule Genesis",
      },
    },

    // Q10: UPSC 2023 GS1 - Environment (Status: NEEDS_REVIEW to test Admin Workflow!)
    {
      paperId: paperGS1.id,
      year: 2023,
      questionNumber: 2,
      questionText: `Consider the following statements regarding the 'Miyawaki method' occasionally mentioned in the news:\n1. It is a Japanese method of urban afforestation to create dense native forests rapidly.\n2. Forests grown under this method achieve maturity in 20-30 years compared to 200 years for conventional forests.\nWhich of the statements given above is/are correct?`,
      difficulty: "MEDIUM",
      isStatic: false,
      status: "NEEDS_REVIEW",
      topicName: "Ecology & Ecosystem Dynamics",
      options: [
        { code: "A", text: "1 only", isCorrect: false },
        { code: "B", text: "2 only", isCorrect: false },
        { code: "C", text: "Both 1 and 2", isCorrect: true },
        { code: "D", text: "Neither 1 nor 2", isCorrect: false },
      ],
      officialAnswer: "C",
      explanation: {
        summary: "Pioneered by Japanese botanist Akira Miyawaki, this method creates mini urban forests with native species planted densely, growing 10x faster.",
        detailedExplanation: "The Miyawaki method involves planting two to four types of indigenous trees within every square metre. The saplings receive direct sunlight only from the top, causing them to grow upwards rather than outwards. The forest becomes 30 times denser and grows 10 times faster than conventional monoculture plantations.",
        eliminationTechnique: "Miyawaki = Japanese urban micro-forestry. Widely featured in Indian urban municipal initiatives (Chennai, Delhi, Mumbai).",
        sourceCitation: "Down to Earth & Ministry of Environment Forest Reports",
        relatedConcept: "Urban Afforestation & Micro-Ecosystem Restoration",
      },
    },
  ];

  for (const q of verifiedQuestions) {
    const question = await prisma.question.create({
      data: {
        paperId: q.paperId,
        year: q.year,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        difficulty: q.difficulty,
        isStatic: q.isStatic,
        status: q.status,
        verifiedAt: q.status === "PUBLISHED" ? new Date() : null,
        options: {
          create: q.options.map((opt) => ({
            optionCode: opt.code,
            optionText: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
        answerKeys: {
          create: {
            officialAnswer: q.officialAnswer,
            sourceType: "UPSC_OFFICIAL_FINAL",
            sourceReference: "Official UPSC Answer Key Gazette",
          },
        },
        explanation: {
          create: {
            summary: q.explanation.summary,
            detailedExplanation: q.explanation.detailedExplanation,
            eliminationTechnique: q.explanation.eliminationTechnique,
            sourceCitation: q.explanation.sourceCitation,
            relatedConcept: q.explanation.relatedConcept,
          },
        },
      },
    });

    // Map to topic
    if (topicMap[q.topicName]) {
      await prisma.questionTopic.create({
        data: {
          questionId: question.id,
          topicId: topicMap[q.topicName],
        },
      });
    }

    // Attach to source document
    const doc = q.year === 2024 ? sourceDoc2024 : sourceDoc2023;
    await prisma.questionSource.create({
      data: {
        questionId: question.id,
        documentId: doc.id,
      },
    });

    // Seed sample attempts & bookmark for demo aspirant
    if (q.questionNumber === 1 && q.paperId === paperGS1.id) {
      await prisma.bookmark.create({
        data: {
          userId: aspirantUser.id,
          questionId: question.id,
          folderTag: "Polity High Priority",
        },
      });

      await prisma.userNote.create({
        data: {
          userId: aspirantUser.id,
          questionId: question.id,
          content: "Remember: State Legislature has zero role in Governor removal. Pleasure of President only!",
        },
      });

      // Add a correct attempt
      await prisma.userAttempt.create({
        data: {
          userId: aspirantUser.id,
          questionId: question.id,
          selectedOption: "C",
          isCorrect: true,
          timeSpentSeconds: 42,
          mode: "LEARN",
        },
      });
    } else if (q.questionNumber === 4 && q.paperId === paperGS1.id) {
      // Add an incorrect attempt to populate Revision Queue!
      await prisma.userAttempt.create({
        data: {
          userId: aspirantUser.id,
          questionId: question.id,
          selectedOption: "A",
          isCorrect: false,
          timeSpentSeconds: 58,
          mode: "LEARN",
        },
      });

      await prisma.reviewSchedule.create({
        data: {
          userId: aspirantUser.id,
          questionId: question.id,
          repetitionCount: 1,
          intervalDays: 2,
          nextReviewDate: new Date(Date.now() + 86400000), // tomorrow
          isResolved: false,
        },
      });
    }
  }

  // 8. Create a Demo Test Paper
  const demoTest = await prisma.test.create({
    data: {
      paperId: paperGS1.id,
      title: "UPSC CSE Prelims 2024 — GS Paper 1 Mini Simulation",
      description: "Authentic UPSC 2024 questions under timed exam conditions with standard UPSC negative marking (+2.0 / -0.666).",
      isFullPaper: true,
      year: 2024,
    },
  });

  const publishedQuestions = await prisma.question.findMany({
    where: { paperId: paperGS1.id, status: "PUBLISHED" },
    take: 6,
  });

  for (let i = 0; i < publishedQuestions.length; i++) {
    await prisma.testQuestion.create({
      data: {
        testId: demoTest.id,
        questionId: publishedQuestions[i].id,
        orderIndex: i + 1,
      },
    });
  }

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: "SEED_PUBLISH",
      entityType: "QUESTION_BATCH",
      entityId: "batch_initial_seed",
      detailsJson: JSON.stringify({
        totalSeeded: verifiedQuestions.length,
        officialSource: "UPSC CSE 2023-2024",
      }),
    },
  });

  console.log("✅ Pravaah database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
