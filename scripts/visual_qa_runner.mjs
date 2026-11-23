import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("docs/screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "small_mobile_360", width: 360, height: 800 },
  { name: "standard_mobile_390", width: 390, height: 844 },
  { name: "large_mobile_430", width: 430, height: 932 },
  { name: "tablet_portrait_768", width: 768, height: 1024 },
  { name: "laptop_1366", width: 1366, height: 768 },
  { name: "desktop_1440", width: 1440, height: 900 },
  { name: "large_desktop_1920", width: 1920, height: 1080 },
];

const PAGES = [
  { path: "", name: "homepage" },
  { path: "pricing", name: "pricing" },
  { path: "pyqs", name: "pyqs" },
  { path: "mains", name: "mains" },
  { path: "syllabus", name: "syllabus" },
  { path: "system-flow", name: "system-flow" },
  { path: "login", name: "login" },
];

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

console.log("🚀 Starting Responsive Visual QA & Screenshot Generation...");

const results = [];

for (const vp of VIEWPORTS) {
  for (const page of PAGES) {
    const url = `http://localhost:3000/${page.path}`;
    const filename = `${page.name}_${vp.name}.png`;
    const outputPath = path.join(SCREENSHOT_DIR, filename);

    try {
      const cmd = `"${CHROME_PATH}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=${vp.width},${vp.height} "${url}" 2>/dev/null`;
      execSync(cmd, { timeout: 15000 });
      const stats = fs.statSync(outputPath);
      console.log(`✅ [${vp.name}] ${page.name} -> ${filename} (${Math.round(stats.size / 1024)} KB)`);
      results.push({ page: page.name, viewport: vp.name, width: vp.width, success: true, size: stats.size });
    } catch (e) {
      console.error(`❌ [${vp.name}] ${page.name} failed:`, e.message);
      results.push({ page: page.name, viewport: vp.name, width: vp.width, success: false, error: e.message });
    }
  }
}

console.log(`\n🎉 Visual QA Complete: ${results.filter(r => r.success).length} / ${results.length} screenshots successfully captured!`);
