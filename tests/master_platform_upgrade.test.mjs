import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Master Platform Upgrade: Database Inventory Verification (121 Prelims, 32 Mains, 10 Map, 5 Interview)", async () => {
  const prelimsCount = await prisma.question.count({
    where: { status: "PUBLISHED" },
  });
  const mainsCount = await prisma.mainsQuestion.count();
  const gs1Count = await prisma.question.count({
    where: { paper: { code: "GS1" }, status: "PUBLISHED" },
  });
  const csatCount = await prisma.question.count({
    where: { paper: { code: "GS2" }, status: "PUBLISHED" },
  });
  const mapCount = await prisma.mapFeature.count();
  const interviewCount = await prisma.interviewQuestion.count();

  assert.strictEqual(prelimsCount, 121, "Total verified Prelims questions must strictly equal 121");
  assert.strictEqual(gs1Count, 74, "GS1 questions must equal 74");
  assert.strictEqual(csatCount, 47, "CSAT questions must equal 47");
  assert.strictEqual(mainsCount, 32, "Mains questions must strictly equal 32");
  assert.strictEqual(mapCount, 10, "Map features in PostgreSQL must equal 10");
  assert.strictEqual(interviewCount, 5, "Interview prompts in PostgreSQL must equal 5");
});

test("Master Platform Upgrade: Map Lab API (/api/v1/map-lab)", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/map-lab`);
  assert.strictEqual(res.status, 200, "Map Lab API must return HTTP 200");

  const body = await res.json();
  assert.strictEqual(body.success, true);
  const data = body.data;
  assert.strictEqual(data.totalFeatures, 10, "Map Lab must return 10 spatial features");
  assert.ok(Array.isArray(data.categories), "Categories must be an array");
  
  const categoryIds = data.categories.map((c) => c.id);
  assert.ok(categoryIds.includes("RIVER"), "Categories must contain RIVER");
  assert.ok(categoryIds.includes("NATIONAL_PARK"), "Categories must contain NATIONAL_PARK");
  assert.ok(categoryIds.includes("STRAIT"), "Categories must contain STRAIT");

  // Verify 2024 Q12 Geography Verification (Hundru, Dhuandhar, Gersoppa)
  const dhuandhar = data.features.find((f) => f.name.includes("Dhuandhar"));
  assert.ok(dhuandhar, "Dhuandhar Falls must exist in map features");
  assert.ok(dhuandhar.keyFacts.includes("Narmada"), "Dhuandhar must be on Narmada River");

  const hundru = data.features.find((f) => f.name.includes("Hundru"));
  assert.ok(hundru, "Hundru Falls must exist in map features");
  assert.ok(hundru.keyFacts.includes("Subarnarekha"), "Hundru must be on Subarnarekha River");

  const gersoppa = data.features.find((f) => f.name.includes("Gersoppa"));
  assert.ok(gersoppa, "Gersoppa Falls must exist in map features");
  assert.ok(gersoppa.keyFacts.includes("Sharavati"), "Gersoppa must be on Sharavati River");
});

test("Master Platform Upgrade: Map Lab API Filter by Category", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/map-lab?category=STRAIT`);
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.strictEqual(body.success, true);
  const data = body.data;
  assert.strictEqual(data.totalFeatures, 2, "Must return 2 straits (Bab-el-Mandeb and Strait of Hormuz)");
  for (const feature of data.features) {
    assert.strictEqual(feature.category, "STRAIT");
  }
});

test("Master Platform Upgrade: Interview & Personality Test API (/api/v1/interview)", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/interview`);
  assert.strictEqual(res.status, 200, "Interview API must return HTTP 200");

  const body = await res.json();
  assert.strictEqual(body.success, true);
  const data = body.data;
  assert.strictEqual(data.totalQuestions, 5, "Must return 5 verified interview prompts");
  assert.ok(data.disclaimer, "Disclaimer must exist explaining source nature");

  // Verify source types separation
  const candidateReported = data.questions.filter((p) => p.sourceType === "CANDIDATE_REPORTED");
  const situational = data.questions.filter((p) => p.sourceType === "SITUATIONAL");
  assert.ok(candidateReported.length > 0, "Must have candidate-reported interview questions");
  assert.ok(situational.length > 0, "Must have situational administrative prompts");

  // Verify response framework exists on prompts
  for (const prompt of data.questions) {
    assert.ok(prompt.frameworkGuidance, "Prompt must include civil services response framework");
    assert.ok(prompt.contextEn, "Prompt must include profile/board context");
  }
});

test("Master Platform Upgrade: UI Pages Render HTTP 200 (/map-lab, /interview, /analytics)", async () => {
  const routes = ["/map-lab", "/interview", "/analytics", "/mission-control", "/csat-coach", "/mains"];

  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route}`);
    assert.strictEqual(res.status, 200, `Route ${route} must return HTTP 200`);
    const html = await res.text();
    assert.ok(html.length > 500, `Route ${route} must return non-trivial HTML`);
  }
});

