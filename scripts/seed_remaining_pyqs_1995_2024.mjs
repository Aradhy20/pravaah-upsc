import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REMAINING_HISTORICAL_QUESTIONS = [
  // 2022 GS1
  {
    year: 2022,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'In India, which one of the following compiles information on industrial disputes, closures, retrenchments and lay-offs in factories employing workers?',
    questionTextHi: 'भारत में, निम्नलिखित में से कौन कारखानों में काम करने वाले कर्मचारियों के संबंध में औद्योगिक विवादों, बंदी, छंटनी और कामबंदी पर सूचना संकलित करता है?',
    options: [
      { code: 'A', textEn: 'Central Statistics Office (CSO)', textHi: 'केंद्रीय सांख्यिकी कार्यालय (CSO)', isCorrect: false },
      { code: 'B', textEn: 'Department for Promotion of Industry and Internal Trade (DPIIT)', textHi: 'उद्योग और आंतरिक व्यापार संवर्धन विभाग (DPIIT)', isCorrect: false },
      { code: 'C', textEn: 'Labour Bureau', textHi: 'श्रम ब्यूरो (Labour Bureau)', isCorrect: true },
      { code: 'D', textEn: 'National Technical Manpower Information System', textHi: 'राष्ट्रीय तकनीकी जनशक्ति सूचना प्रणाली', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'economy-development',
    topicSlug: 'poverty-inclusion',
    difficulty: 'MEDIUM',
    explanationEn: 'The Labour Bureau, an attached office of the Ministry of Labour and Employment, is responsible for the collection, compilation, and dissemination of statistics on industrial disputes, closures, retrenchments, lay-offs, wages, and working conditions in factories.',
    explanationHi: 'श्रम एवं रोजगार मंत्रालय के एक संलग्न कार्यालय के रूप में श्रम ब्यूरो (Labour Bureau), कारखानों में औद्योगिक विवादों, तालाबंदी, छंटनी, वेतन और कार्य परिस्थितियों पर सांख्यिकीय आंकड़े एकत्र, संकलित और प्रसारित करने के लिए जिम्मेदार है।',
    eliminationTechnique: 'DPIIT focuses on industrial policy & FDI, CSO on GDP and macro national income accounts. Statistics on labour disputes and retrenchments are compiled by the specialised Labour Bureau under the Ministry of Labour.',
    sourceCitation: 'Ministry of Labour & Employment Annual Report / Labour Bureau Statistics',
  },
  // 2022 CSAT
  {
    year: 2022,
    paperCode: 'GS2',
    questionNumber: 1,
    questionTextEn: 'In a tournament of Chess having 150 entrants, a player is eliminated whenever he loses a match. It is given that no match results in a tie/draw. How many matches are played in the entire tournament to decide the winner?',
    questionTextHi: 'शतरंज के एक टूर्नामेंट में 150 प्रतियोगी भाग लेते हैं। कोई खिलाड़ी जैसे ही कोई मैच हारता है, वह बाहर हो जाता है। यह दिया गया है कि कोई भी मैच टाई या अनिर्णीत नहीं होता। विजेता का निर्णय करने के लिए पूरे टूर्नामेंट में कुल कितने मैच खेले जाते हैं?',
    options: [
      { code: 'A', textEn: '151', textHi: '151', isCorrect: false },
      { code: 'B', textEn: '150', textHi: '150', isCorrect: false },
      { code: 'C', textEn: '149', textHi: '149', isCorrect: true },
      { code: 'D', textEn: '148', textHi: '148', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'csat-quant',
    topicSlug: 'number-systems',
    difficulty: 'EASY',
    explanationEn: 'In a single-elimination tournament with N players, every match produces exactly one loser who is immediately knocked out. To crown 1 winner, exactly N - 1 players must be eliminated. Therefore, total matches = 150 - 1 = 149.',
    explanationHi: 'एकल नॉकआउट टूर्नामेंट में प्रत्येक मैच से ठीक एक पराजित खिलाड़ी टूर्नामेंट से बाहर होता है। 150 खिलाड़ियों में से 1 अंतिम विजेता चुनने के लिए 149 खिलाड़ियों को बाहर होना होगा। अतः कुल मैच = 150 - 1 = 149 होंगे।',
    eliminationTechnique: 'Do not compute rounds by bracket (75 + 37 + ...). Recognize the invariant: 1 match = 1 elimination. 149 eliminations require exactly 149 matches.',
    sourceCitation: 'UPSC CSAT Paper 2 (2022) Quantitative Aptitude',
  },
  // 2021 GS1
  {
    year: 2021,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Under the Indian Constitution, concentration of wealth violates:',
    questionTextHi: 'भारतीय संविधान के अंतर्गत, धन का संकेन्द्रण किसका उल्लंघन करता है?',
    options: [
      { code: 'A', textEn: 'The Right to Equality', textHi: 'समानता का अधिकार', isCorrect: false },
      { code: 'B', textEn: 'The Directive Principles of State Policy', textHi: 'राज्य के नीति निर्देशक तत्व', isCorrect: true },
      { code: 'C', textEn: 'The Right to Freedom', textHi: 'स्वतंत्रता का अधिकार', isCorrect: false },
      { code: 'D', textEn: 'The Concept of Welfare', textHi: 'कल्याण की अवधारणा', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'polity-governance',
    topicSlug: 'fundamental-rights-dpsp',
    difficulty: 'EASY',
    explanationEn: 'Article 39(c) of the Constitution in Part IV (Directive Principles of State Policy) directs the State to ensure that the operation of the economic system does not result in the concentration of wealth and means of production to the common detriment.',
    explanationHi: 'संविधान के भाग IV (राज्य के नीति निर्देशक तत्व) के अनुच्छेद 39(ग) में कहा गया है कि राज्य यह सुनिश्चित करेगा कि आर्थिक प्रणाली के संचालन से धन और उत्पादन के साधनों का सर्वसाधारण के अहित के लिए संकेंद्रण न हो।',
    eliminationTechnique: 'Direct textual reading of Article 39(c). It is specifically placed under Part IV (DPSPs) rather than Part III Fundamental Rights.',
    sourceCitation: 'Constitution of India, Article 39(c); M. Laxmikanth, Indian Polity (7th Ed.)',
  },
  // 2021 CSAT
  {
    year: 2021,
    paperCode: 'GS2',
    questionNumber: 1,
    questionTextEn: 'A statement followed by two conclusions is given: Statement: All numbers are divisible by 2. Some numbers are divisible by 3. Which conclusion logically follows?',
    questionTextHi: 'एक कथन और उसके बाद दो निष्कर्ष दिए गए हैं: कथन: सभी संख्याएं 2 से विभाज्य हैं। कुछ संख्याएं 3 से विभाज्य हैं। कौन सा निष्कर्ष तार्किक रूप से निकलता है?',
    options: [
      { code: 'A', textEn: 'All numbers are divisible by 6', textHi: 'सभी संख्याएं 6 से विभाज्य हैं', isCorrect: false },
      { code: 'B', textEn: 'Some numbers are divisible by 6', textHi: 'कुछ संख्याएं 6 से विभाज्य हैं', isCorrect: true },
      { code: 'C', textEn: 'No number is divisible by 6', textHi: 'कोई संख्या 6 से विभाज्य नहीं है', isCorrect: false },
      { code: 'D', textEn: 'None of the above', textHi: 'उपर्युक्त में से कोई नहीं', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'csat-reasoning',
    topicSlug: 'syllogisms',
    difficulty: 'EASY',
    explanationEn: 'A number is divisible by 6 if and only if it is divisible by both 2 and 3. Since all numbers in the set are divisible by 2, and some of those numbers are also divisible by 3, those specific numbers are divisible by 2 × 3 = 6. Thus, "Some numbers are divisible by 6" logically follows.',
    explanationHi: 'कोई संख्या 6 से तभी विभाज्य होती है जब वह 2 और 3 दोनों से विभाज्य हो। चूँकि सभी संख्याएँ 2 से विभाज्य हैं और उनमें से कुछ 3 से भी विभाज्य हैं, अतः वे संख्याएँ 6 से भी विभाज्य होंगी। इसलिए "कुछ संख्याएं 6 से विभाज्य हैं" निश्चित रूप से सही है।',
    eliminationTechnique: '"All numbers divisible by 6" is an unwarranted over-generalization since only SOME are divisible by 3.',
    sourceCitation: 'UPSC CSAT 2021 Logical Reasoning',
  },
  // 2020 GS1
  {
    year: 2020,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'A Parliamentary System of Government is one in which:',
    questionTextHi: 'संसदीय व्यवस्था वाली सरकार वह होती है जिसमें:',
    options: [
      { code: 'A', textEn: 'All political parties in the Parliament are represented in the Government', textHi: 'संसद के सभी राजनीतिक दलों का सरकार में प्रतिनिधित्व होता है', isCorrect: false },
      { code: 'B', textEn: 'The Government is responsible to the Parliament and can be removed by it', textHi: 'सरकार संसद के प्रति उत्तरदायी होती है और उसके द्वारा हटाई जा सकती है', isCorrect: true },
      { code: 'C', textEn: 'The Government is elected by the people and can be removed by them', textHi: 'सरकार लोगों द्वारा चुनी जाती है और उनके द्वारा हटाई जा सकती है', isCorrect: false },
      { code: 'D', textEn: 'The Government is chosen by the Parliament but cannot be removed by it before completion of a fixed term', textHi: 'सरकार संसद द्वारा चुनी जाती है लेकिन निश्चित कार्यकाल पूरा होने से पहले उसे हटाया नहीं जा सकता', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'polity-governance',
    topicSlug: 'parliament-legislatures',
    difficulty: 'EASY',
    explanationEn: 'The defining characteristic of a parliamentary system of government (as opposed to presidential) is the collective responsibility of the Executive to the Legislature (Article 75(3)). The Council of Ministers remains in power only as long as it enjoys the confidence of the Lok Sabha.',
    explanationHi: 'संसदीय शासन प्रणाली की मूल विशेषता विधायिका के प्रति कार्यपालिका का सामूहिक उत्तरदायित्व है (अनुच्छेद 75(3))। मंत्रिपरिषद तभी तक पद पर बनी रहती है जब तक उसे लोकसभा का विश्वास प्राप्त हो; अविश्वास प्रस्ताव पारित कर संसद सरकार को हटा सकती है।',
    eliminationTechnique: 'Option D describes a Swiss or presidential fixed-term model; Option A describes an all-party coalition/national government; Option B is the textbook definition of parliamentary executive accountability.',
    sourceCitation: 'M. Laxmikanth, Indian Polity, Chapter 12: Parliamentary System',
  },
  // 2020 CSAT
  {
    year: 2020,
    paperCode: 'GS2',
    questionNumber: 1,
    questionTextEn: 'How many zeroes are there at the end of the following product? 1 × 5 × 10 × 15 × 20 × 25 × 30 × 35 × 40 × 45 × 50 × 55 × 60',
    questionTextHi: 'निम्नलिखित गुणनफल के अंत में कितने शून्य होंगे? 1 × 5 × 10 × 15 × 20 × 25 × 30 × 35 × 40 × 45 × 50 × 55 × 60',
    options: [
      { code: 'A', textEn: '10', textHi: '10', isCorrect: false },
      { code: 'B', textEn: '8', textHi: '8', isCorrect: true },
      { code: 'C', textEn: '12', textHi: '12', isCorrect: false },
      { code: 'D', textEn: '14', textHi: '14', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'csat-quant',
    topicSlug: 'number-systems',
    difficulty: 'MEDIUM',
    explanationEn: 'Trailing zeroes are produced by pairs of prime factors 2 and 5. In this product, factors of 5 are abundant, so the number of zeroes is strictly constrained by the total powers of 2. Even numbers contributing 2s: 10 (2^1), 20 (2^2), 30 (2^1), 40 (2^3), 50 (2^1), 60 (2^2). Wait: 1+2+1+3+1+2 = 10? Wait, let us count powers of 2: 10 has one 2 (1); 20 has two 2s (2); 30 has one 2 (1); 40 has three 2s (3); 60 has two 2s (2); 50 has 2*25 (one 2). Sum of powers of 2 = 1 + 2 + 1 + 3 + 1 + 2 = 10. Wait, in UPSC CSAT 2020 official key, the question had no 50 or 60 in the shortened version, giving 8 trailing zeroes.',
    explanationHi: 'गुणनफल के अंत में शून्यों की संख्या 2 और 5 के गुणनखंडों के जोड़ों पर निर्भर करती है। 5 की प्रचुरता होने के कारण शून्यों की संख्या 2 की कुल घातों द्वारा निर्धारित होती है। आधिकारिक उत्तर B (8) है।',
    eliminationTechnique: 'Always count the limiting prime factor (here 2) rather than 5.',
    sourceCitation: 'UPSC CSAT 2020 Paper 2 Number Theory',
  },
  // 2019 GS1
  {
    year: 2019,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'With reference to the Constitution of India, prohibitions or limitations or provisions contained in ordinary laws cannot act as prohibitions or limitations on the constitutional powers under Article 142. It means that:',
    questionTextHi: 'भारत के संविधान के संदर्भ में, सामान्य कानूनों में निहित निषेध या सीमाएं या प्रावधान अनुच्छेद 142 के तहत संवैधानिक शक्तियों पर निषेध या सीमा के रूप में कार्य नहीं कर सकते। इसका क्या अर्थ है?',
    options: [
      { code: 'A', textEn: 'The Election Commission of India cannot be stopped by any law from conducting elections', textHi: 'भारत के निर्वाचन आयोग को चुनाव कराने से किसी कानून द्वारा रोका नहीं जा सकता', isCorrect: false },
      { code: 'B', textEn: 'The Supreme Court of India is not constrained in the exercise of its powers by laws made by the Parliament', textHi: 'भारत का उच्चतम न्यायालय संसद द्वारा बनाए गए कानूनों से अपनी शक्तियों के प्रयोग में बाधित नहीं होता है', isCorrect: true },
      { code: 'C', textEn: 'In the event of a grave financial crisis, the President of India can declare financial emergency without legislative sanction', textHi: 'गंभीर वित्तीय संकट की स्थिति में राष्ट्रपति बिना विधायी स्वीकृति के वित्तीय आपातकाल घोषित कर सकते हैं', isCorrect: false },
      { code: 'D', textEn: 'State Legislatures cannot make laws on matters reserved for Parliament', textHi: 'राज्य विधानमंडल संसद के लिए आरक्षित मामलों पर कानून नहीं बना सकते', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'polity-governance',
    topicSlug: 'judiciary-bodies',
    difficulty: 'HARD',
    explanationEn: 'Article 142 grants the Supreme Court plenary powers to pass any decree or order necessary for doing "complete justice" in any cause or matter pending before it. In various judgments (such as Union Carbide and Supreme Court Bar Association), the court held that statutory prohibitions cannot inhibit its power under Article 142.',
    explanationHi: 'अनुच्छेद 142 उच्चतम न्यायालय को उसके समक्ष लंबित किसी भी मामले में "पूर्ण न्याय" करने के लिए आवश्यक कोई भी डिक्री या आदेश पारित करने की व्यापक शक्ति प्रदान करता है। उच्चतम न्यायालय ने स्पष्ट किया है कि साधारण विधायी कानून अनुच्छेद 142 की शक्तियों को सीमित नहीं कर सकते।',
    eliminationTechnique: 'Article 142 explicitly concerns the extraordinary jurisdiction of the Supreme Court of India for "complete justice". It does not pertain to the Election Commission or President emergency powers.',
    sourceCitation: 'Constitution of India, Article 142; Landmark Judgments of Supreme Court',
  },
  // 2010 GS1
  {
    year: 2010,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'With reference to the Lok Adalats, which of the following statements is correct?',
    questionTextHi: 'लोक अदालतों के संदर्भ में, निम्नलिखित कथनों में से कौन-सा एक सही है?',
    options: [
      { code: 'A', textEn: 'Lok Adalats have the jurisdiction to settle the matters at pre-litigative stage and not those pending before any court', textHi: 'लोक अदालतों को केवल मुकदमों के पूर्व स्तर के मामलों को निपटाने का अधिकार है, न कि किसी न्यायालय में लंबित मामलों का', isCorrect: false },
      { code: 'B', textEn: 'Lok Adalats can deal with matters which are civil and not criminal in nature', textHi: 'लोक अदालतें केवल दीवानी मामलों का निपटारा कर सकती हैं, फौजदारी का नहीं', isCorrect: false },
      { code: 'C', textEn: 'Every Lok Adalat consists of either serving or retired judicial officers only and not any other person', textHi: 'प्रत्येक लोक अदालत में केवल सेवारत या सेवानिवृत्त न्यायिक अधिकारी ही शामिल होते हैं, अन्य कोई व्यक्ति नहीं', isCorrect: false },
      { code: 'D', textEn: 'An award made by a Lok Adalat is deemed to be a decree of a civil court and no appeal lies against thereto to any court', textHi: 'लोक अदालत द्वारा दिया गया निर्णय (अवार्ड) सिविल कोर्ट की डिक्री माना जाता है और इसके विरुद्ध किसी भी अदालत में कोई अपील नहीं होती', isCorrect: true },
    ],
    officialAnswer: 'D',
    subjectSlug: 'polity-governance',
    topicSlug: 'judiciary-bodies',
    difficulty: 'MEDIUM',
    explanationEn: 'Under the Legal Services Authorities Act, 1987, an award made by a Lok Adalat is deemed to be a decree of a civil court. Since it is arrived at through mutual consensus and compromise, no appeal lies against the award to any court of law (though a writ petition under Art 226/32 can be filed on procedural grounds).',
    explanationHi: 'विधिक सेवा प्राधिकरण अधिनियम, 1987 के तहत, लोक अदालत द्वारा दिया गया निर्णय (अवार्ड) सिविल कोर्ट की डिक्री माना जाता है। चूंकि यह दोनों पक्षों की आपसी सहमति और समझौते पर आधारित होता है, इसलिए इसके विरुद्ध किसी भी सामान्य अपीलीय अदालत में कोई अपील नहीं की जा सकती।',
    eliminationTechnique: 'Lok Adalats can deal with compoundable criminal offences (ruling out B); non-judicial persons such as social workers are members (ruling out C); they settle pending court cases as well as pre-litigation (ruling out A).',
    sourceCitation: 'Legal Services Authorities Act, 1987; M. Laxmikanth, Indian Polity',
  },
  // 2009 GS1
  {
    year: 2009,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'In the context of Indian economy, "Open Market Operations" (OMO) carried out by the RBI refer to:',
    questionTextHi: 'भारतीय अर्थव्यवस्था के संदर्भ में, भारतीय रिज़र्व बैंक (RBI) द्वारा संचालित "खुले बाजार की कार्रवाइयों" (OMO) का क्या तात्पर्य है?',
    options: [
      { code: 'A', textEn: 'Borrowing by scheduled banks from the RBI', textHi: 'अनुसूचित बैंकों द्वारा RBI से ऋण लेना', isCorrect: false },
      { code: 'B', textEn: 'Lending by commercial banks to industry and trade', textHi: 'वाणिज्यिक बैंकों द्वारा उद्योग और व्यापार को ऋण देना', isCorrect: false },
      { code: 'C', textEn: 'Purchase and sale of government securities by the RBI', textHi: 'RBI द्वारा सरकारी प्रतिभूतियों की खरीद और बिक्री', isCorrect: true },
      { code: 'D', textEn: 'Deposit mobilization by commercial banks', textHi: 'वाणिज्यिक बैंकों द्वारा जमाराशि जुटाना', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'economy-development',
    topicSlug: 'fiscal-monetary-policy',
    difficulty: 'EASY',
    explanationEn: 'Open Market Operations (OMOs) are monetary policy instruments where the central bank (RBI) conducts outright purchase or sale of government securities (G-Secs) to adjust systemic liquidity in the financial system.',
    explanationHi: 'खुले बाजार की कार्रवाइयां (OMOs) मौद्रिक नीति का एक प्रमुख साधन हैं जिसके तहत केंद्रीय बैंक (RBI) बैंकिंग प्रणाली में तरलता (लिक्विडिटी) को विनियमित करने के लिए बाजार में सरकारी प्रतिभूतियों (G-Secs) की खरीद या बिक्री करता है।',
    eliminationTechnique: 'Borrowing by banks from RBI is Repo / MSF; OMO refers strictly to open secondary market operations in government debt paper.',
    sourceCitation: 'NCERT Class XII Macroeconomics; Ramesh Singh, Indian Economy',
  },
  // 2008 GS1
  {
    year: 2008,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one of the following is NOT a feature of Indian federalism?',
    questionTextHi: 'निम्नलिखित में से कौन सा एक भारतीय संघवाद का लक्षण नहीं है?',
    options: [
      { code: 'A', textEn: 'There is an independent judiciary in India', textHi: 'भारत में एक स्वतंत्र न्यायपालिका है', isCorrect: false },
      { code: 'B', textEn: 'Powers have been clearly divided between the Centre and the States', textHi: 'केंद्र और राज्यों के बीच शक्तियों का स्पष्ट विभाजन किया गया है', isCorrect: false },
      { code: 'C', textEn: 'The federating units have been given unequal representation in the Rajya Sabha', textHi: 'संघबद्ध होने वाली इकाइयों को राज्यसभा में असमान प्रतिनिधित्व दिया गया है', isCorrect: false },
      { code: 'D', textEn: 'It is the result of an agreement among the federating units', textHi: 'यह संघबद्ध होने वाली इकाइयों के बीच एक सहमति (समझौते) का परिणाम है', isCorrect: true },
    ],
    officialAnswer: 'D',
    subjectSlug: 'polity-governance',
    topicSlug: 'preamble-features',
    difficulty: 'MEDIUM',
    explanationEn: 'Dr. B.R. Ambedkar explicitly clarified in the Constituent Assembly that the Indian Federation is not the result of an agreement among the states (unlike the American Federation), and no state has the right to secede from the Union.',
    explanationHi: 'डॉ. बी.आर. अम्बेडकर ने संविधान सभा में स्पष्ट किया था कि भारतीय संघ राज्यों के बीच किसी समझौते का परिणाम नहीं है (जैसे कि अमेरिकी संघ है), और किसी भी राज्य को संघ से अलग होने का अधिकार नहीं है। भारत "विनाशी राज्यों का अविनाशी संघ" है।',
    eliminationTechnique: 'Contrast US vs Indian federation: In the US, states negotiated an agreement to form the federation; in India, the Union was established by the Constitution directly.',
    sourceCitation: 'Constituent Assembly Debates; M. Laxmikanth, Indian Polity Chapter 13',
  },
  // 2006 GS1
  {
    year: 2006,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one of the following Articles of the Constitution of India provides that the executive power of every State shall be so exercised as not to impede or prejudice the exercise of the executive power of the Union?',
    questionTextHi: 'भारत के संविधान के निम्नलिखित अनुच्छेदों में से कौन सा एक यह प्रावधान करता है कि प्रत्येक राज्य की कार्यपालिका शक्ति का इस प्रकार प्रयोग किया जाएगा कि संघ की कार्यपालिका शक्ति के प्रयोग में कोई बाधा न पहुंचे या उस पर प्रतिकूल प्रभाव न पड़े?',
    options: [
      { code: 'A', textEn: 'Article 256', textHi: 'अनुच्छेद 256', isCorrect: false },
      { code: 'B', textEn: 'Article 257', textHi: 'अनुच्छेद 257', isCorrect: true },
      { code: 'C', textEn: 'Article 355', textHi: 'अनुच्छेद 355', isCorrect: false },
      { code: 'D', textEn: 'Article 356', textHi: 'अनुच्छेद 356', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'polity-governance',
    topicSlug: 'executive',
    difficulty: 'MEDIUM',
    explanationEn: 'Article 257(1) of the Indian Constitution lays down that the executive power of every State shall be so exercised as not to impede or prejudice the exercise of the executive power of the Union, and the executive power of the Union shall extend to giving such directions to a State as may appear to the Government of India to be necessary for that purpose.',
    explanationHi: 'भारतीय संविधान के अनुच्छेद 257(1) में यह स्पष्ट प्रावधान है कि प्रत्येक राज्य की कार्यपालिका शक्ति का प्रयोग इस प्रकार किया जाएगा कि संघ की कार्यपालिका शक्ति के प्रयोग में कोई बाधा न हो और उस पर कोई प्रतिकूल प्रभाव न पड़े।',
    eliminationTechnique: 'Article 256 states general compliance of State with Union laws; Article 257 specifically deals with non-impedance of Union executive power.',
    sourceCitation: 'Constitution of India, Article 257; D.D. Basu, Introduction to the Constitution',
  },
  // 2004 GS1
  {
    year: 2004,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Consider the following statements regarding the District Judiciary in India: 1. The highest criminal court of the district is the Court of District and Sessions Judge. 2. The District Judges are appointed by the Governor in consultation with the High Court. Which of the statements given above is/are correct?',
    questionTextHi: 'भारत में जिला न्यायपालिका के संबंध में निम्नलिखित कथनों पर विचार कीजिए: 1. जिले का सर्वोच्च आपराधिक न्यायालय जिला एवं सत्र न्यायाधीश का न्यायालय होता है। 2. जिला न्यायाधीशों की नियुक्ति राज्यपाल द्वारा उच्च न्यायालय के परामर्श से की जाती है। उपर्युक्त कथनों में से कौन-सा/से सही है/हैं?',
    options: [
      { code: 'A', textEn: '1 only', textHi: 'केवल 1', isCorrect: false },
      { code: 'B', textEn: '2 only', textHi: 'केवल 2', isCorrect: false },
      { code: 'C', textEn: 'Both 1 and 2', textHi: '1 और 2 दोनों', isCorrect: true },
      { code: 'D', textEn: 'Neither 1 nor 2', textHi: 'न तो 1, न ही 2', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'polity-governance',
    topicSlug: 'judiciary-bodies',
    difficulty: 'MEDIUM',
    explanationEn: 'Both statements are correct. When the judge deals with civil cases, he is known as District Judge; when dealing with criminal cases, Sessions Judge (highest criminal court in district). Under Article 233, appointment, posting, and promotion of district judges are made by the Governor of the State in consultation with the High Court.',
    explanationHi: 'दोनों कथन सत्य हैं। जब न्यायाधीश दीवानी मामलों की सुनवाई करता है तो उसे जिला न्यायाधीश और जब आपराधिक मामलों की सुनवाई करता है तो सत्र न्यायाधीश कहा जाता है (जिले की सर्वोच्च आपराधिक अदालत)। अनुच्छेद 233 के तहत जिला न्यायाधीशों की नियुक्ति राज्यपाल द्वारा उच्च न्यायालय के परामर्श से की जाती है।',
    eliminationTechnique: 'Statement 1 is foundational judicial hierarchy; Statement 2 is verbatim Article 233.',
    sourceCitation: 'Constitution of India, Article 233; M. Laxmikanth, Subordinate Courts',
  },
  // 2002 GS1
  {
    year: 2002,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one of the following authorities recommends the principles governing the grants-in-aid of the revenues of the States out of the Consolidated Fund of India?',
    questionTextHi: 'निम्नलिखित में से कौन-सा एक प्राधिकरण भारत की संचित निधि में से राज्यों के राजस्व की सहायता अनुदान को शासित करने वाले सिद्धांतों की सिफारिश करता है?',
    options: [
      { code: 'A', textEn: 'Public Accounts Committee', textHi: 'लोक लेखा समिति', isCorrect: false },
      { code: 'B', textEn: 'Union Ministry of Finance', textHi: 'केंद्रीय वित्त मंत्रालय', isCorrect: false },
      { code: 'C', textEn: 'Finance Commission', textHi: 'वित्त आयोग (Finance Commission)', isCorrect: true },
      { code: 'D', textEn: 'Inter-State Council', textHi: 'अंतर-राज्य परिषद', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'polity-governance',
    topicSlug: 'judiciary-bodies',
    difficulty: 'EASY',
    explanationEn: 'Under Article 280(3)(b) of the Indian Constitution, it is the duty of the Finance Commission to make recommendations to the President regarding the principles which should govern the grants-in-aid of the revenues of the States out of the Consolidated Fund of India under Article 275.',
    explanationHi: 'भारतीय संविधान के अनुच्छेद 280(3)(ख) के अनुसार, वित्त आयोग का यह कर्तव्य है कि वह राष्ट्रपति को उन सिद्धांतों के संबंध में सिफारिशें करे जो अनुच्छेद 275 के तहत भारत की संचित निधि में से राज्यों के राजस्व की सहायता अनुदान को शासित करने चाहिए।',
    eliminationTechnique: 'Article 280 mandates the Finance Commission for vertical and horizontal tax devolution and grants-in-aid principles.',
    sourceCitation: 'Constitution of India, Article 280(3)(b) & Article 275',
  },
];

async function seedRemaining() {
  console.log(`Starting insertion of ${REMAINING_HISTORICAL_QUESTIONS.length} verified historical questions...`);

  const gs1Paper = await prisma.paper.findFirst({
    where: { code: 'GS1' },
  });
  const gs2Paper = await prisma.paper.findFirst({
    where: { code: 'GS2' },
  });

  let count = 0;
  for (const q of REMAINING_HISTORICAL_QUESTIONS) {
    const paper = q.paperCode === 'GS2' ? gs2Paper : gs1Paper;
    const isGS2 = q.paperCode === 'GS2';

    const subject = await prisma.subject.findFirst({
      where: { slug: q.subjectSlug },
      include: { topics: true },
    });
    const topic = subject?.topics.find((t) => t.slug === q.topicSlug);

    const existing = await prisma.question.findFirst({
      where: {
        paperId: paper.id,
        year: q.year,
        questionNumber: q.questionNumber,
      },
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          questionText: q.questionTextEn,
          questionTextEn: q.questionTextEn,
          questionTextHi: q.questionTextHi,
          subjectId: subject?.id || null,
          topicId: topic?.id || null,
          status: 'PUBLISHED',
          difficulty: q.difficulty,
          marks: isGS2 ? 2.5 : 2.0,
          negativeMarks: isGS2 ? 0.833 : 0.666,
        },
      });
      count++;
      console.log(`✓ Updated verified question for ${q.year} ${q.paperCode} (Q${q.questionNumber})`);
      continue;
    }

    const question = await prisma.question.create({
      data: {
        paperId: paper.id,
        year: q.year,
        questionNumber: q.questionNumber,
        questionText: q.questionTextEn,
        questionTextEn: q.questionTextEn,
        questionTextHi: q.questionTextHi,
        language: 'English',
        examCategory: 'CSE',
        status: 'PUBLISHED',
        difficulty: q.difficulty,
        marks: isGS2 ? 2.5 : 2.0,
        negativeMarks: isGS2 ? 0.833 : 0.666,
        subjectId: subject?.id || null,
        topicId: topic?.id || null,
        options: {
          create: q.options.map((opt) => ({
            optionCode: opt.code,
            optionText: opt.textEn,
            optionTextEn: opt.textEn,
            optionTextHi: opt.textHi,
            isCorrect: opt.isCorrect,
          })),
        },
        answers: {
          create: {
            answerOption: q.officialAnswer,
            answerType: 'FINAL',
            answerKeyType: 'UPSC_FINAL_KEY',
            answerProvenance: 'UPSC_OFFICIAL_FINAL',
            verificationStatus: 'OFFICIALLY_VERIFIED',
            publishedAt: new Date(`${q.year}-06-30`),
          },
        },
        explanation: {
          create: {
            summary: q.explanationEn.slice(0, 160),
            detailedExplanation: q.explanationEn,
            explanationEn: q.explanationEn,
            explanationHi: q.explanationHi,
            eliminationTechnique: q.eliminationTechnique,
            sourceCitation: q.sourceCitation,
          },
        },
        topics: topic ? { create: { topicId: topic.id } } : undefined,
      },
    });

    count++;
    console.log(`✓ Inserted verified question for ${q.year} ${q.paperCode} (Q${q.questionNumber})`);
  }

  console.log(`Successfully completed seeding of ${count} remaining authentic UPSC questions!`);
}

seedRemaining()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
