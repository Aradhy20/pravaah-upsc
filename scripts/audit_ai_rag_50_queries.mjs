import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const TEST_QUERIES = [
  // 1-10: Exact & Conceptual Polity PYQs
  { id: 1, category: "Polity", query: "What is the definition of Money Bill under Article 110 of the Indian Constitution?" },
  { id: 2, category: "Polity", query: "Writ of Quo-Warranto conditions and applicability in India" },
  { id: 3, category: "Polity", query: "Ordinance making power of the President under Article 123" },
  { id: 4, category: "Polity", query: "Right to Privacy as a Fundamental Right under Article 21" },
  { id: 5, category: "Polity", query: "Schedules of the Constitution of India and their subject matter" },
  { id: 6, category: "Polity", query: "Anti-Defection Law under the Tenth Schedule of Indian Constitution" },
  { id: 7, category: "Polity", query: "Preamble to the Constitution of India legal status" },
  { id: 8, category: "Polity", query: "Directive Principles of State Policy non-enforceability" },
  { id: 9, category: "Polity", query: "Election Commission of India constitutional provisions under Article 324" },
  { id: 10, category: "Polity", query: "National Emergency under Article 352 fundamental rights suspension" },

  // 11-20: Economy & Banking PYQs
  { id: 11, category: "Economy", query: "Statutory Liquidity Ratio SLR and Cash Reserve Ratio CRR by RBI" },
  { id: 12, category: "Economy", query: "Pradhan Mantri Jan Dhan Yojana PMJDY financial inclusion features" },
  { id: 13, category: "Economy", query: "Non-Performing Assets NPAs and Insolvency and Bankruptcy Code IBC 2016" },
  { id: 14, category: "Economy", query: "Monetary Policy Committee MPC inflation targeting framework in India" },
  { id: 15, category: "Economy", query: "Current Account Deficit CAD and Balance of Payments components" },
  { id: 16, category: "Economy", query: "Goods and Services Tax GST Council constitutional mandate Article 279A" },
  { id: 17, category: "Economy", query: "Fiscal Deficit calculation and FRBM Act targets" },
  { id: 18, category: "Economy", query: "Priority Sector Lending PSL norms for commercial banks in India" },
  { id: 19, category: "Economy", query: "Core inflation versus Headline inflation CPI headline basket" },
  { id: 20, category: "Economy", query: "Foreign Direct Investment FDI versus Foreign Portfolio Investment FPI" },

  // 21-30: History & Culture PYQs
  { id: 21, category: "History", query: "Servants of India Society founded by Gopal Krishna Gokhale 1905" },
  { id: 22, category: "History", query: "Indus Valley Civilization Harappan town planning and drainage system" },
  { id: 23, category: "History", query: "Buddhism and Jainism difference regarding soul and karma" },
  { id: 24, category: "History", query: "Ashokan Edicts Major Rock Edicts Dhamma propagation" },
  { id: 25, category: "History", query: "Vijayanagara Empire architecture Hampi monuments Krishna Deva Raya" },
  { id: 26, category: "History", query: "Mughal Mansabdari system and Jagirdari crisis" },
  { id: 27, category: "History", query: "Permanent Settlement of Bengal 1793 Lord Cornwallis Zamindari" },
  { id: 28, category: "History", query: "1857 Revolt causes Doctrine of Lapse Lord Dalhousie" },
  { id: 29, category: "History", query: "Non-Cooperation Movement 1920 Chauri Chaura incident withdrawal" },
  { id: 30, category: "History", query: "Quit India Movement 1942 Do or Die underground resistance" },

  // 31-35: Geography & Environment
  { id: 31, category: "Geography", query: "South-West Monsoon in India spatial and temporal variability" },
  { id: 32, category: "Geography", query: "Western Ghats biodiversity hotspot and ecological sensitivity" },
  { id: 33, category: "Environment", query: "Ramsar Convention wetland sites in India conservation guidelines" },
  { id: 34, category: "Environment", query: "Carbon credits and Paris Agreement Article 6 carbon markets" },
  { id: 35, category: "Environment", query: "Coral reef bleaching causes Sea Surface Temperature rise El Nino" },

  // 36-40: CSAT / Aptitude
  { id: 36, category: "CSAT", query: "Five persons P, Q, R, S, and T seated in a straight row facing north seating arrangement" },
  { id: 37, category: "CSAT", query: "Reading comprehension logical reasoning inference premise conclusion" },
  { id: 38, category: "CSAT", query: "Permutation and combination digit arrangement problem" },
  { id: 39, category: "CSAT", query: "Time speed and distance two trains moving in opposite directions" },
  { id: 40, category: "CSAT", query: "Data sufficiency statement evaluation syllogism" },

  // 41-45: Mains Framework Guidance & Ethics
  { id: 41, category: "Mains", query: "Discuss the contributing factors to increasing variability of South-West Monsoon" },
  { id: 42, category: "Mains", query: "Role of digital public infrastructure DPI in improving social welfare delivery in India" },
  { id: 43, category: "Mains", query: "Ethical dilemmas faced by civil servants balancing political executive directions with public interest" },
  { id: 44, category: "Mains", query: "Impact of globalization on vulnerable sections including elderly and tribal communities in India" },
  { id: 45, category: "Mains", query: "Judicial activism versus judicial overreach in Indian constitutional jurisprudence" },

  // 46-50: NCERT, Unverified & Edge Case Grounding
  { id: 46, category: "NCERT", query: "NCERT Class 11 Political Theory Constitution Why and How" },
  { id: 47, category: "NCERT", query: "NCERT Indian Economy on the Eve of Independence Class 11" },
  { id: 48, category: "NCERT", query: "NCERT Fundamental Principles of Geography interior of the earth" },
  { id: 49, category: "Negative/Boundary", query: "Quantum teleportation across warp drive spaceships in Vedic literature 5000 BC" },
  { id: 50, category: "Negative/Boundary", query: "UPSC CSE 2035 question paper GS Paper 5 with official answer key" },
];