test("Master Platform Upgrade: Payment Safety Architecture (Cashfree Dormant)", async () => {
  const paymentConfigPath = path.resolve("lib/payments/payment-config.ts");
  const cashfreeProviderPath = path.resolve("lib/payments/providers/cashfree-provider.ts");
  assert.ok(fs.existsSync(paymentConfigPath), "Payment config file must exist");
  assert.ok(fs.existsSync(cashfreeProviderPath), "Cashfree provider file must exist");

  const configContent = fs.readFileSync(paymentConfigPath, "utf-8");
  const providerContent = fs.readFileSync(cashfreeProviderPath, "utf-8");

  assert.ok(
    configContent.includes("isPaymentSystemEnabled"),
    "isPaymentSystemEnabled function must exist"
  );
  assert.ok(
    providerContent.includes("PaymentGatewayNotConfiguredError"),
    "PaymentGatewayNotConfiguredError must be thrown for checkout"
  );
  assert.ok(
    !configContent.includes("razorpay") && !providerContent.includes("razorpay"),
    "No legacy Razorpay references should exist"
  );
});

test("Master Platform Upgrade: Support & Contact Details Consistency", async () => {
  const contactPagePath = path.resolve("app/contact/page.tsx");
  const footerPath = path.resolve("components/Footer.tsx");

  assert.ok(fs.existsSync(contactPagePath));
  assert.ok(fs.existsSync(footerPath));

  const contactHtml = fs.readFileSync(contactPagePath, "utf-8");
  const footerHtml = fs.readFileSync(footerPath, "utf-8");

  assert.ok(
    contactHtml.includes("7351522153"),
    "Contact page must contain official telephone/WhatsApp number"
  );
  assert.ok(
    contactHtml.includes("jainaradhy123@gmail.com"),
    "Contact page must contain official support email"
  );
  assert.ok(
    footerHtml.includes("7351522153"),
    "Footer must contain official telephone/WhatsApp number"
  );
  assert.ok(
    footerHtml.includes("jainaradhy123@gmail.com"),
    "Footer must contain official support email"
  );
});

test("Master Platform Upgrade: Verification of All 20 Master Documentation Files", () => {
  const requiredDocs = [
    "MASTER_PLATFORM_AUDIT.md",
    "PYQ_SOURCE_DIRECTORY.md",
    "PYQ_EXTRACTION_PIPELINE.md",
    "PYQ_VERIFICATION_GUIDELINES.md",
    "PYQ_METADATA_SCHEMA.md",
    "PYQ_COLLECTION_PROGRESS.md",
    "PYQ_RIGHTS_AND_PROVENANCE.md",
    "MISSION_CONTROL_SPEC.md",
    "AI_MENTOR_ARCHITECTURE.md",
    "SYLLABUS_INTELLIGENCE.md",
    "MISTAKE_INTELLIGENCE.md",
    "PRELIMS_READINESS_ANALYTICS.md",
    "CSAT_COACH.md",
    "MAINS_EVALUATION.md",
    "CURRENT_AFFAIRS_CONVERTER.md",
    "MAP_LEARNING_LAB.md",
    "CONTACT_SUPPORT.md",
    "SECURITY_REPORT.md",
    "QA_TEST_REPORT.md",
    "MASTER_COMPLETION_REPORT.md",
  ];

  for (const doc of requiredDocs) {
    const fullPath = path.resolve("docs", doc);
    assert.ok(fs.existsSync(fullPath), `Documentation file docs/${doc} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 500, `Documentation file docs/${doc} must have substantive content (>500 bytes)`);
  }
});
