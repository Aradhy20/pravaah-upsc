/**
 * PRAVAAH UPSC 2.0 — HINDI TECHNICAL GLOSSARY & BILINGUAL CONCEPT BRIDGE
 * 
 * Provides official bilingual translations and pedagogical contextualization
 * for high-frequency UPSC constitutional, administrative, economic, and environmental terms.
 */

export interface GlossaryTerm {
  termEn: string;
  termHi: string;
  transliteration?: string;
  category: "POLITY_AND_CONSTITUTION" | "ECONOMY" | "ENVIRONMENT" | "HISTORY_AND_CULTURE" | "ADMINISTRATION";
  definitionEn: string;
  definitionHi: string;
  relevantArticleOrLaw?: string;
  usageContext?: string;
}

export const UPSC_TECHNICAL_GLOSSARY: GlossaryTerm[] = [
  {
    termEn: "Writ of Habeas Corpus",
    termHi: "बंदी प्रत्यक्षीकरण",
    transliteration: "Bandi Pratyakshikaran",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "A prerogative constitutional writ issued by courts directing a detained individual to be produced before the bench to examine the lawfulness of detention.",
    definitionHi: "न्यायालय द्वारा जारी एक संवैधानिक रिट, जो किसी हिरासत में लिए गए व्यक्ति को न्यायालय के समक्ष प्रस्तुत करने का आदेश देती है ताकि हिरासत की वैधता की जांच की जा सके।",
    relevantArticleOrLaw: "Article 32 & Article 226",
    usageContext: "Fundamental rights protection against arbitrary unlawful executive detention."
  },
  {
    termEn: "Writ of Mandamus",
    termHi: "परमादेश",
    transliteration: "Paramadesh",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "A judicial command issued to a public official, statutory authority, or subordinate court compelling the performance of a mandatory public duty.",
    definitionHi: "एक न्यायिक आदेश जो किसी लोक अधिकारी, सांविधिक प्राधिकारी या अधीनस्थ न्यायालय को अनिवार्य सार्वजनिक कर्तव्य का पालन करने के लिए बाध्य करता है।",
    relevantArticleOrLaw: "Article 32 & Article 226",
    usageContext: "Enforcing statutory duties when an administrative authority fails or refuses to act."
  },
  {
    termEn: "Writ of Quo-Warranto",
    termHi: "अधिकार पृच्छा",
    transliteration: "Adhikar Prichha",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "A writ issued to prevent unlawful usurpation of a substantive public office by requiring the holder to show under what authority they hold office.",
    definitionHi: "किसी व्यक्ति द्वारा किसी सार्वजनिक पद को अवैध रूप से धारण करने से रोकने के लिए जारी की गई रिट, जिसमें उससे पूछा जाता है कि वह किस अधिकार के तहत पद पर बना हुआ है।",
    relevantArticleOrLaw: "Article 32 & Article 226",
    usageContext: "Preventing illegal usurpation of public offices created by the constitution or statute."
  },
  {
    termEn: "Fiscal Deficit",
    termHi: "राजकोषीय घाटा",
    transliteration: "Rajkoshiya Ghata",
    category: "ECONOMY",
    definitionEn: "The excess of total government expenditure over total receipts (excluding borrowings) in a financial year, indicating total borrowing requirement.",
    definitionHi: "किसी वित्तीय वर्ष में कुल सरकारी व्यय का कुल प्राप्तियों (उधार को छोड़कर) पर आधिक्य, जो सरकार की कुल ऋण आवश्यकता को दर्शाता है।",
    relevantArticleOrLaw: "FRBM Act, 2003",
    usageContext: "Macroeconomic stability metric and budget borrowing benchmark."
  },
  {
    termEn: "Gross Value Added (GVA)",
    termHi: "सकल मूल्य वर्धन",
    transliteration: "Sakal Mulya Vardhan",
    category: "ECONOMY",
    definitionEn: "The value of output minus the value of intermediate consumption; measuring sector-specific contribution to economic output at basic prices.",
    definitionHi: "उत्पादन के मूल्य में से मध्यवर्ती उपभोग के मूल्य को घटाने पर प्राप्त मूल्य; यह बुनियादी मूल्यों पर अर्थव्यवस्था के विभिन्न क्षेत्रों के योगदान को मापता है।",
    relevantArticleOrLaw: "CSO / MoSPI Methodology",
    usageContext: "GVA at basic prices = GDP at market prices - product taxes + product subsidies."
  },
  {
    termEn: "Judicial Review",
    termHi: "न्यायिक समीक्षा",
    transliteration: "Nyayik Samiksha",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "The inherent power of the higher judiciary to examine the constitutionality of legislative enactments and executive orders, invalidating those that violate fundamental rights or constitutional provisions.",
    definitionHi: "उच्च न्यायपालिका की वह अंतर्निहित शक्ति जिसके द्वारा वह विधायी अधिनियमों और कार्यकारी आदेशों की संवैधानिकता की जांच करती है तथा संविधान के विपरीत पाए जाने पर उन्हें शून्य घोषित करती है।",
    relevantArticleOrLaw: "Article 13, 32, 136, 142, 226",
    usageContext: "Basic structure doctrine component (Minerva Mills, Kesavananda Bharati)."
  },
  {
    termEn: "Biochemical Oxygen Demand (BOD)",
    termHi: "जैव रासायनिक ऑक्सीजन मांग",
    transliteration: "Jaiv Rasayanik Oxygen Maang",
    category: "ENVIRONMENT",
    definitionEn: "The amount of dissolved oxygen required by aerobic biological organisms to break down organic material present in a given water body at a certain temperature over a specific time period.",
    definitionHi: "किसी जल निकाय में उपस्थित कार्बनिक पदार्थों को निश्चित तापमान पर विघटित करने के लिए वायवीय सूक्ष्मजीवों द्वारा आवश्यक घुलित ऑक्सीजन की मात्रा।",
    relevantArticleOrLaw: "Water (Prevention and Control of Pollution) Act, 1974",
    usageContext: "Primary indicator of organic pollution in rivers and aquatic ecosystems."
  },
  {
    termEn: "Basic Structure Doctrine",
    termHi: "मूल संरचना सिद्धांत",
    transliteration: "Mool Sanrachna Siddhant",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "The judicial principle that certain fundamental features of the Constitution of India cannot be abrogated or destroyed through parliamentary constitutional amendments under Article 368.",
    definitionHi: "यह न्यायिक सिद्धांत कि संविधान के कुछ मूलभूत लक्षणों को अनुच्छेद 368 के तहत संसदीय संविधान संशोधनों के माध्यम से भी समाप्त या नष्ट नहीं किया जा सकता।",
    relevantArticleOrLaw: "Kesavananda Bharati v. State of Kerala (1973)",
    usageContext: "Includes supremacy of the constitution, rule of law, federalism, secularism, and separation of powers."
  },
  {
    termEn: "Primary Deficit",
    termHi: "प्राथमिक घाटा",
    transliteration: "Prathmik Ghata",
    category: "ECONOMY",
    definitionEn: "Fiscal deficit minus interest payments on past borrowings, measuring government borrowing needed for non-interest expenditure.",
    definitionHi: "राजकोषीय घाटे में से पिछले ऋणों पर किए जाने वाले ब्याज भुगतानों को घटाने पर प्राप्त राशि, जो ब्याज-मुक्त व्ययों के लिए आवश्यक सरकारी ऋण को दर्शाती है।",
    relevantArticleOrLaw: "Union Budget Statement",
    usageContext: "Indicates real current fiscal policy stance independent of past debt liabilities."
  },
  {
    termEn: "Doctrine of Severability",
    termHi: "पृथक्करणीयता का सिद्धांत",
    transliteration: "Prithakkaraneyata ka Siddhant",
    category: "POLITY_AND_CONSTITUTION",
    definitionEn: "The rule that if an unconstitutional provision of a statute can be severed from the valid provisions without altering the statutory intention, only the offending provision is invalidated.",
    definitionHi: "यह नियम कि यदि किसी कानून का असंवैधानिक भाग वैध भाग से इस प्रकार अलग किया जा सकता है कि कानून का मूल उद्देश्य प्रभावित न हो, तो केवल आपत्तिजनक भाग को ही अमान्य घोषित किया जाएगा।",
    relevantArticleOrLaw: "Article 13(1) and 13(2)",
    usageContext: "Applied in A.K. Gopalan and R.M.D. Chamarbaugwalla cases."
  }
];

export function searchGlossary(query: string, language: "en" | "hi" = "en"): GlossaryTerm[] {
  if (!query || query.trim().length === 0) return UPSC_TECHNICAL_GLOSSARY;
  const q = query.toLowerCase().trim();

  return UPSC_TECHNICAL_GLOSSARY.filter((item) => {
    return (
      item.termEn.toLowerCase().includes(q) ||
      item.termHi.includes(q) ||
      (item.transliteration && item.transliteration.toLowerCase().includes(q)) ||
      item.definitionEn.toLowerCase().includes(q) ||
      item.definitionHi.includes(q) ||
      (item.relevantArticleOrLaw && item.relevantArticleOrLaw.toLowerCase().includes(q))
    );
  });
}
