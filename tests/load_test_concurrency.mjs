import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Concurrency & Latency Load Benchmark: 100 Concurrent Quiz & PYQ Requests", async () => {
  const TOTAL_REQUESTS = 100;
  const CONCURRENCY = 20;

  console.log(`\n==========================================================`);
  console.log(`PRAVAAH UPSC: CONCURRENCY & THROUGHPUT LOAD BENCHMARK`);
  console.log(`Target: ${TOTAL_REQUESTS} simulated user requests at ${CONCURRENCY} concurrency`);
  console.log(`==========================================================`);

  const endpoints = [
    "/api/v1/study-planner/today",
    "/api/v1/current-affairs?limit=10",
    "/api/v1/quiz/daily",
    "/api/v1/exams",
    "/api/v1/questions?limit=10&paper=GS1",
  ];

  const latencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  const startTime = Date.now();

  async function worker(taskIndex) {
    const endpoint = endpoints[taskIndex % endpoints.length];
    const reqStart = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      const duration = Date.now() - reqStart;
      latencies.push(duration);
      if (res.status === 200) {
        successfulRequests++;
      } else {
        failedRequests++;
      }
    } catch (e) {
      failedRequests++;
    }
  }

  // Execute in concurrent chunks
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const chunk = [];
    for (let j = 0; j < CONCURRENCY && i + j < TOTAL_REQUESTS; j++) {
      chunk.push(worker(i + j));
    }
    await Promise.all(chunk);
  }

  const totalDurationMs = Date.now() - startTime;
  latencies.sort((a, b) => a - b);

  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const reqPerSec = Math.round((successfulRequests / (totalDurationMs / 1000)) * 10) / 10;

  console.log(`Results:`);
  console.log(`  Total Requests:       ${TOTAL_REQUESTS}`);
  console.log(`  Successful (200 OK):  ${successfulRequests}`);
  console.log(`  Failed:               ${failedRequests}`);
  console.log(`  Total Duration:       ${totalDurationMs} ms`);
  console.log(`  Throughput:           ${reqPerSec} req/sec`);
  console.log(`  Latency Average:      ${avgLatency} ms`);
  console.log(`  Latency p50 (Median): ${p50} ms`);
  console.log(`  Latency p95:          ${p95} ms`);
  console.log(`  Latency p99:          ${p99} ms`);
  console.log(`==========================================================\n`);

  assert.equal(failedRequests, 0, "All concurrent load requests must succeed with 200 OK");
  assert.ok(p95 < 250, `p95 latency (${p95}ms) must remain below 250ms threshold`);
});
