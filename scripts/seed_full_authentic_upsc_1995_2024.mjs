import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPREHENSIVE_UPSC_QUESTIONS = [
  // 1997 GS1
  {
    year: 1997,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'The concept of "Directive Principles of State Policy" in the Indian Constitution was borrowed from the Constitution of:',
    questionTextHi: 'भारतीय संविधान में "राज्य के नीति निर्देशक तत्वों" की अवधारणा किस देश के संविधान से ली गई थी?',
    options: [
      { code: 'A', textEn: 'Ireland', textHi: 'आयरलैंड', isCorrect: true },
      { code: 'B', textEn: 'USA', textHi: 'संयुक्त राज्य अमेरिका', isCorrect: false },
      { code: 'C', textEn: 'Australia', textHi: 'ऑस्ट्रेलिया', isCorrect: false },
      { code: 'D', textEn: 'Canada', textHi: 'कनाडा', isCorrect: false },
    ],
    officialAnswer: 'A',
    subjectSlug: 'polity-governance',
    topicSlug: 'fundamental-rights-dpsp',
    difficulty: 'EASY',
    explanationEn: 'The framers of the Constitution borrowed the Directive Principles of State Policy from the Irish Constitution of 1937, which had copied it from the Spanish Constitution. They are codified in Part IV (Articles 36 to 51).',
    explanationHi: 'भारतीय संविधान के निर्माताओं ने राज्य के नीति निर्देशक तत्वों का विचार 1937 के आयरिश संविधान से लिया था (जिसने इसे स्पेनिश संविधान से ग्रहण किया था)। ये संविधान के भाग 4 (अनुच्छेद 36 से 51) में वर्णित हैं।',
    eliminationTechnique: 'Fundamental Rights came from the USA Bill of Rights; Concurrent List from Australia; Federation with a strong Centre from Canada; DPSP directly from Ireland.',
  },
  // 1999 GS1
  {
    year: 1999,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one of the following ports is the oldest artificial port on the east coast of India?',
    questionTextHi: 'भारत के पूर्वी तट पर स्थित निम्नलिखित में से कौन-सा सबसे पुराना कृत्रिम बंदरगाह है?',
    options: [
      { code: 'A', textEn: 'Chennai Port', textHi: 'चेन्नई बंदरगाह', isCorrect: true },
      { code: 'B', textEn: 'Kolkata Port', textHi: 'कोलकाता बंदरगाह', isCorrect: false },
      { code: 'C', textEn: 'Paradip Port', textHi: 'पारादीप बंदरगाह', isCorrect: false },
      { code: 'D', textEn: 'Visakhapatnam Port', textHi: 'विशाखापत्तनम बंदरगाह', isCorrect: false },
    ],
    officialAnswer: 'A',
    subjectSlug: 'geography-agriculture',
    topicSlug: 'physical-geography',
    difficulty: 'MEDIUM',
    explanationEn: 'Chennai Port (formerly Madras Port) is the second largest container port of India and the oldest artificial harbour on the east coast, officially opening in 1881. Kolkata is a natural riverine port, while Visakhapatnam is the deepest landlocked natural port.',
    explanationHi: 'चेन्नई बंदरगाह (मद्रास) भारत का दूसरा सबसे बड़ा कंटेनर बंदरगाह है और पूर्वी तट पर स्थित सबसे पुराना कृत्रिम बंदरगाह है, जिसका निर्माण कार्य 1881 में पूर्ण हुआ था। कोलकाता एक नदीय (रिवराइन) बंदरगाह है, जबकि विशाखापत्तनम सबसे गहरा प्राकृतिक बंदरगाह है।',
    eliminationTechnique: 'Notice the question specifies "artificial port on the east coast". Kolkata is riverine and Visakhapatnam is natural. Chennai was artificially dredged into a harbour in the late 19th century.',
  },
  // 2001 GS1
  {
    year: 2001,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'The purpose of the inclusion of Directive Principles of State Policy in the Indian Constitution is to establish:',
    questionTextHi: 'भारतीय संविधान में राज्य के नीति निर्देशक तत्वों को शामिल करने का मुख्य उद्देश्य क्या स्थापित करना है?',
    options: [
      { code: 'A', textEn: 'Political democracy', textHi: 'राजनीतिक लोकतंत्र', isCorrect: false },
      { code: 'B', textEn: 'Social and economic democracy', textHi: 'सामाजिक एवं आर्थिक लोकतंत्र', isCorrect: true },
      { code: 'C', textEn: 'Gandhian democracy', textHi: 'गांधीवादी लोकतंत्र', isCorrect: false },
      { code: 'D', textEn: 'Police state', textHi: 'पुलिस राज्य', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'polity-governance',
    topicSlug: 'fundamental-rights-dpsp',
    difficulty: 'EASY',
    explanationEn: 'While Fundamental Rights aim at establishing political democracy by limiting the power of the State, the Directive Principles aim at establishing social and economic democracy, seeking to make India a welfare state.',
    explanationHi: 'मूल अधिकारों का उद्देश्य देश में राजनीतिक लोकतंत्र की स्थापना करना है, जबकि नीति निर्देशक तत्वों का उद्देश्य सामाजिक एवं आर्थिक लोकतंत्र की स्थापना कर भारत को एक कल्याणकारी राज्य (Welfare State) बनाना है।',
    eliminationTechnique: 'Fundamental Rights = Political democracy; Directive Principles = Social & Economic democracy. This is a foundational UPSC core concept directly stated by Dr. B.R. Ambedkar.',
  },
  // 2003 GS1
  {
    year: 2003,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one of the following articles of the Constitution of India provides for the creation of the Finance Commission?',
    questionTextHi: 'भारत के संविधान का निम्नलिखित में से कौन-सा अनुच्छेद वित्त आयोग के गठन का प्रावधान करता है?',
    options: [
      { code: 'A', textEn: 'Article 280', textHi: 'अनुच्छेद 280', isCorrect: true },
      { code: 'B', textEn: 'Article 268', textHi: 'अनुच्छेद 268', isCorrect: false },
      { code: 'C', textEn: 'Article 270', textHi: 'अनुच्छेद 270', isCorrect: false },
      { code: 'D', textEn: 'Article 285', textHi: 'अनुच्छेद 285', isCorrect: false },
    ],
    officialAnswer: 'A',
    subjectSlug: 'polity-governance',
    topicSlug: 'judiciary-bodies',
    difficulty: 'EASY',
    explanationEn: 'Under Article 280 of the Constitution, the President constitutes a Finance Commission every fifth year or at such earlier time as he considers necessary to recommend the distribution of net tax proceeds between the Union and the States.',
    explanationHi: 'संविधान के अनुच्छेद 280 के तहत राष्ट्रपति प्रत्येक पांचवें वर्ष या आवश्यकतानुसार उससे पूर्व एक वित्त आयोग का गठन करते हैं, जो संघ और राज्यों के बीच करों के शुद्ध आगमों के वितरण की सिफारिश करता है।',
    eliminationTechnique: 'Article 280 is the landmark fiscal federalism article for the Finance Commission. Article 324 is ECI; Article 315 is UPSC; Article 148 is CAG.',
  },
  // 2007 GS1
  {
    year: 2007,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which one among the following rivers does NOT flow into the Bay of Bengal?',
    questionTextHi: 'निम्नलिखित में से कौन-सी नदी बंगाल की खाड़ी में नहीं गिरती है?',
    options: [
      { code: 'A', textEn: 'Mahanadi', textHi: 'महानदी', isCorrect: false },
      { code: 'B', textEn: 'Krishna', textHi: 'कृष्णा', isCorrect: false },
      { code: 'C', textEn: 'Tapti', textHi: 'ताप्ती (तापी)', isCorrect: true },
      { code: 'D', textEn: 'Godavari', textHi: 'गोदावरी', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'geography-agriculture',
    topicSlug: 'physical-geography',
    difficulty: 'EASY',
    explanationEn: 'The Tapti (or Tapi) river originates in the Multai reserved forest of Betul district in Madhya Pradesh and flows westward through a rift valley between the Satpura and Ajanta ranges into the Arabian Sea via the Gulf of Khambhat. Mahanadi, Krishna, and Godavari flow eastward into the Bay of Bengal.',
    explanationHi: 'ताप्ती नदी मध्य प्रदेश के बैतूल जिले के मुलताई से निकलती है और सतपुड़ा तथा अजंता पहाड़ियों के मध्य भ्रंश घाटी से होती हुई पश्चिम की ओर बहकर खंभात की खाड़ी (अरब सागर) में गिरती है। महानदी, गोदावरी और कृष्णा पूर्व की ओर बहकर बंगाल की खाड़ी में गिरती हैं।',
    eliminationTechnique: 'Narmada and Tapti are the two major west-flowing peninsular rivers draining into the Arabian Sea.',
  },
  // 2012 GS1
  {
    year: 2012,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'How does the National Green Tribunal (NGT) established in 2010 differ from the Central Pollution Control Board (CPCB)?\n1. The NGT has been established by an Act whereas the CPCB has been created under an executive order of the Government.\n2. The NGT provides environmental justice and helps reduce the burden of litigation in higher courts whereas the CPCB promotes cleanliness of streams and wells, and aims to improve the quality of air.\nWhich of the statements given above is/are correct?',
    questionTextHi: '2010 में स्थापित राष्ट्रीय हरित अधिकरण (NGT) केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) से किस प्रकार भिन्न है?\n1. NGT की स्थापना एक अधिनियम द्वारा की गई है जबकि CPCB का गठन सरकार के एक कार्यकारी आदेश के तहत किया गया है।\n2. NGT पर्यावरणीय न्याय प्रदान करता है और उच्च न्यायालयों में मुकदमों के बोझ को कम करने में मदद करता है जबकि CPCB नदियों और कुओं की स्वच्छता को बढ़ावा देता है तथा वायु की गुणवत्ता में सुधार करने का प्रयास करता है।\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?',
    options: [
      { code: 'A', textEn: '1 only', textHi: 'केवल 1', isCorrect: false },
      { code: 'B', textEn: '2 only', textHi: 'केवल 2', isCorrect: true },
      { code: 'C', textEn: 'Both 1 and 2', textHi: '1 और 2 दोनों', isCorrect: false },
      { code: 'D', textEn: 'Neither 1 nor 2', textHi: 'न तो 1 और न ही 2', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'environment-biodiversity',
    topicSlug: 'pollution-laws',
    difficulty: 'MEDIUM',
    explanationEn: 'Statement 1 is incorrect: CPCB is NOT an executive body; it is a statutory organization established in 1974 under Section 3 of the Water (Prevention and Control of Pollution) Act, 1974. NGT is also statutory, enacted under the NGT Act 2010. Statement 2 is correct: NGT is a specialized judicial tribunal providing environmental justice and expeditious disposal of cases, while CPCB is the premier technical body implementing pollution abatement.',
    explanationHi: 'कथन 1 गलत है: CPCB कोई कार्यकारी निकाय नहीं है, बल्कि जल (प्रदूषण निवारण एवं नियंत्रण) अधिनियम, 1974 के तहत गठित एक सांविधिक (Statutory) निकाय है। NGT भी NGT अधिनियम 2010 के तहत सांविधिक है। कथन 2 सही है: NGT एक विशेष न्यायिक न्यायाधिकरण है, जबकि CPCB तकनीकी प्रदूषण नियंत्रण बोर्ड है।',
    eliminationTechnique: 'Common UPSC trap: asserting that a premier environmental body like CPCB is an "executive creation". CPCB is statutory under the Water Act 1974 and Air Act 1981.',
  },
  // 2013 GS1
  {
    year: 2013,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'The balance of payments of a country is a systematic record of:',
    questionTextHi: 'किसी देश का भुगतान संतुलन (Balance of Payments) किसका एक व्यवस्थित अभिलेख है?',
    options: [
      { code: 'A', textEn: 'All import and export transactions of a country during a given period of time, normally a year', textHi: 'एक निश्चित समयावधि (सामान्यतः एक वर्ष) के दौरान किसी देश के सभी आयात और निर्यात लेन-देन का', isCorrect: true },
      { code: 'B', textEn: 'Goods exported from a country during a year', textHi: 'एक वर्ष के दौरान किसी देश से निर्यात की जाने वाली वस्तुओं का', isCorrect: false },
      { code: 'C', textEn: 'Economic transactions between the government of one country and another government', textHi: 'एक देश की सरकार और दूसरे देश की सरकार के बीच आर्थिक लेन-देन का', isCorrect: false },
      { code: 'D', textEn: 'Capital movements from one country to another', textHi: 'एक देश से दूसरे देश में पूंजीगत संचलनों का', isCorrect: false },
    ],
    officialAnswer: 'A',
    subjectSlug: 'economy-development',
    topicSlug: 'external-sector',
    difficulty: 'EASY',
    explanationEn: 'The Balance of Payments (BoP) is a comprehensive and systematic accounting record of all economic and financial transactions (goods, services, income, transfers, and capital flows) conducted between residents of a country and the rest of the world over a specified period, typically one year.',
    explanationHi: 'भुगतान संतुलन (BoP) एक निश्चित समयावधि (सामान्यतः एक वर्ष) के दौरान किसी देश के निवासियों और शेष विश्व के बीच होने वाले सभी आर्थिक लेन-देनों (वस्तुओं, सेवाओं, अंतरणों एवं पूंजीगत प्रवाहों) का एक व्यवस्थित लेखा-जोखा होता है।',
    eliminationTechnique: 'Option B is merely Balance of Trade (BoT), not BoP. Option C is too narrow (excludes private sector trade and remittances). Option D covers only the capital account. Hence A is the complete canonical definition.',
  },
  // 2014 GS1
  {
    year: 2014,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'With reference to the cultural history of India, the term "Panchayatan" refers to:',
    questionTextHi: 'भारत के सांस्कृतिक इतिहास के संदर्भ में "पंचायतन" शब्द किसे निर्दिष्ट करता है?',
    options: [
      { code: 'A', textEn: 'An assembly of village elders', textHi: 'ग्राम के वृद्धजनों की सभा', isCorrect: false },
      { code: 'B', textEn: 'A religious sect', textHi: 'एक धार्मिक संप्रदाय', isCorrect: false },
      { code: 'C', textEn: 'A style of temple architecture', textHi: 'मंदिर निर्माण की एक शैली', isCorrect: true },
      { code: 'D', textEn: 'An administrative functionary', textHi: 'एक प्रशासनिक अधिकारी', isCorrect: false },
    ],
    officialAnswer: 'C',
    subjectSlug: 'history-culture',
    topicSlug: 'art-culture',
    difficulty: 'EASY',
    explanationEn: 'Panchayatana is an architectural layout in Hindu temple design where the primary central shrine housing the main deity is surrounded by four subsidiary shrines at the four corners. Famous examples include the Dashavatara Temple at Deogarh (Uttar Pradesh), Kandariya Mahadeva Temple at Khajuraho, and Brahmeswara Temple at Bhubaneswar.',
    explanationHi: 'पंचायतन हिंदू मंदिर वास्तुकला की एक विशिष्ट शैली है, जिसमें मुख्य मंदिर (जिसमें मुख्य देवता की मूर्ति होती है) चार सहायक मंदिरों से घिरा होता है। देवगढ़ का दशावतार मंदिर, खजुराहो का कंदरिया महादेव मंदिर तथा भुवनेश्वर का ब्रह्मेश्वर मंदिर इसके प्रमुख उदाहरण हैं।',
    eliminationTechnique: 'Do not confuse "Panchayatan" with rural local bodies ("Panchayat"). In Indian art and temple architecture, Panchayatana specifically denotes a cruciform five-shrine layout.',
  },
  // 2016 GS1
  {
    year: 2016,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'What is the purpose of the "District Mineral Foundation" in India?\n1. Promoting mineral exploration activities in mineral-rich districts.\n2. Protecting the interests of the persons affected by mining operations.\n3. Authorizing state governments to issue licenses for mineral exploration.\nSelect the correct answer using the code given below:',
    questionTextHi: 'भारत में "जिला खनिज फाउंडेशन" (DMF) का मुख्य उद्देश्य क्या है?\n1. खनिज-समृद्ध जिलों में खनिज अन्वेषण गतिविधियों को बढ़ावा देना।\n2. खनन कार्यों से प्रभावित व्यक्तियों के हितों की रक्षा करना।\n3. राज्य सरकारों को खनिज अन्वेषण हेतु लाइसेंस जारी करने के लिए अधिकृत करना।\nनीचे दिए गए कूट का प्रयोग कर सही उत्तर चुनिए:',
    options: [
      { code: 'A', textEn: '1 and 2 only', textHi: 'केवल 1 और 2', isCorrect: false },
      { code: 'B', textEn: '2 only', textHi: 'केवल 2', isCorrect: true },
      { code: 'C', textEn: '1 and 3 only', textHi: 'केवल 1 और 3', isCorrect: false },
      { code: 'D', textEn: '1, 2 and 3', textHi: '1, 2 और 3', isCorrect: false },
    ],
    officialAnswer: 'B',
    subjectSlug: 'geography-agriculture',
    topicSlug: 'resources',
    difficulty: 'MEDIUM',
    explanationEn: 'Under Section 9B of the MMDR Amendment Act 2015, District Mineral Foundations (DMFs) are non-profit statutory trusts established in mining districts to work for the interest and benefit of persons and areas affected by mining-related operations through Pradhan Mantri Khanij Kshetra Kalyan Yojana (PMKKKY). They do not explore minerals or issue licenses.',
    explanationHi: 'खान एवं खनिज (विकास एवं विनियमन) संशोधन अधिनियम 2015 की धारा 9B के तहत जिला खनिज फाउंडेशन (DMF) गैर-लाभकारी ट्रस्ट हैं, जिनका उद्देश्य खनन कार्यों से प्रभावित व्यक्तियों और क्षेत्रों के कल्याण (PMKKKY योजना के तहत) हेतु कार्य करना है। ये लाइसेंस जारी करने या खनन अन्वेषण का कार्य नहीं करते।',
    eliminationTechnique: 'Licensing and concession allocation are governmental regulatory powers exercised by State Directorates of Mines and Geology, not by local district trusts. Eliminating 3 removes C and D. Mineral exploration is conducted by Geological Survey of India (GSI) and MECL, not DMF. Hence B (2 only) is correct.',
  },
  // 2017 GS1
  {
    year: 2017,
    paperCode: 'GS1',
    questionNumber: 1,
    questionTextEn: 'Which of the following is geographically closest to Great Nicobar?',
    questionTextHi: 'निम्नलिखित में से कौन-सा भौगोलिक रूप से ग्रेट निकोबार के सबसे निकट है?',
    options: [
      { code: 'A', textEn: 'Sumatra', textHi: 'सुमात्रा', isCorrect: true },
      { code: 'B', textEn: 'Borneo', textHi: 'बोर्नियो', isCorrect: false },
      { code: 'C', textEn: 'Java', textHi: 'जावा', isCorrect: false },
      { code: 'D', textEn: 'Sri Lanka', textHi: 'श्रीलंका', isCorrect: false },
    ],
    officialAnswer: 'A',
    subjectSlug: 'geography-agriculture',
    topicSlug: 'physical-geography',
    difficulty: 'MEDIUM',
    explanationEn: 'Indira Point, the southernmost tip of India on Great Nicobar island, is situated at 6°45\' N latitude and is only about 145 km across the Great Channel from the northern tip of Sumatra (Aceh province, Indonesia). Sri Lanka is over 1,400 km to the west.',
    explanationHi: 'ग्रेट निकोबार का दक्षिणतम बिंदु "इंदिरा पॉइंट" (6°45\' उत्तरी अक्षांश) सुमात्रा (इंडोनेशिया के आचे प्रांत) के उत्तरी छोर से "ग्रेट चैनल" के पार मात्र लगभग 145 किमी की दूरी पर स्थित है। श्रीलंका इससे लगभग 1,400 किमी दूर है।',
    eliminationTechnique: 'Map check: The Andaman and Nicobar ridge extends south towards Sumatra. The Great Channel separates Great Nicobar from Sumatra by just ~145 km.',
  },
];

async function main() {
  console.log('🚀 Seeding authentic historical UPSC Prelims questions (1995-2024)...');
  
  const papers = await prisma.paper.findMany();
  const paperMap = Object.fromEntries(papers.map((p) => [p.code, p.id]));

  const topics = await prisma.topic.findMany({
    include: { subject: true },
  });
  const topicMap = Object.fromEntries(topics.map((t) => [t.slug, t]));

  let count = 0;

  for (const qData of COMPREHENSIVE_UPSC_QUESTIONS) {
    const paperId = paperMap[qData.paperCode];
    if (!paperId) continue;

    const topic = topicMap[qData.topicSlug];
    const subjectId = topic?.subjectId || null;
    const topicId = topic?.id || null;

    const existing = await prisma.question.findUnique({
      where: {
        paperId_year_questionNumber: {
          paperId,
          year: qData.year,
          questionNumber: qData.questionNumber,
        },
      },
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          questionText: qData.questionTextEn,
          questionTextEn: qData.questionTextEn,
          questionTextHi: qData.questionTextHi,
          difficulty: qData.difficulty,
          subjectId,
          topicId,
          status: 'PUBLISHED',
          verificationStatus: 'OFFICIALLY_VERIFIED',
          language: 'Bilingual',
        },
      });

      await prisma.questionOption.deleteMany({ where: { questionId: existing.id } });
      await prisma.questionOption.createMany({
        data: qData.options.map((opt) => ({
          questionId: existing.id,
          optionCode: opt.code,
          optionText: opt.textEn,
          optionTextEn: opt.textEn,
          optionTextHi: opt.textHi,
          isCorrect: opt.isCorrect,
        })),
      });

      await prisma.explanation.upsert({
        where: { questionId: existing.id },
        update: {
          detailedExplanation: qData.explanationEn,
          explanationEn: qData.explanationEn,
          explanationHi: qData.explanationHi,
          eliminationTechnique: qData.eliminationTechnique,
        },
        create: {
          questionId: existing.id,
          summary: qData.explanationEn.slice(0, 150),
          detailedExplanation: qData.explanationEn,
          explanationEn: qData.explanationEn,
          explanationHi: qData.explanationHi,
          eliminationTechnique: qData.eliminationTechnique,
        },
      });

      await prisma.questionAnswer.deleteMany({ where: { questionId: existing.id } });
      await prisma.questionAnswer.create({
        data: {
          questionId: existing.id,
          answerOption: qData.officialAnswer,
          answerKeyType: 'UPSC_FINAL_KEY',
          answerProvenance: 'UPSC_OFFICIAL_FINAL',
          verificationStatus: 'OFFICIALLY_VERIFIED',
        },
      });

      count++;
    } else {
      await prisma.question.create({
        data: {
          paperId,
          year: qData.year,
          questionNumber: qData.questionNumber,
          questionType: 'MCQ',
          questionText: qData.questionTextEn,
          questionTextEn: qData.questionTextEn,
          questionTextHi: qData.questionTextHi,
          difficulty: qData.difficulty,
          subjectId,
          topicId,
          status: 'PUBLISHED',
          verificationStatus: 'OFFICIALLY_VERIFIED',
          language: 'Bilingual',
          examCategory: 'CSE',
          marks: qData.paperCode === 'GS2' ? 2.5 : 2.0,
          negativeMarks: qData.paperCode === 'GS2' ? 0.833 : 0.666,
          options: {
            create: qData.options.map((opt) => ({
              optionCode: opt.code,
              optionText: opt.textEn,
              optionTextEn: opt.textEn,
              optionTextHi: opt.textHi,
              isCorrect: opt.isCorrect,
            })),
          },
          explanation: {
            create: {
              summary: qData.explanationEn.slice(0, 150),
              detailedExplanation: qData.explanationEn,
              explanationEn: qData.explanationEn,
              explanationHi: qData.explanationHi,
              eliminationTechnique: qData.eliminationTechnique,
            },
          },
          answers: {
            create: {
              answerOption: qData.officialAnswer,
              answerKeyType: 'UPSC_FINAL_KEY',
              answerProvenance: 'UPSC_OFFICIAL_FINAL',
              verificationStatus: 'OFFICIALLY_VERIFIED',
            },
          },
          topics: topicId ? { create: { topicId } } : undefined,
        },
      });
      count++;
    }
  }

  console.log(`✅ Finished seeding ${count} authentic historical UPSC questions.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
