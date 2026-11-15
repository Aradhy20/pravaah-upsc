import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NCERT_CATALOG = [
  // ========================================================
  // POLITY & CONSTITUTION
  // ========================================================
  {
    classNumber: 11,
    subject: 'Polity',
    bookTitle: 'Indian Constitution at Work',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?keps2=0-10',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Constitution: Why and How?',
        slug: 'constitution-why-and-how',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps201.pdf',
        keyTopics: 'Functions of a Constitution, Authority of Constituent Assembly, Objective Resolution, Institutional Arrangements, Borrowed Features.',
        summary: 'Explains why societies need a constitution to coordinate rules, limit government power, and express collective aspirations.',
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Rights in the Indian Constitution',
        slug: 'rights-in-the-indian-constitution',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps202.pdf',
        keyTopics: 'Bill of Rights, Fundamental Rights (Articles 12-35), Preventive Detention, Writs (Article 32), DPSP (Part IV), Relation between FR and DPSP.',
        summary: 'Comprehensive analysis of constitutional rights, writ remedies under Articles 32 and 226, and the Kesavananda Bharati basic structure balance.',
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Election and Representation',
        slug: 'election-and-representation',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps203.pdf',
        keyTopics: 'First Past the Post (FPTP) system, Proportional Representation (PR), Delimitation Commission, Election Commission of India (Art 324), Electoral Reforms.',
        summary: 'Contrasts FPTP and PR systems, explains why India chose FPTP for Lok Sabha and Assemblies, and outlines powers of the Election Commission.',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Executive',
        slug: 'executive',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps204.pdf',
        keyTopics: 'Parliamentary vs Presidential executive, President of India (election, veto, discretionary powers), Prime Minister and Council of Ministers, Permanent Executive (Civil Services).',
        summary: 'Deconstructs the parliamentary executive in India, constitutional position of President vs Prime Minister, and role of Bureaucracy.',
      },
      {
        chapterNumber: 5,
        chapterTitle: 'Legislature',
        slug: 'legislature',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps205.pdf',
        keyTopics: 'Bicameralism, Rajya Sabha special powers, Legislative procedure, Money Bill vs Ordinary Bill, Parliamentary Committees, Anti-Defection (10th Schedule).',
        summary: 'Analyzes why Parliament is needed, how laws are enacted, role of Parliamentary Standing Committees, and anti-defection provisions.',
      },
      {
        chapterNumber: 6,
        chapterTitle: 'Judiciary',
        slug: 'judiciary',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps206.pdf',
        keyTopics: 'Independence of Judiciary, Appointment of Judges (Collegium System), Original, Appellate, Advisory Jurisdictions, Judicial Review, Public Interest Litigation (PIL).',
        summary: 'Examines constitutional safeguards for judicial independence, jurisdiction of Supreme Court, judicial activism, and PIL evolution.',
      },
      {
        chapterNumber: 7,
        chapterTitle: 'Federalism',
        slug: 'federalism',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps207.pdf',
        keyTopics: 'Division of Powers (7th Schedule Union/State/Concurrent), Centre-State Relations, Governor’s Role, President’s Rule (Art 356), Interstate River Water Disputes.',
        summary: 'Studies the unitary tilt of Indian federalism, emergency powers, interstate council, and federal frictions.',
      },
      {
        chapterNumber: 8,
        chapterTitle: 'Local Governments',
        slug: 'local-governments',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keps208.pdf',
        keyTopics: '73rd and 74th Constitutional Amendments, 11th and 12th Schedules, Gram Sabha, State Election Commission, State Finance Commission, PESA Act 1996.',
        summary: 'Traces the evolution of Panchayati Raj, 3-tier local governance structure, reservation for women, and financial devolution challenges.',
      },
    ],
  },
  {
    classNumber: 10,
    subject: 'Polity',
    bookTitle: 'Democratic Politics - II',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?jess4=0-8',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Power Sharing',
        slug: 'power-sharing',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/jess401.pdf',
        keyTopics: 'Case studies of Belgium and Sri Lanka, Majoritarianism vs Accommodation, Horizontal and Vertical power sharing.',
        summary: 'Highlights the prudential and moral reasons for sharing power among legislature, executive, judiciary, and levels of government.',
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Federalism',
        slug: 'federalism-class-10',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/jess402.pdf',
        keyTopics: 'Coming together vs Holding together federations, Linguistic States, Language policy, Centre-State relations, Decentralization in India.',
        summary: 'Focuses on linguistic reorganization of states, 3-tier decentralization post-1992, and the coalition era of federalism.',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Political Parties',
        slug: 'political-parties',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/jess404.pdf',
        keyTopics: 'Functions of political parties, Multi-party system, National vs State recognized parties criteria, Challenges facing political parties.',
        summary: 'Criteria by Election Commission for recognizing national and state parties, role of opposition, and internal democracy reforms.',
      },
    ],
  },

  // ========================================================
  // ECONOMICS
  // ========================================================
  {
    classNumber: 11,
    subject: 'Economy',
    bookTitle: 'Indian Economic Development',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?keec1=0-10',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Indian Economy on the Eve of Independence',
        slug: 'indian-economy-on-eve-of-independence',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec101.pdf',
        keyTopics: 'Colonial exploitation, Land settlement systems (Zamindari, Ryotwari, Mahalwari), De-industrialization of handicrafts, Drain of Wealth theory.',
        summary: 'Detailed examination of stagnation in agricultural, industrial, and foreign trade sectors under colonial British rule.',
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Indian Economy (1950–1990)',
        slug: 'indian-economy-1950-1990',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec102.pdf',
        keyTopics: 'Five Year Plans goals (Growth, Modernization, Self-reliance, Equity), Mahalanobis model, Land Reforms, Green Revolution, Industrial Policy Resolution 1956 (IPR 1956).',
        summary: 'Studies state-led industrialization, import substitution, public sector dominance, and agricultural transformation through Green Revolution.',
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Liberalisation, Privatisation and Globalisation: An Appraisal',
        slug: 'liberalisation-privatisation-and-globalisation',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec103.pdf',
        keyTopics: '1991 Balance of Payments crisis, Structural Adjustment Program, LPG reforms, Disinvestment, Financial sector reforms, WTO establishment.',
        summary: 'In-depth review of 1991 LPG reforms, industrial de-licensing, devaluation, capital account liberalization, and post-reform growth.',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Human Capital Formation in India',
        slug: 'human-capital-formation-in-india',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec104.pdf',
        keyTopics: 'Sources of human capital (Education, Health, On-the-job training, Migration, Information), Human capital vs Human development, Education cess.',
        summary: 'Explains how investment in health and education enhances productivity and economic growth in developing countries.',
      },
      {
        chapterNumber: 5,
        chapterTitle: 'Rural Development',
        slug: 'rural-development',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec105.pdf',
        keyTopics: 'Rural credit (NABARD, Regional Rural Banks, SHG-Bank Linkage), Agricultural marketing, Organic farming, Diversification into livestock and fisheries.',
        summary: 'Critical challenges in rural credit, role of micro-finance, agricultural supply chain bottlenecks, and sustainable agriculture.',
      },
      {
        chapterNumber: 7,
        chapterTitle: 'Environment and Sustainable Development',
        slug: 'environment-and-sustainable-development',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/keec107.pdf',
        keyTopics: 'Functions of environment, Carrying capacity, Absorptive capacity, Land degradation, Global warming, Brundtland Commission, Sustainable development strategies.',
        summary: 'Connects environmental degradation, ozone depletion, and climate change to economic growth, focusing on non-conventional energy and bio-composting.',
      },
    ],
  },
  {
    classNumber: 12,
    subject: 'Economy',
    bookTitle: 'Introductory Macroeconomics',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?leec1=0-6',
    chapters: [
      {
        chapterNumber: 2,
        chapterTitle: 'National Income Accounting',
        slug: 'national-income-accounting',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/leec102.pdf',
        keyTopics: 'Circular Flow of Income, GDP, GNP, NDP, NNP at Factor Cost vs Market Price, Real vs Nominal GDP, GDP Deflator, Limitations of GDP as welfare measure.',
        summary: 'Fundamental macroeconomic identities, three methods of calculating national income (Value Added, Income, Expenditure), and externalities.',
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Money and Banking',
        slug: 'money-and-banking',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/leec103.pdf',
        keyTopics: 'Functions of Money, Demand for Money, High Powered Money (M0), Money Multiplier, Commercial banks credit creation, RBI monetary policy instruments (CRR, SLR, Repo).',
        summary: 'Analyzes monetary aggregates (M1, M2, M3, M4), liquidity management, credit creation by banking system, and Central Bank quantitative/qualitative controls.',
      },
      {
        chapterNumber: 5,
        chapterTitle: 'Government Budget and the Economy',
        slug: 'government-budget-and-the-economy',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/leec105.pdf',
        keyTopics: 'Revenue Receipts vs Capital Receipts, Revenue Expenditure vs Capital Expenditure, Fiscal Deficit, Revenue Deficit, Primary Deficit, Deficit financing.',
        summary: 'Components of Union Budget, distinction between capital and revenue budgets, fiscal deficit implications, and debt sustainability.',
      },
      {
        chapterNumber: 6,
        chapterTitle: 'Open Economy Macroeconomics',
        slug: 'open-economy-macroeconomics',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/leec106.pdf',
        keyTopics: 'Balance of Payments (Current Account & Capital Account), Balance of Trade, Autonomous vs Accommodating transactions, Fixed vs Floating Exchange Rates, NEER & REER.',
        summary: 'Deconstructs external trade transactions, exchange rate determination, depreciation vs devaluation, and capital account convertibility.',
      },
    ],
  },

  // ========================================================
  // GEOGRAPHY
  // ========================================================
  {
    classNumber: 11,
    subject: 'Geography',
    bookTitle: 'Fundamentals of Physical Geography',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?kegy2=0-16',
    chapters: [
      {
        chapterNumber: 2,
        chapterTitle: 'The Origin and Evolution of the Earth',
        slug: 'origin-and-evolution-of-the-earth',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy202.pdf',
        keyTopics: 'Nebular hypothesis, Big Bang theory, Evolution of lithosphere, atmosphere, and hydrosphere.',
        summary: 'The geological evolution of planet earth, differentiation of layers, and origin of oceans and life.',
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Interior of the Earth',
        slug: 'interior-of-the-earth',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy203.pdf',
        keyTopics: 'Sources of earth interior info (Direct vs Indirect), Earthquake waves (P and S waves, Shadow zones), Crust, Mantle, Core (Nife), Discontinuities (Mohorovicic, Gutenberg).',
        summary: 'Primary physical evidence from seismology, shadow zones of P and S waves, asthenosphere, and density structure of earth interior.',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Distribution of Oceans and Continents',
        slug: 'distribution-of-oceans-and-continents',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy204.pdf',
        keyTopics: 'Continental Drift Theory (Alfred Wegener), Conventional Current Theory, Seafloor Spreading (Harry Hess), Plate Tectonics, Plate Boundaries (Divergent, Convergent, Transform).',
        summary: 'Evidence for continental drift, mid-oceanic ridges, paleomagnetism, and plate tectonic boundaries (Ring of Fire).',
      },
      {
        chapterNumber: 8,
        chapterTitle: 'Composition and Structure of Atmosphere',
        slug: 'composition-and-structure-of-atmosphere',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy208.pdf',
        keyTopics: 'Atmospheric gases, Troposphere, Stratosphere (Ozone layer), Mesosphere, Thermosphere, Ionosphere, Lapse rate.',
        summary: 'Thermal structure of atmosphere, vertical temperature distribution, importance of stratospheric ozone, and radio transmission layers.',
      },
      {
        chapterNumber: 9,
        chapterTitle: 'Solar Radiation, Heat Balance and Temperature',
        slug: 'solar-radiation-heat-balance-and-temperature',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy209.pdf',
        keyTopics: 'Insolation, Factors controlling temperature, Heat budget of the earth, Terrestrial radiation, Temperature inversion.',
        summary: 'Earth heat budget balance, albedo of surfaces, greenhouse warming mechanism, and winter temperature inversion in valleys.',
      },
      {
        chapterNumber: 10,
        chapterTitle: 'Atmospheric Circulation and Weather Systems',
        slug: 'atmospheric-circulation-and-weather-systems',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy210.pdf',
        keyTopics: 'Coriolis force, Planetary winds (Trades, Westerlies, Polar Easterlies), Hadley, Ferrel and Polar cells, Jet Streams, Tropical vs Extra-tropical Cyclones.',
        summary: 'Tri-cellular atmospheric circulation, pressure belts, monsoon mechanism, and genesis of tropical cyclones over warm oceans (>27°C).',
      },
      {
        chapterNumber: 14,
        chapterTitle: 'Movements of Ocean Water',
        slug: 'movements-of-ocean-water',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy214.pdf',
        keyTopics: 'Waves, Tides (Spring and Neap tides, Lunar attraction), Ocean Currents (Warm currents vs Cold currents, Gulf Stream, Kuroshio, California, Humboldt, Benguela).',
        summary: 'Ocean water circulation patterns, Coriolis effect on gyres, fishing grounds formed by mixing of warm and cold currents, and tidal energy.',
      },
    ],
  },
  {
    classNumber: 11,
    subject: 'Geography',
    bookTitle: 'India: Physical Environment',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?kegy1=0-7',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'India – Location',
        slug: 'india-location',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy101.pdf',
        keyTopics: 'Latitudinal and longitudinal extent, Indian Standard Meridian (82°30’ E), Territorial waters, Frontiers with neighbouring countries.',
        summary: 'Geographical position of India, standard time calculation, strategic significance in the Indian Ocean, and international land boundaries.',
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Structure and Physiography',
        slug: 'structure-and-physiography',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy102.pdf',
        keyTopics: 'Peninsular Block, Himalayas and extra-peninsular mountains, Indo-Ganga-Brahmaputra Plain, Coastal Plains (Western vs Eastern), Island groups (Andaman & Nicobar, Lakshadweep).',
        summary: 'Detailed morphological classification of Himalayas (Greater, Lesser, Shiwaliks), Bhabar, Tarai, Bhangar, Khadar plains, and Western vs Eastern Ghats.',
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Drainage System',
        slug: 'drainage-system',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy103.pdf',
        keyTopics: 'Himalayan drainage (Indus, Ganga, Brahmaputra), Peninsular drainage (Godavari, Krishna, Cauvery, Narmada, Tapti), Evolution of river systems, River regimes.',
        summary: 'Exhaustive comparative study of Himalayan antecedent rivers vs Peninsular consequent rivers, drainage patterns (Dendritic, Trellis, Radial).',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Climate',
        slug: 'climate-india',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy104.pdf',
        keyTopics: 'Factors determining climate of India, Mechanism of Indian Monsoon (Thermal concept, Dynamic concept, Jet streams, Tibetan heating, Somali jet, ENSO, IOD).',
        summary: 'Complete scientific treatment of monsoon onset, break in monsoon, retreat of monsoon, El Nino Southern Oscillation, and Indian Ocean Dipole.',
      },
      {
        chapterNumber: 6,
        chapterTitle: 'Soils',
        slug: 'soils-india',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/kegy106.pdf',
        keyTopics: 'ICAR classification of soils: Alluvial, Black (Regur), Red & Yellow, Laterite, Arid, Saline, Peaty, Forest soils. Soil erosion and conservation.',
        summary: 'Soil profile, geographical distribution across India, mineral composition, fertility, self-ploughing capacity of black soil, and leaching in laterites.',
      },
    ],
  },

  // ========================================================
  // HISTORY
  // ========================================================
  {
    classNumber: 12,
    subject: 'History',
    bookTitle: 'Themes in Indian History - Part I',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?lehs1=0-4',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Bricks, Beads and Bones: The Harappan Civilisation',
        slug: 'bricks-beads-and-bones-harappan-civilisation',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs101.pdf',
        keyTopics: 'Early vs Mature Harappan, Town planning, Citadel and Lower town, Drainage system, Craft production (Chanhudaro), Trade contacts (Mesopotamia / Dilmun), Seals, Script, Decline.',
        summary: 'Archaeological insights into Indus Valley Civilization, Dholavira water reservoirs, Lothal dockyard, and social differences.',
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Kings, Farmers and Towns: Early States and Economies (c. 600 BCE - 600 CE)',
        slug: 'kings-farmers-and-towns',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs102.pdf',
        keyTopics: 'Sixteen Mahajanapadas, Rise of Magadha, Mauryan Empire, Ashokan Edicts (Dhamma, script deciphment by James Prinsep), Land grants and agrarian expansion, Guptas administration.',
        summary: 'Epigraphic and numismatic evidence for early historic state formation, trade guilds (shrenis), and administration under Mauryas and Guptas.',
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Thinkers, Beliefs and Buildings: Cultural Developments (c. 600 BCE - 600 CE)',
        slug: 'thinkers-beliefs-and-buildings',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs104.pdf',
        keyTopics: 'Sanchi Stupa conservation, Teachings of the Buddha (Four Noble Truths, Eightfold Path), Sangha, Hinayana vs Mahayana, Jainism (Tirthankaras, Mahavira teachings, Ahimsa), Early temple architecture.',
        summary: 'Philosophical revolt against Vedic ritualism, architecture of Buddhist stupas (harmika, anda, chhatri), and sculpture preservation.',
      },
    ],
  },
  {
    classNumber: 12,
    subject: 'History',
    bookTitle: 'Themes in Indian History - Part III',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?lehs3=0-6',
    chapters: [
      {
        chapterNumber: 10,
        chapterTitle: 'Colonialism and the Countryside: Exploring Official Archives',
        slug: 'colonialism-and-the-countryside',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs301.pdf',
        keyTopics: 'Permanent Settlement in Bengal (1793, Sunset Law, Jotedars), Santhal Revolt (Damin-i-Koh, Sidhu & Kanhu), Deccan Riots Commission (1875, Cotton boom, Moneylenders).',
        summary: 'Agrarian distress under East India Company revenue systems, tribal resistance in Rajmahal hills, and peasant rebellion in the Deccan.',
      },
      {
        chapterNumber: 11,
        chapterTitle: 'Rebels and the Raj: The 1857 Revolt and Its Representations',
        slug: 'rebels-and-the-raj-1857',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs302.pdf',
        keyTopics: 'Outbreak in Meerut, Delhi, Awadh annexation (Lord Dalhousie, Nawab Wajid Ali Shah), Leaders (Bahadur Shah Zafar, Nana Sahib, Rani Lakshmibai, Kunwar Singh), Proclamations, British suppression.',
        summary: 'Causes, spread, and visual representations of the 1857 Revolt, mutiny of sepoys, peasant participation, and post-1857 structural changes.',
      },
      {
        chapterNumber: 13,
        chapterTitle: 'Mahatma Gandhi and the Nationalist Movement: Civil Disobedience and Beyond',
        slug: 'mahatma-gandhi-and-the-nationalist-movement',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs304.pdf',
        keyTopics: 'South African experiments, Non-Cooperation Movement (1920-22), Chauri Chaura, Salt March (Dandi 1930), Civil Disobedience, Gandhi-Irwin Pact, Round Table Conferences, Quit India Movement (1942).',
        summary: 'Evolution of mass nationalism under Gandhi, satyagraha technique, social base of Congress, and peasant/women involvement.',
      },
      {
        chapterNumber: 15,
        chapterTitle: 'Framing the Constitution: The Beginning of a New Era',
        slug: 'framing-the-constitution',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lehs306.pdf',
        keyTopics: 'Constituent Assembly debates (1946-49), Dr. B.R. Ambedkar, Jawaharlal Nehru (Objective Resolution), K.M. Munshi, Debate on Fundamental Rights, Language debate, Separate electorates controversy.',
        summary: 'Critical ideological debates in Constituent Assembly regarding federalism, minority safeguards, official language, and social justice.',
      },
    ],
  },

  // ========================================================
  // ENVIRONMENT & ECOLOGY
  // ========================================================
  {
    classNumber: 12,
    subject: 'Environment',
    bookTitle: 'Biology (Unit X - Ecology)',
    medium: 'English',
    officialPortalUrl: 'https://ncert.nic.in/textbook.php?lebo1=13-16',
    chapters: [
      {
        chapterNumber: 13,
        chapterTitle: 'Organisms and Populations',
        slug: 'organisms-and-populations',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lebo113.pdf',
        keyTopics: 'Abiotic factors (Temperature, Water, Light, Soil), Adaptations, Population attributes, Population growth models (Exponential vs Logistic growth, Carrying capacity), Species interactions (Mutualism, Commensalism, Parasitism, Amensalism, Competition - Gause principle).',
        summary: 'Ecological hierarchy, physiological adaptations in desert/aquatic organisms, logistic growth curves, and interspecific population interactions.',
      },
      {
        chapterNumber: 14,
        chapterTitle: 'Ecosystem',
        slug: 'ecosystem',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lebo114.pdf',
        keyTopics: 'Ecosystem structure and function, Productivity (GPP vs NPP), Decomposition, Energy flow (10% law), Ecological Pyramids (Number, Biomass, Energy - always upright), Ecological Succession (Hydrarch vs Xerarch, Climax community), Nutrient cycling (Carbon and Phosphorus cycles).',
        summary: 'Trophic structure of terrestrial and aquatic ecosystems, upright vs inverted biomass pyramids, and pioneer to climax community succession.',
      },
      {
        chapterNumber: 15,
        chapterTitle: 'Biodiversity and Conservation',
        slug: 'biodiversity-and-conservation',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lebo115.pdf',
        keyTopics: 'Levels of biodiversity (Genetic, Species, Ecological), Latitudinal gradients, Species-Area relationship (Alexander von Humboldt), Importance of biodiversity (Rivet Popper hypothesis), Causes of biodiversity loss (The Evil Quartet: Habitat loss, Over-exploitation, Alien species invasion, Co-extinctions), In-situ vs Ex-situ conservation.',
        summary: 'Global biodiversity patterns, reasons for tropical diversity, extinction threats, sacred groves, biosphere reserves, national parks, and international biodiversity treaties.',
      },
      {
        chapterNumber: 16,
        chapterTitle: 'Environmental Issues',
        slug: 'environmental-issues',
        officialPdfUrl: 'https://ncert.nic.in/textbook/pdf/lebo116.pdf',
        keyTopics: 'Air pollution (Electrostatic precipitator, Catalytic converter, Air Act 1981), Water pollution (BOD, Eutrophication, Biomagnification of DDT/Mercury), Solid waste management, Radioactive wastes, Greenhouse effect and global warming, Ozone depletion in stratosphere (Dobson units, Montreal Protocol), Deforestation (Chipko movement, JFM).',
        summary: 'Pollution control technologies, biochemical oxygen demand in polluted water bodies, chlorofluorocarbons mechanism in ozone hole creation, and joint forest management.',
      },
    ],
  },
];