async function evaluateRAG() {
  console.log("==================================================================");
  console.log("       PRAVAAH UPSC - 50-QUERY RAG & AI ASSISTANT EVALUATION      ");
  console.log("==================================================================\n");

  const results = [];
  let totalConfidence = 0;
  let groundedCount = 0;
  let pyqHitCount = 0;
  let ncertHitCount = 0;
  let syllabusHitCount = 0;
  let hallucinationFreeCount = 0;

  for (const item of TEST_QUERIES) {
    const startTime = Date.now();
    let response;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ai/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: item.query, maxResults: 5 }),
      });
      const json = await res.json();
      response = json.data;
    } catch (err) {
      console.error(`Query ${item.id} failed:`, err);
      response = {
        answer: "Failed to connect to AI assistant endpoint",
        groundingConfidence: 0,
        relevantPYQs: [],
        ncertReferences: [],
        syllabusNodes: [],
        citations: [],
      };
    }

    const latencyMs = Date.now() - startTime;
    totalConfidence += response.groundingConfidence || 0;
    const hasPYQ = (response.relevantPYQs || []).length > 0;
    const hasNCERT = (response.ncertReferences || []).length > 0;
    const hasSyllabus = (response.syllabusNodes || []).length > 0;

    if (hasPYQ) pyqHitCount++;
    if (hasNCERT) ncertHitCount++;
    if (hasSyllabus) syllabusHitCount++;
    if (response.groundingConfidence >= 0.6) groundedCount++;

    // Hallucination check for negative queries:
    // For queries 49 & 50 (impossible or future queries), RAG should NOT return fake PYQs with confidence 1.0
    let hallucinationRisk = false;
    if (item.category === "Negative/Boundary") {
      if ((response.relevantPYQs || []).length > 0 && response.groundingConfidence > 0.8) {
        hallucinationRisk = true;
      } else {
        hallucinationFreeCount++;
      }
    } else {
      hallucinationFreeCount++;
    }

    results.push({
      id: item.id,
      category: item.category,
      query: item.query,
      latencyMs,
      groundingConfidence: response.groundingConfidence,
      pyqsFound: (response.relevantPYQs || []).length,
      ncertFound: (response.ncertReferences || []).length,
      syllabusFound: (response.syllabusNodes || []).length,
      citationsFound: (response.citations || []).length,
      hallucinationRisk,
      samplePyq: response.relevantPYQs?.[0]
        ? {
            id: response.relevantPYQs[0].id,
            year: response.relevantPYQs[0].year,
            subject: response.relevantPYQs[0].subject,
            snippet: response.relevantPYQs[0].questionText?.slice(0, 80),
          }
        : null,
      answerSnippet: response.answer?.slice(0, 150),
    });

    console.log(
      `[Query #${String(item.id).padStart(2, "0")}] [${item.category.padEnd(8)}] Conf: ${((response.groundingConfidence || 0) * 100).toFixed(0)}% | PYQs: ${(response.relevantPYQs || []).length} | NCERT: ${(response.ncertReferences || []).length} | Syllabus: ${(response.syllabusNodes || []).length} | Latency: ${latencyMs}ms`
    );
  }

  const avgConfidence = (totalConfidence / TEST_QUERIES.length) * 100;
  const pyqHitRate = (pyqHitCount / TEST_QUERIES.length) * 100;
  const ncertHitRate = (ncertHitCount / TEST_QUERIES.length) * 100;
  const syllabusHitRate = (syllabusHitCount / TEST_QUERIES.length) * 100;
  const highConfidenceRate = (groundedCount / TEST_QUERIES.length) * 100;
  const hallucinationFreeRate = (hallucinationFreeCount / TEST_QUERIES.length) * 100;

  console.log("\n==================================================================");
  console.log("                      EVALUATION BENCHMARK SUMMARY                 ");
  console.log("==================================================================");
  console.log(`  ✓ Total Queries Evaluated        : ${TEST_QUERIES.length}`);
  console.log(`  ✓ Average Grounding Confidence   : ${avgConfidence.toFixed(1)}%`);
  console.log(`  ✓ High Grounding Rate (>=60%)    : ${highConfidenceRate.toFixed(1)}% (${groundedCount}/${TEST_QUERIES.length})`);
  console.log(`  ✓ PYQ Grounding Hit Rate         : ${pyqHitRate.toFixed(1)}% (${pyqHitCount}/${TEST_QUERIES.length})`);
  console.log(`  ✓ NCERT Linkage Hit Rate         : ${ncertHitRate.toFixed(1)}% (${ncertHitCount}/${TEST_QUERIES.length})`);
  console.log(`  ✓ Official Syllabus Hit Rate     : ${syllabusHitRate.toFixed(1)}% (${syllabusHitCount}/${TEST_QUERIES.length})`);
  console.log(`  ✓ Hallucination-Free / Boundary  : ${hallucinationFreeRate.toFixed(1)}% (${hallucinationFreeCount}/${TEST_QUERIES.length})`);
  console.log("==================================================================\n");

  const output = {
    summary: {
      totalQueries: TEST_QUERIES.length,
      avgConfidence: parseFloat(avgConfidence.toFixed(1)),
      highConfidenceRate: parseFloat(highConfidenceRate.toFixed(1)),
      pyqHitRate: parseFloat(pyqHitRate.toFixed(1)),
      ncertHitRate: parseFloat(ncertHitRate.toFixed(1)),
      syllabusHitRate: parseFloat(syllabusHitRate.toFixed(1)),
      hallucinationFreeRate: parseFloat(hallucinationFreeRate.toFixed(1)),
    },
    results,
  };

  fs.mkdirSync(path.join(process.cwd(), "docs/audit"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "docs/audit/rag_50_queries_evaluation.json"),
    JSON.stringify(output, null, 2)
  );

  return output;
}

evaluateRAG().catch(console.error);
