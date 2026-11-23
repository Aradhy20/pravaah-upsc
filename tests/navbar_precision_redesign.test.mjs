import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

test("Navbar Precision Redesign: Container Geometry & Spacing Specs", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");

  // Exact 72px height
  assert.ok(headerCode.includes("h-[72px]"), "Header must specify h-[72px]");

  // Max width 1280px container
  assert.ok(
    headerCode.includes("max-w-[1280px]") || headerCode.includes("max-w-7xl"),
    "Header must constrain container to max-w-[1280px]"
  );

  // Subtle border and clean white background with backdrop blur
  assert.ok(headerCode.includes("border-b border-[#E4E7EC]"), "Header must have border-[#E4E7EC]");
  assert.ok(headerCode.includes("bg-white"), "Header must have clean white background");
});

test("Navbar Precision Redesign: Brand Logo & Subtitle Alignment", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");

  // Logo icon container
  assert.ok(headerCode.includes("h-10 w-10") || headerCode.includes("h-9 w-9"), "Logo must have balanced dimensions");
  assert.ok(headerCode.includes("bg-[#2453E6]"), "Logo icon must use brand blue #2453E6");

  // Brand Name and Subtitle
  assert.ok(headerCode.includes("Pravaah"), "Brand text must include Pravaah");
  assert.ok(headerCode.includes("UPSC"), "Brand text must include UPSC");
  assert.ok(headerCode.includes("CSE AI Platform"), "Brand subtitle must state CSE AI Platform");
});

test("Navbar Precision Redesign: Center Navigation Taxonomy (4 Core Groups)", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");

  // 1. Practice Dropdown & 5 Exact Items
  assert.ok(headerCode.includes("Practice"), "Practice navigation item must exist");
  assert.ok(headerCode.includes("/pyqs?paper=GS1"), "Practice item 1: Prelims GS Paper I");
  assert.ok(headerCode.includes("/pyqs?paper=GS2"), "Practice item 2: CSAT Paper II");
  assert.ok(headerCode.includes("/mock-tests"), "Practice item 3: Mock Tests");
  assert.ok(headerCode.includes("/daily-quiz"), "Practice item 4: Daily Quiz");
  assert.ok(headerCode.includes("/revision"), "Practice item 5: Revision");

  // 2. Preparation Dropdown & 5 Exact Items
  assert.ok(headerCode.includes("Preparation"), "Preparation navigation item must exist");
  assert.ok(headerCode.includes("/syllabus"), "Preparation item 1: UPSC Syllabus");
  assert.ok(headerCode.includes("/study-planner"), "Preparation item 2: Study Planner");
  assert.ok(headerCode.includes("/mains"), "Preparation item 3: Mains Answer Writing");
  assert.ok(headerCode.includes("/notes"), "Preparation item 4: Notes and Bookmarks");
  assert.ok(headerCode.includes("Resource Library"), "Preparation item 5: Resource Library");

  // 3. Current Affairs Direct Link
  assert.ok(headerCode.includes('href="/current-affairs"'), "Current Affairs must link directly");

  // 4. PYQ Bank Direct Link
  assert.ok(headerCode.includes('href="/pyqs"'), "PYQ Bank must link directly");
});

test("Navbar Precision Redesign: Right Utility Bar & Consistent Button Heights", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");

  // Search Button
  assert.ok(headerCode.includes('aria-label="Search PYQs"'), "Search button must have accessible label");
  assert.ok(headerCode.includes('title="Search PYQs"'), "Search button must have tooltip title");

  // Language Switcher
  assert.ok(headerCode.includes("<LanguageSwitcher"), "Language Switcher must be rendered");

  // Ask AI Button
  assert.ok(headerCode.includes("Ask AI"), "Ask AI button must be rendered");
  assert.ok(headerCode.includes("setIsAiAssistantOpen(true)"), "Ask AI button must open assistant modal");

  // Pricing Link
  assert.ok(headerCode.includes('href="/pricing"'), "Pricing link must exist");

  // Authentication State
  assert.ok(headerCode.includes('href="/login"'), "Login link must exist");
  assert.ok(headerCode.includes('href="/register"'), "Register link must exist");
  assert.ok(headerCode.includes("Start Free"), "Start Free CTA must exist");
});

test("Navbar Precision Redesign: Mobile Navigation Drawer & Touch Accessibility", async () => {
  const headerCode = fs.readFileSync(path.resolve("components/Header.tsx"), "utf-8");

  // Hamburger button
  assert.ok(headerCode.includes("min-h-[44px]"), "Interactive elements must meet 44px touch target guideline");
  assert.ok(headerCode.includes("min-w-[44px]"), "Interactive elements must meet 44px touch target guideline");

  // Scroll locking & dismissal
  assert.ok(headerCode.includes('overflow = "hidden"'), "Mobile drawer must lock body scrolling");
  assert.ok(headerCode.includes('event.key === "Escape"'), "Escape key must close mobile drawer and dropdowns");

  // Accordion triggers for Practice & Preparation
  assert.ok(headerCode.includes("mobilePracticeExpanded"), "Practice section must support expandable accordion");
  assert.ok(headerCode.includes("mobilePrepExpanded"), "Preparation section must support expandable accordion");
});

test("Navbar Precision Redesign: Server Render HTML Verification", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  // Branding
  assert.ok(html.includes("Pravaah"), "Brand text Pravaah present in rendered HTML");
  assert.ok(html.includes("UPSC"), "Brand text UPSC present in rendered HTML");
  assert.ok(html.includes("CSE AI Platform"), "Brand subtitle present in rendered HTML");

  // Center links
  assert.ok(html.includes("Practice"), "Practice present in HTML");
  assert.ok(html.includes("Preparation"), "Preparation present in HTML");
  assert.ok(html.includes("Current Affairs"), "Current Affairs present in HTML");
  assert.ok(html.includes("PYQ Bank"), "PYQ Bank present in HTML");

  // Right utility elements
  assert.ok(html.includes("Ask AI"), "Ask AI present in HTML");
  assert.ok(html.includes("Pricing"), "Pricing present in HTML");
  assert.ok(html.includes("Start Free"), "Start Free present in HTML");
  assert.ok(html.includes("Search PYQs"), "Search button present in HTML");
});
