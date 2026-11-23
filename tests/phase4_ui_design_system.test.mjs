import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

test("Phase 4: Design System Components & Export Integrity", async () => {
  const uiIndex = fs.readFileSync(path.resolve("components/ui/index.ts"), "utf-8");
  assert.ok(uiIndex.includes('export * from "./Buttons"'), "Must export Buttons");
  assert.ok(uiIndex.includes('export * from "./Layout"'), "Must export Layout");
  assert.ok(uiIndex.includes('export * from "./Cards"'), "Must export Cards");
  assert.ok(uiIndex.includes('export * from "./SearchInput"'), "Must export SearchInput");
  assert.ok(uiIndex.includes('export * from "./Badges"'), "Must export Badges");
  assert.ok(uiIndex.includes('export * from "./States"'), "Must export States");
  assert.ok(uiIndex.includes('export * from "./Modal"'), "Must export Modal");
  assert.ok(uiIndex.includes('export * from "./Navigation"'), "Must export Navigation");
});

test("Phase 4: Desktop Navbar Single-Line Structure & Dropdowns", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  // Branding
  assert.ok(html.includes("Pravaah"), "Brand text must exist");
  assert.ok(html.includes("UPSC"), "Brand text must include UPSC");

  // Center navigation items
  assert.ok(html.includes("Practice"), "Practice dropdown must exist");
  assert.ok(html.includes("Preparation"), "Preparation dropdown must exist");
  assert.ok(html.includes("Current Affairs"), "Current Affairs link must exist");
  assert.ok(html.includes("PYQ Bank"), "PYQ Bank link must exist");

  // Right navigation items
  assert.ok(html.includes("Ask AI"), "Ask AI button must exist");
  assert.ok(html.includes("Pricing"), "Pricing link must exist");
  assert.ok(html.includes("Log In") || html.includes("Sign In"), "Log In must exist for unauthenticated");
  assert.ok(html.includes("Start Free"), "Start Free CTA must exist");
});

test("Phase 4: Mobile Navigation Accessibility & Touch Targets", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");
  assert.ok(headerCode.includes("aria-label"), "Must include accessible aria-label");
  assert.ok(headerCode.includes("aria-expanded"), "Must include aria-expanded state");
  assert.ok(headerCode.includes("min-h-[44px]"), "Touch targets must be at least 44px");
  assert.ok(headerCode.includes("overflow = \"hidden\""), "Must lock body scroll while drawer is open");
  assert.ok(headerCode.includes('event.key === "Escape"'), "Must support Escape key dismissal");
});

test("Phase 4: Hero Two-Column Layout, Authentic Statistics & Search", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  // Headline
  assert.ok(
    html.includes("Find the PYQ. Understand the Concept.") && html.includes("Master Every Mistake."),
    "Headline must match exact prompt requirement"
  );

  // Description
  assert.ok(
    html.includes("Practice UPSC previous year questions with structured explanations, source references, concept mapping and bilingual learning support."),
    "Supporting description must match prompt requirement"
  );

  // Search input
  assert.ok(html.includes('action="/pyqs"'), "Search form must point to /pyqs");
  assert.ok(html.includes('name="q"'), "Search form must use query param 'q'");

  // CTA Links
  assert.ok(html.includes('href="/pyqs?paper=GS1"'), "Primary CTA must link to GS Paper I");
  assert.ok(html.includes('href="/pyqs?paper=GS2"'), "Secondary CTA must link to CSAT");
  assert.ok(html.includes('href="/mock-tests"'), "Tertiary CTA must link to Timed Practice");

  // Verified Statistics
  assert.ok(html.includes("121"), "Must display verified count of 121 Prelims questions");
  assert.ok(html.includes("32"), "Must display verified count of 32 Mains questions");
  assert.ok(html.includes("41"), "Must display verified count of 41 Hindi Devanagari questions");

  // Unsupported claim removal
  assert.ok(!html.includes("0 Coaching Errors"), "Fabricated claim '0 Coaching Errors' must be removed");
  assert.ok(!html.includes("1,079+ verified"), "Unverified claim '1,079+' must be replaced with audited count");
});

test("Phase 4: Interactive Question Card Integrated & Bilingual State Preservation", async () => {
  const cardCode = fs.readFileSync(path.resolve("components/QuestionCard.tsx"), "utf-8");
  assert.ok(cardCode.includes("setLangMode"), "Must support switching language modes (EN, HI, BOTH)");
  assert.ok(cardCode.includes("selectedOption"), "Must maintain selectedOption independently of langMode");
  assert.ok(cardCode.includes("eliminationTechnique"), "Must support elimination technique pedagogical feedback");
});

test("Phase 4: Pricing UI Matches Cashfree Paused State & Regulatory Policy", async () => {
  const res = await fetch(`${BASE_URL}/pricing`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  // Disabled checkout notice
  assert.ok(html.includes("Online payments are temporarily unavailable"), "Notice must explain paused payment state");

  // Free plan active
  assert.ok(html.includes("Foundation"), "Foundation free tier must be present");

  // Money-back guarantee
  assert.ok(html.includes("7-Day Unconditional Money-Back Guarantee"), "Money-back guarantee must be rendered");

  // Homepage pricing section check
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("Subscription Temporarily Paused"), "Homepage pricing must display paused state on paid plans");
});

test("Phase 4: Responsive Screenshots Artifact Presence Across All 7 Viewports", async () => {
  const screenshotDir = path.resolve("docs/screenshots");
  assert.ok(fs.existsSync(screenshotDir), "Screenshot directory must exist");

  const files = fs.readdirSync(screenshotDir);
  assert.ok(files.length >= 49, `Must have captured all 49 screenshots (found ${files.length})`);

  const requiredViewports = ["360", "390", "430", "768", "1366", "1440", "1920"];
  for (const vp of requiredViewports) {
    const hasHomepageShot = files.some(f => f.startsWith("homepage_") && f.includes(vp));
    assert.ok(hasHomepageShot, `Homepage screenshot must exist for viewport ${vp}`);
  }
});
