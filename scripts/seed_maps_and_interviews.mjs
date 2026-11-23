import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Map Features and Interview Bank...");

  // 1. Seed Map Features
  const mapFeatures = [
    {
      name: "Keibul Lamjao National Park",
      nameHi: "केबुल लामजाओ राष्ट्रीय उद्यान",
      category: "NATIONAL_PARK",
      stateOrCountry: "Manipur",
      latitude: 24.505,
      longitude: 93.858,
      keyFacts:
        "The world's only floating national park, located on Loktak Lake. Characterized by floating decomposed plant matter known as 'phumdis'. Exclusive natural habitat of the endangered Eld's deer / Sangai (Rucervus eldii eldii).",
      keyFactsHi:
        "विश्व का एकमात्र तैरता हुआ राष्ट्रीय उद्यान, जो लोकतक झील पर स्थित है। यह 'फुमदी' नामक तैरते हुए वनस्पति द्वीपों के लिए प्रसिद्ध है। संकटग्रस्त संगाई हिरण का एकमात्र प्राकृतिक आवास।",
      upscReference: "UPSC CSE Prelims 2015 & 2019",
    },
    {
      name: "Namdapha National Park",
      nameHi: "नामदाफा राष्ट्रीय उद्यान",
      category: "NATIONAL_PARK",
      stateOrCountry: "Arunachal Pradesh",
      latitude: 27.498,
      longitude: 96.388,
      keyFacts:
        "Biodiversity hotspot in Changlang district near the Myanmar border. Famous for harboring four pantherine big cat species: Tiger, Leopard, Snow Leopard, and Clouded Leopard.",
      keyFactsHi:
        "अरुणाचल प्रदेश के चांगलांग जिले में स्थित जैव विविधता हॉटस्पॉट। चार बड़ी बिल्ली प्रजातियों (बाघ, तेंदुआ, हिम तेंदुआ और क्लाउडेड तेंदुआ) का आवास।",
      upscReference: "UPSC CSE Prelims 2013 & 2021",
    },
    {
      name: "Dhuandhar Falls & Narmada Gorge",
      nameHi: "धुआंधार जलप्रपात एवं नर्मदा महाखड्ड",
      category: "RIVER",
      stateOrCountry: "Madhya Pradesh",
      latitude: 23.13,
      longitude: 79.805,
      keyFacts:
        "Cascades on the Narmada River at Bhedaghat near Jabalpur through world-renowned white marble rocks. Falls within the Narmada rift valley, not in the Malwa plateau.",
      keyFactsHi:
        "जबलपुर के निकट भेड़ाघाट में नर्मदा नदी पर स्थित जलप्रपात जो संगमरमर की चट्टानों से होकर बहता है। यह नर्मदा भ्रंश घाटी में स्थित है, मालवा पठार में नहीं।",
      upscReference: "UPSC CSE Prelims 2024 Series A Q12",
    },
    {
      name: "Hundru Falls",
      nameHi: "हुंडरू जलप्रपात",
      category: "RIVER",
      stateOrCountry: "Jharkhand",
      latitude: 23.45,
      longitude: 85.655,
      keyFacts:
        "Located on the Subarnarekha River on the Ranchi Plateau of the Chota Nagpur region. Features a scenic 98-meter drop forming knickpoint topography.",
      keyFactsHi:
        "छोटा नागपुर पठार के रांची क्षेत्र में सुवर्णरेखा नदी पर स्थित 98 मीटर ऊंचा जलप्रपात।",
      upscReference: "UPSC CSE Prelims 2024 Series A Q12",
    },
    {
      name: "Gersoppa (Jog) Falls",
      nameHi: "गेरसोप्पा (जोग) जलप्रपात",
      category: "RIVER",
      stateOrCountry: "Karnataka",
      latitude: 14.228,
      longitude: 74.812,
      keyFacts:
        "Segmented waterfall formed by the Sharavati River in the Western Ghats (Shivamogga district). It drops 253 meters in four distinct cascades: Raja, Roarer, Rocket, and Rani. Not formed by the Netravati.",
      keyFactsHi:
        "पश्चिमी घाट में शिमोगा जिले में शरावती नदी द्वारा निर्मित 253 मीटर ऊंचा जलप्रपात (राजा, रोअरर, रॉकेट और रानी)। यह नेत्रावती नदी पर नहीं है।",
      upscReference: "UPSC CSE Prelims 2024 Series A Q12",
    },
    {
      name: "Bab-el-Mandeb Strait",
      nameHi: "बाब-अल-मंदेब जलडमरूमध्य",
      category: "STRAIT",
      stateOrCountry: "Red Sea / Gulf of Aden",
      latitude: 12.583,
      longitude: 43.333,
      keyFacts:
        "Crucial maritime chokepoint between the Arabian Peninsula (Yemen) and the Horn of Africa (Djibouti and Eritrea). Connects the Red Sea to the Gulf of Aden and the Arabian Sea.",
      keyFactsHi:
        "यमन (अरब प्रायद्वीप) और जिबूती/इरिट्रिया (हॉर्न ऑफ अफ्रीका) के बीच स्थित प्रमुख समुद्री चोकपॉइंट जो लाल सागर को अदन की खाड़ी से जोड़ता है।",
      upscReference: "UPSC CSE Prelims 2018 & 2023",
    },
    {
      name: "Strait of Hormuz",
      nameHi: "हॉर्मुज जलडमरूमध्य",
      category: "STRAIT",
      stateOrCountry: "Persian Gulf / Gulf of Oman",
      latitude: 26.566,
      longitude: 56.25,
      keyFacts:
        "Strategically vital channel between Iran and Oman/UAE connecting the Persian Gulf with the Gulf of Oman. Transits approximately one-fifth of the world's petroleum consumption.",
      keyFactsHi:
        "ईरान और ओमान/यूएई के बीच स्थित सामरिक जलडमरूमध्य जो फारस की खाड़ी को ओमान की खाड़ी से जोड़ता है।",
      upscReference: "UPSC CSE Prelims 2020 & 2022",
    },
    {
      name: "Agasthyamala Biosphere Reserve",
      nameHi: "अगस्त्यमलाई बायोस्फीयर रिजर्व",
      category: "BIOSPHERE_RESERVE",
      stateOrCountry: "Kerala / Tamil Nadu",
      latitude: 8.65,
      longitude: 77.25,
      keyFacts:
        "Located at the southern end of the Western Ghats straddling Kerala and Tamil Nadu. Encompasses Neyyar, Peppara, and Shendurney Wildlife Sanctuaries and the Kalakkad Mundanthurai Tiger Reserve. Home to the indigenous Kani tribe.",
      keyFactsHi:
        "केरल और तमिलनाडु में फैला दक्षिणी पश्चिमी घाट का बायोस्फीयर रिजर्व। इसमें नेय्यर, पेप्पारा, शेंदुरनी अभयारण्य शामिल हैं। कानी जनजाति का पारंपरिक निवास।",
      upscReference: "UPSC CSE Prelims 2019 Q1",
    },
    {
      name: "Pulicat Lake",
      nameHi: "पुलिकट झील",
      category: "RAMSAR_SITE",
      stateOrCountry: "Andhra Pradesh / Tamil Nadu",
      latitude: 13.55,
      longitude: 80.2,
      keyFacts:
        "The second largest brackish-water lagoon in India after Chilika Lake. Separated from the Bay of Bengal by the barrier island of Sriharikota. Renowned for winter flamingo concentrations.",
      keyFactsHi:
        "चिल्का झील के बाद भारत की दूसरी सबसे बड़ी खारे पानी की लैगून झील। श्रीहरिकोटा द्वीप द्वारा बंगाल की खाड़ी से अलग होती है। राजहंस (फ्लेमिंगो) का शीतकालीन स्थल।",
      upscReference: "UPSC CSE Prelims 2017 & 2022",
    },
    {
      name: "Zoji La Pass",
      nameHi: "ज़ोजिला दर्रा",
      category: "MOUNTAIN_PASS",
      stateOrCountry: "Ladakh / Jammu & Kashmir",
      latitude: 34.28,
      longitude: 75.52,
      keyFacts:
        "High mountain pass in the Himalayas on NH-1 connecting Srinagar to Leh through the Dras valley. Crucial strategic lifeline for defense logistics in Western Ladakh.",
      keyFactsHi:
        "हिमालय में श्रीनगर और लेह (द्रास घाटी के माध्यम से) को जोड़ने वाला महत्वपूर्ण रणनीतिक दर्रा।",
      upscReference: "UPSC CSE Prelims 2016 & 2020",
    },
  ];

  for (const f of mapFeatures) {
    const existing = await prisma.mapFeature.findFirst({
      where: { name: f.name },
    });
    if (!existing) {
      await prisma.mapFeature.create({ data: f });
    }
  }
  console.log(`✅ Seeded ${mapFeatures.length} authentic Map Features.`);

  // 2. Seed Interview & Personality Test Bank
  const interviewQuestions = [
    {
      questionTextEn:
        "You are serving as a District Magistrate in a multi-community district. Two rival religious groups have scheduled large religious processions along the exact same narrow market corridor on the same afternoon. How would you handle permissions and ensure communal peace without causing allegations of administrative bias?",
      questionTextHi:
        "आप एक संवेदनशील जिले में जिलाधिकारी के रूप में कार्यरत हैं। दो अलग-अलग समुदायों ने एक ही दोपहर एक ही संकरे मार्ग पर धार्मिक जुलूस निकालने की अनुमति मांगी है। प्रशासनिक निष्पक्षता बनाए रखते हुए आप शांति और कानून-व्यवस्था कैसे सुनिश्चित करेंगे?",
      contextEn:
        "Situational Judgement: Balancing Fundamental Freedom of Religion (Article 25) with Public Order, Decency and Morality under Section 144 CrPC / BNSS provisions.",
      contextHi:
        "स्थितिगत निर्णय: अनुच्छेद 25 के तहत धार्मिक स्वतंत्रता और लोक व्यवस्था बनाए रखने के बीच संतुलन।",
      sourceType: "SITUATIONAL",
      sourceAttribution: "UPSC Interview Board Situational Framework",
      year: 2023,
      topic: "Public Administration & Law and Order",
      tags: "Situational Judgement,Public Administration,Ethical Dilemma",
      frameworkGuidance:
        "1. Prioritize preventive dialogue: Convene an urgent Peace Committee meeting with community elders.\n2. Propose staggered timing slots or alternate sanctioned routes with consensus.\n3. Transparent documentation and video surveillance to eliminate perceptions of bias.\n4. Deploy adequate rapid action forces as a deterrence without provocative posture.",
      frameworkGuidanceHi:
        "1. शांति समिति की बैठक बुलाकर संवाद स्थापित करना।\n2. समय अंतराल या वैकल्पिक मार्ग का सर्वसम्मत समाधान।\n3. निष्पक्षता हेतु पारदर्शी वीडियोग्राफी।",
    },
    {
      questionTextEn:
        "As an engineering graduate, you have spent 4 years studying technical design. Will joining the Civil Services not be a misallocation of specialized national investment, given that you could have contributed directly to technical innovation?",
      questionTextHi:
        "एक इंजीनियरिंग स्नातक के रूप में आपने 4 वर्ष तकनीकी शिक्षा प्राप्त की। क्या सिविल सेवा में आना विशेषीकृत राष्ट्रीय निवेश का विचलन नहीं है, जबकि आप तकनीकी नवाचार में योगदान दे सकते थे?",
      contextEn:
        "DAF Education: Justifying career transition from engineering / medicine / corporate to Indian Administrative / Police Service.",
      contextHi:
        "डीएएफ शिक्षा: तकनीकी पृष्ठभूमि से सिविल सेवा में परिवर्तन का औचित्य।",
      sourceType: "DAF_THEME",
      sourceAttribution: "Candidate Reported — Civil Services Interview 2022",
      year: 2022,
      topic: "Education & Career Motivation",
      tags: "DAF,Education,Work Experience",
      frameworkGuidance:
        "1. Acknowledge the premise gracefully: Engineering teaches systems thinking, data-driven diagnostics, and algorithmic problem-solving.\n2. Civil administration today is deeply digital (e-governance, Direct Benefit Transfer, cybersecurity, infrastructure audits).\n3. Technical rigor enhances policy implementation scale and prevents procurement leakages.",
      frameworkGuidanceHi:
        "1. इंजीनियरिंग की विश्लेषणात्मक और तार्किक समस्या समाधान क्षमता का प्रशासन में उपयोग।\n2. डिजिटल इंडिया, डीबीटी और ई-गवर्नेंस में तकनीकी दक्षता का सीधा लाभ।",
    },
    {
      questionTextEn:
        "Your home state faces perennial floods in the north and chronic drought in the southern plateau. As an administrator, what structural and non-structural water management interventions would you prioritize over the next decade?",
      questionTextHi:
        "आपके गृह राज्य में उत्तरी भाग में बार-बार बाढ़ और दक्षिणी पठार में गंभीर सूखे की स्थिति रहती है। एक प्रशासक के रूप में आप अगले दशक के लिए किन संरचनात्मक और गैर-संरचनात्मक जल प्रबंधन उपायों को प्राथमिकता देंगे?",
      contextEn:
        "DAF Home State / District: Geographic disaster management and regional developmental disparities.",
      contextHi:
        "डीएएफ गृह राज्य: आपदा प्रबंधन और क्षेत्रीय असमानता।",
      sourceType: "CANDIDATE_REPORTED",
      sourceAttribution: "Candidate Reported — UPSC CSE Interview 2023",
      year: 2023,
      topic: "Home State & Disaster Management",
      tags: "DAF,Home State,District,Disaster Management",
      frameworkGuidance:
        "1. Structural: Watershed management, de-silting of irrigation canals, check-dams, inter-basin floodwater harvesting.\n2. Non-structural: Floodplain zoning regulations, crop diversification toward millets in arid tracts, micro-irrigation subsidies.\n3. Institutional: Community water user associations (Pani Panchayats).",
      frameworkGuidanceHi:
        "1. संरचनात्मक: चेक डैम, गाद निकालना, जल संचयन।\n2. गैर-संरचनात्मक: बाढ़ क्षेत्र जोनिंग, मोटे अनाज की खेती, ड्रिप सिंचाई।",
    },
    {
      questionTextEn:
        "A senior political executive requests you to clear a procurement tender file where the lowest bidder does not meet essential technical specifications. If you refuse, you face immediate punitive transfer to a remote posting. How will you navigate this situation?",
      questionTextHi:
        "एक वरिष्ठ राजनीतिक पदाधिकारी आपसे एक ऐसी निविदा फाइल पास करने का अनुरोध करते हैं जिसमें सबसे कम बोली लगाने वाला तकनीकी मानकों को पूरा नहीं करता। इनकार करने पर दूरस्थ स्थानांतरण की संभावना है। आप क्या करेंगे?",
      contextEn:
        "Ethical Dilemma: Civil service neutrality, probity in public procurement, and Article 311 constitutional safeguards.",
      contextHi:
        "नैतिक दुविधा: सिविल सेवा तटस्थता और सार्वजनिक खरीद में सत्यनिष्ठा।",
      sourceType: "SITUATIONAL",
      sourceAttribution: "Ethics & Public Administration Interview Module",
      year: 2024,
      topic: "Ethics & Probity in Governance",
      tags: "Ethical Dilemma,Public Administration,Situational Judgement",
      frameworkGuidance:
        "1. Stand firm on institutional integrity: Note objections factually and politely on the official file with reference to CVC guidelines and GFR rules.\n2. Explain legal liabilities and audit implications to the executive in writing.\n3. Never append an illegal signature; accept transfer if unavoidable with professional dignity.",
      frameworkGuidanceHi:
        "1. सीवीसी और जीएफआर नियमों के अनुसार फाइल पर स्पष्ट और तथ्यात्मक आपत्ति दर्ज करना।\n2. गैरकानूनी आदेश पर हस्ताक्षर न करना; स्थानांतरण को मर्यादापूर्वक स्वीकार करना।",
    },
    {
      questionTextEn:
        "With the rapid rise of Generative AI, there are concerns regarding deepfakes and automated disinformation in electoral democracies. How should a developing democracy regulate AI without stifling technological innovation and startup growth?",
      questionTextHi:
        "जनरेटिव एआई के प्रसार के साथ चुनावी लोकतंत्र में डीपफेक और भ्रामक सूचनाओं को लेकर चिंताएं बढ़ रही हैं। एक विकासशील लोकतंत्र को नवाचार को रोके बिना एआई को कैसे विनियमित करना चाहिए?",
      contextEn:
        "Current Affairs: Tech policy, Digital Personal Data Protection Act 2023, and global AI governance frameworks (EU AI Act vs US Executive Order).",
      contextHi:
        "समसामयिकी: तकनीकी नीति, डेटा संरक्षण अधिनियम 2023 और वैश्विक एआई विनियमन।",
      sourceType: "CANDIDATE_REPORTED",
      sourceAttribution: "Candidate Reported — Civil Services Interview 2024",
      year: 2024,
      topic: "Current Affairs & Technology Policy",
      tags: "Current Affairs,Technology Policy,Information Technology",
      frameworkGuidance:
        "1. Adopt a risk-based tiering approach: High-risk areas (elections, biometric identification) require strict watermarking and auditing.\n2. Low-risk applications (productivity, education) remain light-touch to encourage startup R&D.\n3. Implement mandatory provenance metadata (cryptographic watermarks) for synthetic media.",
      frameworkGuidanceHi:
        "1. जोखिम-आधारित विनियमन (उच्च जोखिम बनाम कम जोखिम)।\n2. सिंथेटिक मीडिया के लिए क्रिप्टोग्राफिक वॉटरमार्किंग अनिवार्य करना।",
    },
  ];

  for (const q of interviewQuestions) {
    const existing = await prisma.interviewQuestion.findFirst({
      where: { questionTextEn: q.questionTextEn },
    });
    if (!existing) {
      await prisma.interviewQuestion.create({ data: q });
    }
  }
  console.log(`✅ Seeded ${interviewQuestions.length} authentic Interview & Personality Test Questions.`);
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
