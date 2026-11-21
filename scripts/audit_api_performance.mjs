import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const ENDPOINTS = [
  { name: "PYQs Default Paginated List", path: "/api/v1/pyqs" },
  { name: "PYQs Filtered (GS1, 2024)", path: "/api/v1/pyqs?paper=GS1&year=2024" },
  { name: "PYQs Subject Filtered (Polity)", path: "/api/v1/pyqs?subject=polity" },
  { name: "Keyword Search (governance)", path: "/api/v1/search?q=governance" },
  { name: "Syllabus Tree Hierarchy", path: "/api/v1/syllabus/tree" },
  { name: "Coverage Summary & Matrix", path: "/api/v1/coverage" },
  { name: "Multi-Exam Directory", path: "/api/v1/exams" },
  { name: "Current Affairs Feed", path: "/api/v1/current-affairs" },
  { name: "Mains Questions (GS1)", path: "/api/v1/mains?paper=GS1" },
  { name: "Pricing Plans & Tiers", path: "/api/v1/plans" },
  { name: "AI Assistant Grounded Query", path: "/api/v1/ai/assistant", method: "POST", body: { query: "What is Money Bill under Article 110?" } },
];

async function benchmarkAPIs() {
  console.log("==================================================================");
  console.log("       PRAVAAH UPSC - API & DATABASE PERFORMANCE BENCHMARK       ");
  console.log("==================================================================\n");

  const results = [];

  for (const ep of ENDPOINTS) {
    const latencies = [];
    let statusCode = 0;
    let payloadBytes = 0;
    let success = false;

    // Run 5 iterations per endpoint to measure warm latency & jitter
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}${ep.path}`, {
          method: ep.method || "GET",
          headers: { "Content-Type": "application/json" },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        const elapsed = Date.now() - start;
        latencies.push(elapsed);
        statusCode = res.status;
        const text = await res.text();
        payloadBytes = Buffer.byteLength(text, "utf-8");
        success = res.ok;
      } catch (e) {
        latencies.push(9999);
      }
    }

    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);

    results.push({
      name: ep.name,
      path: ep.path,
      method: ep.method || "GET",
      statusCode,
      success,
      payloadBytes,
      avgLatencyMs: avgLatency,
      minLatencyMs: minLatency,
      maxLatencyMs: maxLatency,
    });

    console.log(
      `[${String(statusCode).padEnd(3)}] ${(ep.method || "GET").padEnd(4)} ${ep.path.padEnd(36)} | Avg: ${String(avgLatency).padStart(3)}ms (Min: ${String(minLatency).padStart(2)}ms, Max: ${String(maxLatency).padStart(3)}ms) | ${(payloadBytes / 1024).toFixed(1)} KB`
    );
  }

  const overallAvg = Math.round(results.reduce((a, b) => a + b.avgLatencyMs, 0) / results.length);
  console.log("\n==================================================================");
  console.log(`  ✓ Overall Average API Response Time: ${overallAvg}ms`);
  console.log(`  ✓ Endpoints Tested: ${results.length}`);
  console.log("==================================================================\n");

  fs.mkdirSync(path.join(process.cwd(), "docs/audit"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "docs/audit/api_performance_benchmark.json"),
    JSON.stringify({ overallAvgMs: overallAvg, results }, null, 2)
  );

  return results;
}

benchmarkAPIs().catch(console.error);