async function main() {
  console.log('Seeding NCERT Knowledge Catalog into PostgreSQL...');
  let totalBooks = 0;
  let totalChapters = 0;

  for (const bookData of NCERT_CATALOG) {
    const book = await prisma.nCERTBook.upsert({
      where: {
        classNumber_subject_bookTitle: {
          classNumber: bookData.classNumber,
          subject: bookData.subject,
          bookTitle: bookData.bookTitle,
        },
      },
      update: {
        medium: bookData.medium,
        officialPortalUrl: bookData.officialPortalUrl,
      },
      create: {
        classNumber: bookData.classNumber,
        subject: bookData.subject,
        bookTitle: bookData.bookTitle,
        medium: bookData.medium,
        officialPortalUrl: bookData.officialPortalUrl,
      },
    });
    totalBooks++;

    for (const chap of bookData.chapters) {
      await prisma.nCERTChapter.upsert({
        where: {
          bookId_chapterNumber: {
            bookId: book.id,
            chapterNumber: chap.chapterNumber,
          },
        },
        update: {
          chapterTitle: chap.chapterTitle,
          slug: chap.slug,
          officialPdfUrl: chap.officialPdfUrl,
          keyTopics: chap.keyTopics,
          summary: chap.summary,
        },
        create: {
          bookId: book.id,
          chapterNumber: chap.chapterNumber,
          chapterTitle: chap.chapterTitle,
          slug: chap.slug,
          officialPdfUrl: chap.officialPdfUrl,
          keyTopics: chap.keyTopics,
          summary: chap.summary,
        },
      });
      totalChapters++;
    }
  }

  // Now create links between NCERT Chapters and existing Questions in database
  console.log('Linking NCERT Chapters to relevant historical UPSC PYQs...');
  const questions = await prisma.question.findMany({
    take: 50,
    include: { explanation: true },
  });

  const chapters = await prisma.nCERTChapter.findMany();
  let linksCreated = 0;

  for (const q of questions) {
    // Map question text or explanation keywords to NCERT chapters
    const qText = (q.questionText + ' ' + (q.explanation?.detailedExplanation || '')).toLowerCase();
    
    let matchedChapter = null;
    if (qText.includes('constitution') || qText.includes('parliament') || qText.includes('article') || qText.includes('writ')) {
      matchedChapter = chapters.find(c => c.slug.includes('constitution') || c.slug.includes('rights') || c.slug.includes('legislature'));
    } else if (qText.includes('monsoon') || qText.includes('river') || qText.includes('cyclone') || qText.includes('soil')) {
      matchedChapter = chapters.find(c => c.slug.includes('climate') || c.slug.includes('drainage') || c.slug.includes('soils'));
    } else if (qText.includes('inflation') || qText.includes('rbi') || qText.includes('gdp') || qText.includes('budget') || qText.includes('deficit')) {
      matchedChapter = chapters.find(c => c.slug.includes('money-and-banking') || c.slug.includes('budget') || c.slug.includes('national-income'));
    } else if (qText.includes('biodiversity') || qText.includes('species') || qText.includes('ecosystem') || qText.includes('ozone')) {
      matchedChapter = chapters.find(c => c.slug.includes('ecosystem') || c.slug.includes('biodiversity') || c.slug.includes('environmental-issues'));
    } else if (qText.includes('harappan') || qText.includes('buddha') || qText.includes('gandhi') || qText.includes('1857')) {
      matchedChapter = chapters.find(c => c.slug.includes('harappan') || c.slug.includes('rebel') || c.slug.includes('gandhi') || c.slug.includes('thinkers'));
    }

    if (matchedChapter) {
      await prisma.nCERTChapterQuestionLink.upsert({
        where: {
          chapterId_questionId: {
            chapterId: matchedChapter.id,
            questionId: q.id,
          },
        },
        update: {
          relevanceNote: `Concept tested directly from NCERT ${matchedChapter.chapterTitle}.`,
        },
        create: {
          chapterId: matchedChapter.id,
          questionId: q.id,
          relevanceNote: `Concept tested directly from NCERT ${matchedChapter.chapterTitle}.`,
        },
      });
      linksCreated++;
    }
  }

  console.log(`Successfully seeded ${totalBooks} NCERT Books, ${totalChapters} Chapters, and linked ${linksCreated} PYQs to NCERT Chapters.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
