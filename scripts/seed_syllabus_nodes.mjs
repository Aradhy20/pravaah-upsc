import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYLLABUS_NODES = [
  // ==========================================
  // PRELIMS PAPER 1 (GENERAL STUDIES)
  // ==========================================
  {
    code: 'PRE-POL-01',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Constitutional Framework & Historical Underpinnings',
    description: 'Regulating Act 1773 to Independence Act 1947, Constituent Assembly, Preamble, Salient Features, Basic Structure doctrine.',
  },
  {
    code: 'PRE-POL-02',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Fundamental Rights, DPSP & Fundamental Duties',
    description: 'Articles 12-35 (Writs, Reasonable Restrictions, Exceptions), Directive Principles (Part IV), Fundamental Duties (Part IVA, 42nd & 86th Amendments).',
  },
  {
    code: 'PRE-POL-03',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Union & State Executive',
    description: 'President (Election, Powers, Pardoning, Veto, Ordinance Art 123), Vice-President, Prime Minister, Council of Ministers, Governor (Art 163, 213, Discretionary powers).',
  },
  {
    code: 'PRE-POL-04',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Union & State Legislature (Parliament & Assemblies)',
    description: 'Lok Sabha, Rajya Sabha, Parliamentary Committees, Budgetary procedure, Motions (No-Confidence, Adjournment), Privileges, Anti-Defection Law (10th Schedule).',
  },
  {
    code: 'PRE-POL-05',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Judiciary (Supreme Court, High Courts, Subordinate Courts)',
    description: 'Jurisdiction (Original, Appellate, Advisory Art 143), Judicial Review, Collegium System, Judicial Activism vs Overreach, Contempt of Court, Fast Track Courts.',
  },
  {
    code: 'PRE-POL-06',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Constitutional & Non-Constitutional Bodies',
    description: 'Election Commission (Art 324), UPSC (Art 315-323), CAG (Art 148-151), Finance Commission (Art 280), GST Council (Art 279A), NITI Aayog, NHRC, CVC, CBI, Lokpal.',
  },
  {
    code: 'PRE-POL-07',
    paperCode: 'GS1',
    subjectName: 'Indian Polity & Governance',
    title: 'Local Self-Government (Panchayats & Municipalities)',
    description: '73rd Amendment (11th Schedule, 29 subjects, PESA Act 1996), 74th Amendment (12th Schedule, 18 subjects), State Finance Commission, District Planning Committees.',
  },

  // ECONOMY
  {
    code: 'PRE-ECO-01',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'National Income Accounting & Economic Growth',
    description: 'GDP, GNP, NNP, Real vs Nominal GDP, GVA, Purchasing Power Parity (PPP), Green GDP, Inclusive Growth indicators.',
  },
  {
    code: 'PRE-ECO-02',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'Money, Banking & Monetary Policy',
    description: 'RBI functions, Monetary Policy Committee (MPC), Repo, Reverse Repo, SDF, CRR, SLR, Inflation Targeting (4% +/- 2%), NBFCs, Bad Banks (NARCL), Digital Rupee (CBDC).',
  },
  {
    code: 'PRE-ECO-03',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'Fiscal Policy & Public Finance',
    description: 'Union Budget components (Revenue vs Capital Receipts/Expenditure), Fiscal Deficit, Primary Deficit, FRBM Act, Debt-to-GDP ratio, GST architecture.',
  },
  {
    code: 'PRE-ECO-04',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'External Sector & Balance of Payments',
    description: 'Current Account Deficit (CAD), Capital Account Convertibility, Foreign Exchange Reserves, FDI vs FPI, NEER vs REER, Devaluation vs Depreciation, WTO agreements.',
  },
  {
    code: 'PRE-ECO-05',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'Inflation, Poverty & Employment',
    description: 'CPI vs WPI, Headline vs Core inflation, Cost-push vs Demand-pull, Multidimensional Poverty Index (NITI Aayog / UNDP), Periodic Labour Force Survey (PLFS).',
  },
  {
    code: 'PRE-ECO-06',
    paperCode: 'GS1',
    subjectName: 'Indian Economy',
    title: 'Agriculture & Food Processing',
    description: 'Minimum Support Price (MSP, CACP formula A2+FL vs C2), PM-KISAN, PMFBY, Agri-infrastructure, Buffer stocks, PDS reforms, Direct Seeded Rice, Millets (Shree Anna).',
  },

  // GEOGRAPHY
  {
    code: 'PRE-GEO-01',
    paperCode: 'GS1',
    subjectName: 'Geography',
    title: 'Geomorphology & Earth Interior',
    description: 'Plate Tectonics, Continental Drift, Earthquake waves (P & S waves), Shadow zones, Volcanism, Landforms (Fluvial, Aeolian, Glacial, Karst).',
  },
  {
    code: 'PRE-GEO-02',
    paperCode: 'GS1',
    subjectName: 'Geography',
    title: 'Climatology & Indian Monsoon',
    description: 'Atmospheric layers, Heat budget, Planetary winds, Jet streams, El Nino, La Nina, Indian Ocean Dipole (IOD), Western Disturbances, Tropical vs Temperate Cyclones.',
  },
  {
    code: 'PRE-GEO-03',
    paperCode: 'GS1',
    subjectName: 'Geography',
    title: 'Oceanography & Marine Resources',
    description: 'Ocean floor relief, Ocean currents (Warm vs Cold), Salinity distribution, Tides, Marine pollution, Coral reefs bleaching, Exclusive Economic Zone (EEZ).',
  },
  {
    code: 'PRE-GEO-04',
    paperCode: 'GS1',
    subjectName: 'Geography',
    title: 'Physical Geography of India',
    description: 'Himalayan mountain system (Passes, Valleys, Glaciers), Indo-Gangetic Plains, Peninsular Plateau, Coastal plains, Island territories, Soil types of India (ICAR 8 groups).',
  },
  {
    code: 'PRE-GEO-05',
    paperCode: 'GS1',
    subjectName: 'Geography',
    title: 'Indian River Systems & Water Resources',
    description: 'Himalayan drainage (Indus, Ganga, Brahmaputra systems) vs Peninsular drainage (Godavari, Krishna, Cauvery, Narmada, Tapti), Interlinking of rivers, Groundwater depletion.',
  },

  // ENVIRONMENT & ECOLOGY
  {
    code: 'PRE-ENV-01',
    paperCode: 'GS1',
    subjectName: 'Environment & Ecology',
    title: 'Ecology Fundamentals & Ecosystems',
    description: 'Levels of organization, Biomes, Food chains/webs, Ecological Pyramids (Energy, Biomass, Numbers), Bioaccumulation vs Biomagnification, Ecotone & Edge Effect.',
  },
  {
    code: 'PRE-ENV-02',
    paperCode: 'GS1',
    subjectName: 'Environment & Ecology',
    title: 'Biodiversity & Conservation (Protected Areas)',
    description: 'In-situ vs Ex-situ, National Parks, Wildlife Sanctuaries, Biosphere Reserves (MAB program), Tiger Reserves (NTCA, Project Tiger), Elephant Reserves, Ramsar Wetlands.',
  },
  {
    code: 'PRE-ENV-03',
    paperCode: 'GS1',
    subjectName: 'Environment & Ecology',
    title: 'Climate Change & Global Warming',
    description: 'Greenhouse gases (GWP, Radiative forcing), Ocean acidification, IPCC Assessment Reports (AR6), UNFCCC COP summits (Kyoto, Paris Agreement, COP28 UAE Consensus).',
  },
  {
    code: 'PRE-ENV-04',
    paperCode: 'GS1',
    subjectName: 'Environment & Ecology',
    title: 'Environmental Conventions & Legislation',
    description: 'Wildlife Protection Act 1972 (2022 Amendment, CITES schedules), Environment Protection Act 1986, Forest Conservation Act 1980, Biological Diversity Act 2002, Basel, Rotterdam, Stockholm, Minamata.',
  },

  // HISTORY & CULTURE
  {
    code: 'PRE-HIS-01',
    paperCode: 'GS1',
    subjectName: 'History & Culture',
    title: 'Ancient India & Indus Valley Civilization',
    description: 'Harappan sites (Dholavira, Lothal, Rakhigarhi), Town planning, Vedic Age (Rigvedic vs Later Vedic), Buddhism & Jainism (Councils, Sects, Philosophy), Mauryan Empire, Ashokan Edicts.',
  },
  {
    code: 'PRE-HIS-02',
    paperCode: 'GS1',
    subjectName: 'History & Culture',
    title: 'Medieval India & Dynasties',
    description: 'Delhi Sultanate (Iltutmish, Alauddin Khalji, Muhammad bin Tughlaq), Mughal Administration (Mansabdari, Zabt system), Vijayanagara Empire (Krishnadevaraya), Bhakti & Sufi movements.',
  },
  {
    code: 'PRE-HIS-03',
    paperCode: 'GS1',
    subjectName: 'History & Culture',
    title: 'Modern Indian History & Freedom Struggle',
    description: 'British Expansion (Plassey, Buxar, Subsidiary Alliance, Doctrine of Lapse), Revolt of 1857, Socio-Religious Reform Movements, INC Foundation (1885), Partition of Bengal & Swadeshi (1905).',
  },
  {
    code: 'PRE-HIS-04',
    paperCode: 'GS1',
    subjectName: 'History & Culture',
    title: 'Gandhian Era & National Movement (1915–1947)',
    description: 'Champaran, Kheda, Ahmedabad, Non-Cooperation Movement, Civil Disobedience (Salt Satyagraha), Quit India Movement (1942), INA & Subhas Chandra Bose, Cabinet Mission 1946, Mountbatten Plan.',
  },
  {
    code: 'PRE-HIS-05',
    paperCode: 'GS1',
    subjectName: 'History & Culture',
    title: 'Indian Art, Architecture & Literature',
    description: 'Temple Architecture (Nagara, Dravida, Vesara), Cave Architecture (Ajanta, Ellora, Bhimbetka), Classical Dances (8 Sangeet Natak Akademi forms), Folk Dances, Indian Music (Hindustani vs Carnatic).',
  },

  // SCIENCE & TECHNOLOGY
  {
    code: 'PRE-SCI-01',
    paperCode: 'GS1',
    subjectName: 'Science & Technology',
    title: 'Space Technology & Astronomical Missions',
    description: 'ISRO launch vehicles (PSLV, GSLV, LVM3, SSLV), Chandrayaan-3, Aditya-L1, Gaganyaan, NISAR, James Webb Space Telescope, Gravitational Waves (LIGO-India).',
  },
  {
    code: 'PRE-SCI-02',
    paperCode: 'GS1',
    subjectName: 'Science & Technology',
    title: 'Biotechnology, Genetics & Health',
    description: 'CRISPR-Cas9 gene editing, mRNA vaccines, CAR-T cell therapy, Stem cells, Rare diseases, Antimicrobial Resistance (AMR), One Health concept, Sickle Cell Anaemia elimination.',
  },
  {
    code: 'PRE-SCI-03',
    paperCode: 'GS1',
    subjectName: 'Science & Technology',
    title: 'Defense Technology & Nuclear Program',
    description: 'Integrated Guided Missile Development Programme (Prithvi, Agni series, BrahMos, Akash), Aircraft Carriers (INS Vikrant), Ballistic vs Cruise missiles, Nuclear triad, S-400 system.',
  },
  {
    code: 'PRE-SCI-04',
    paperCode: 'GS1',
    subjectName: 'Science & Technology',
    title: 'Information Technology, AI & Emerging Tech',
    description: 'Artificial Intelligence, Large Language Models, Quantum Computing (National Quantum Mission), Semiconductor manufacturing (India Semiconductor Mission), Web3, 5G/6G.',
  },

  // ==========================================
  // PRELIMS PAPER 2 (CSAT)
  // ==========================================
  {
    code: 'CSAT-RC-01',
    paperCode: 'CSAT',
    subjectName: 'CSAT Paper 2',
    title: 'Reading Comprehension & Critical Reasoning',
    description: 'Identifying Central Idea, Author Assumptions, Inferences, Logical Corollaries, Strengths/Weaknesses of arguments.',
  },
  {
    code: 'CSAT-QA-02',
    paperCode: 'CSAT',
    subjectName: 'CSAT Paper 2',
    title: 'Quantitative Aptitude & Number Systems',
    description: 'Number properties, Remainder theorem, Divisibility rules, Permutations & Combinations, Probability, Percentages, Profit & Loss, Time & Work, Speed Time Distance.',
  },
  {
    code: 'CSAT-LR-03',
    paperCode: 'CSAT',
    subjectName: 'CSAT Paper 2',
    title: 'Logical & Analytical Reasoning',
    description: 'Syllogisms, Seating arrangement, Blood relations, Direction sense, Puzzles, Coding-decoding, Data Sufficiency, Series completion.',
  },

  // ==========================================
  // MAINS GENERAL STUDIES PAPERS (GS1 - GS4)
  // ==========================================
  {
    code: 'MAINS-GS1-01',
    paperCode: 'MAINS-GS1',
    subjectName: 'Mains GS Paper 1',
    title: 'Indian Culture, Architecture & Literature from Ancient to Modern Times',
    description: 'Salient aspects of art forms, literature and architecture from ancient to modern times, regional styles, patronage, revival.',
  },
  {
    code: 'MAINS-GS1-02',
    paperCode: 'MAINS-GS1',
    subjectName: 'Mains GS Paper 1',
    title: 'Modern Indian History & Post-Independence Consolidation',
    description: 'Significant events, personalities, issues during freedom struggle; reorganization of states, tribal integration, linguistic disputes.',
  },
  {
    code: 'MAINS-GS1-03',
    paperCode: 'MAINS-GS1',
    subjectName: 'Mains GS Paper 1',
    title: 'Indian Society: Diversity, Women, Globalization & Urbanization',
    description: 'Role of women and women’s organizations, population and associated issues, poverty, developmental issues, urbanization problems, effects of globalization, secularism, regionalism, communalism.',
  },
  {
    code: 'MAINS-GS1-04',
    paperCode: 'MAINS-GS1',
    subjectName: 'Mains GS Paper 1',
    title: 'World Physical Geography & Resource Distribution',
    description: 'Distribution of key natural resources across the world including South Asia, factors responsible for the location of primary, secondary, and tertiary sector industries.',
  },

  {
    code: 'MAINS-GS2-01',
    paperCode: 'MAINS-GS2',
    subjectName: 'Mains GS Paper 2',
    title: 'Indian Constitution: Comparison, Federalism & Separation of Powers',
    description: 'Comparison of the Indian constitutional scheme with other countries; separation of powers between organs, dispute redressal mechanisms, federal structure challenges.',
  },
  {
    code: 'MAINS-GS2-02',
    paperCode: 'MAINS-GS2',
    subjectName: 'Mains GS Paper 2',
    title: 'Governance, Transparency, Citizen Charters & E-Governance',
    description: 'Aspects of governance, transparency and accountability, e-governance applications, models, successes, limitations, citizen charters, role of civil services in a democracy.',
  },
  {
    code: 'MAINS-GS2-03',
    paperCode: 'MAINS-GS2',
    subjectName: 'Mains GS Paper 2',
    title: 'Social Justice, Welfare Schemes & Health/Education',
    description: 'Welfare schemes for vulnerable sections by the Centre and States, performance of mechanisms, laws, institutions; issues relating to development of Health, Education, Human Resources.',
  },
  {
    code: 'MAINS-GS2-04',
    paperCode: 'MAINS-GS2',
    subjectName: 'Mains GS Paper 2',
    title: 'International Relations: Bilateral, Regional & Global Groupings',
    description: 'India and its neighbourhood-relations, bilateral, regional and global groupings and agreements involving India and/or affecting India’s interests, effect of policies of developed and developing countries.',
  },

  {
    code: 'MAINS-GS3-01',
    paperCode: 'MAINS-GS3',
    subjectName: 'Mains GS Paper 3',
    title: 'Indian Economy & Issues Relating to Planning, Mobilization & Growth',
    description: 'Issues relating to planning, mobilization of resources, growth, development and employment, inclusive growth and issues arising from it, government budgeting.',
  },
  {
    code: 'MAINS-GS3-02',
    paperCode: 'MAINS-GS3',
    subjectName: 'Mains GS Paper 3',
    title: 'Agriculture: Cropping Patterns, Irrigation, PDS, E-Technology & Subsidies',
    description: 'Major crops cropping patterns in various parts of the country, different types of irrigation, storage, transport and marketing of agricultural produce, direct and indirect farm subsidies, food security.',
  },
  {
    code: 'MAINS-GS3-03',
    paperCode: 'MAINS-GS3',
    subjectName: 'Mains GS Paper 3',
    title: 'Science & Technology: Indigenization & Intellectual Property Rights',
    description: 'Achievements of Indians in science & technology; indigenization of technology, developments in IT, Space, Computers, Robotics, Nanotechnology, Bio-technology, IPR issues.',
  },
  {
    code: 'MAINS-GS3-04',
    paperCode: 'MAINS-GS3',
    subjectName: 'Mains GS Paper 3',
    title: 'Disaster Management, Environmental Degradation & Climate Change',
    description: 'Disaster and disaster management, environmental impact assessment (EIA), conservation, environmental pollution and degradation.',
  },
  {
    code: 'MAINS-GS3-05',
    paperCode: 'MAINS-GS3',
    subjectName: 'Mains GS Paper 3',
    title: 'Internal Security Challenges: Terrorism, Extremism, Cyber Security & Borders',
    description: 'Linkages between development and spread of extremism, role of external state and non-state actors in creating challenges to internal security, money-laundering, security challenges in border areas.',
  },

  {
    code: 'MAINS-GS4-01',
    paperCode: 'MAINS-GS4',
    subjectName: 'Mains GS Paper 4',
    title: 'Ethics and Human Interface: Essence, Determinants & Consequences',
    description: 'Essence, determinants and consequences of Ethics in human actions; dimensions of ethics; ethics in private and public relationships; human values – lessons from the lives of great leaders.',
  },
  {
    code: 'MAINS-GS4-02',
    paperCode: 'MAINS-GS4',
    subjectName: 'Mains GS Paper 4',
    title: 'Attitude, Emotional Intelligence & Moral Thinkers',
    description: 'Content, structure, function of attitude; its influence and relation with thought and behaviour; moral and political attitudes; emotional intelligence concepts and application; contributions of moral thinkers.',
  },
  {
    code: 'MAINS-GS4-03',
    paperCode: 'MAINS-GS4',
    subjectName: 'Mains GS Paper 4',
    title: 'Public/Civil Service Values and Ethics in Public Administration',
    description: 'Status and problems; ethical concerns and dilemmas in government and private institutions; laws, rules, regulations and conscience as sources of ethical guidance; accountability and ethical governance.',
  },
  {
    code: 'MAINS-GS4-04',
    paperCode: 'MAINS-GS4',
    subjectName: 'Mains GS Paper 4',
    title: 'Probity in Governance & Ethics Case Studies Methodology',
    description: 'Concept of public service; philosophical basis of governance and probity; information sharing and transparency in government, Right to Information, Codes of Ethics, Citizen’s Charters; Case Studies on above issues.',
  },

  {
    code: 'MAINS-ESSAY-01',
    paperCode: 'ESSAY',
    subjectName: 'Essay Paper',
    title: 'Philosophical & Abstract Themes (Section A & B)',
    description: 'Multi-dimensional thematic brainstorming, epistemological perspectives, ethical dilemmas, balance of arguments, quotes, and synthesis.',
  },
  {
    code: 'MAINS-ESSAY-02',
    paperCode: 'ESSAY',
    subjectName: 'Essay Paper',
    title: 'Socio-Economic, Technology & Governance Themes',
    description: 'Structured essays using the PESTLE framework (Political, Economic, Social, Technological, Legal, Environmental, Ethical), national priorities, and visionary conclusions.',
  },
];

async function main() {
  console.log('Seeding Syllabus Nodes into PostgreSQL...');
  let createdCount = 0;
  for (const node of SYLLABUS_NODES) {
    await prisma.syllabusNode.upsert({
      where: { code: node.code },
      update: {
        title: node.title,
        paperCode: node.paperCode,
        subjectName: node.subjectName,
        description: node.description,
      },
      create: {
        code: node.code,
        title: node.title,
        paperCode: node.paperCode,
        subjectName: node.subjectName,
        description: node.description,
      },
    });
    createdCount++;
  }
  console.log(`Successfully seeded/updated ${createdCount} comprehensive Syllabus Nodes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
