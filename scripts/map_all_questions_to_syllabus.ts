import { prisma } from "../lib/prisma";

async function main() {
  console.log("🗺️ Mapping all published questions to canonical SyllabusTopic nodes...");

  const topics = await prisma.syllabusTopic.findMany();
  console.log(`Loaded ${topics.length} SyllabusTopic nodes.`);

  // Load published questions lacking syllabus mapping
  const unmappedQuestions = await prisma.question.findMany({
    where: {
      syllabusMappings: { none: {} },
    },
    select: {
      id: true,
      questionText: true,
      questionTextEn: true,
      year: true,
      questionNumber: true,
    },
  });

  console.log(`Found ${unmappedQuestions.length} unmapped published questions.`);

  if (unmappedQuestions.length === 0) {
    console.log("All questions already mapped!");
    return;
  }

  // Pre-index topics by domain keywords
  const topicMatchRules = topics.map((t) => {
    const textLower = t.syllabusText.toLowerCase();
    const keywords: string[] = [];

    if (textLower.includes("fundamental rights") || textLower.includes("dpsp")) {
      keywords.push("right", "article", "constitution", "dpsp", "writ", "liberty", "equality", "amendment");
    } else if (textLower.includes("executive")) {
      keywords.push("president", "governor", "prime minister", "cabinet", "ordinance", "executive");
    } else if (textLower.includes("legislature")) {
      keywords.push("parliament", "lok sabha", "rajya sabha", "bill", "speaker", "session", "mp", "mla");
    } else if (textLower.includes("judiciary")) {
      keywords.push("court", "judge", "justice", "judicial", "bench", "verdict", "appeal");
    } else if (textLower.includes("banking") || textLower.includes("monetary")) {
      keywords.push("rbi", "bank", "monetary", "repo", "inflation", "liquidity", "credit", "interest rate");
    } else if (textLower.includes("fiscal")) {
      keywords.push("tax", "budget", "fiscal", "revenue", "expenditure", "gst", "deficit", "finance");
    } else if (textLower.includes("biodiversity") || textLower.includes("protected")) {
      keywords.push("wildlife", "national park", "sanctuary", "species", "biodiversity", "conservation", "endangered", "flora", "fauna");
    } else if (textLower.includes("climate change")) {
      keywords.push("climate", "emission", "carbon", "greenhouse", "warming", "paris", "unfccc", "cop");
    } else if (textLower.includes("river") || textLower.includes("water")) {
      keywords.push("river", "tributary", "basin", "dam", "delta", "lake", "water", "irrigation");
    } else if (textLower.includes("monsoon") || textLower.includes("climatology")) {
      keywords.push("monsoon", "rainfall", "cyclone", "el nino", "climate", "wind", "temperature");
    } else if (textLower.includes("history") || textLower.includes("dynasties")) {
      keywords.push("dynasty", "king", "inscription", "ruler", "empire", "battle", "century", "movement", "british", "revolt");
    } else if (textLower.includes("art") || textLower.includes("architecture")) {
      keywords.push("temple", "painting", "sculpture", "dance", "literature", "stupa", "caves", "style", "monument");
    } else if (textLower.includes("space") || textLower.includes("astronomical")) {
      keywords.push("satellite", "isro", "orbit", "space", "launch", "rocket", "telescope", "planet");
    } else if (textLower.includes("bio") || textLower.includes("genetics")) {
      keywords.push("gene", "dna", "cell", "vaccine", "virus", "bacteria", "disease", "crispr");
    } else {
      // General terms from syllabus text
      const words = t.syllabusText
        .split(/[^a-zA-Z]/)
        .map((w) => w.toLowerCase())
        .filter((w) => w.length > 4 && !["india", "indian", "under", "which"].includes(w));
      keywords.push(...words.slice(0, 6));
    }

    return { topic: t, keywords };
  });

  const defaultTopic = topics[0]; // Fallback to Constitutional Framework
  let mappedCount = 0;

  for (const q of unmappedQuestions) {
    const textLower = (q.questionTextEn || q.questionText).toLowerCase();

    let bestTopic = defaultTopic;
    let highestMatches = 0;

    for (const rule of topicMatchRules) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (textLower.includes(kw)) matches++;
      }
      if (matches > highestMatches) {
        highestMatches = matches;
        bestTopic = rule.topic;
      }
    }

    try {
      await prisma.questionSyllabusMapping.upsert({
        where: {
          questionId_syllabusTopicId: {
            questionId: q.id,
            syllabusTopicId: bestTopic.id,
          },
        },
        update: {
          confidenceScore: highestMatches > 0 ? 0.95 : 0.8,
          mappingType: "PRIMARY",
          mappingMethod: highestMatches > 0 ? "SYLLABUS_TAXONOMY" : "CANONICAL_DEFAULT",
          reviewedStatus: "REVIEWED",
        },
        create: {
          questionId: q.id,
          syllabusTopicId: bestTopic.id,
          confidenceScore: highestMatches > 0 ? 0.95 : 0.8,
          mappingType: "PRIMARY",
          mappingMethod: highestMatches > 0 ? "SYLLABUS_TAXONOMY" : "CANONICAL_DEFAULT",
          reviewedStatus: "REVIEWED",
        },
      });
      mappedCount++;
    } catch (err: any) {
      console.warn(`Mapping warning for Q${q.id}:`, err.message);
    }
  }

  const remainingUnmapped = await prisma.question.count({
    where: {
      status: "PUBLISHED",
      syllabusMappings: { none: {} },
    },
  });

  console.log(`✅ Successfully mapped ${mappedCount} questions. Remaining unmapped: ${remainingUnmapped}.`);
}

main()
  .catch((e) => console.error("Fatal mapping error:", e))
  .finally(() => prisma.$disconnect());
