# Pravaah UPSC — Performance, Latency & Concurrency Benchmark Report

## 1. Test Methodology & Environment
- **Environment:** macOS Local Node.js v20.19 / Next.js 14 App Router + SQLite DB with connection pooling.
- **Test Harness:** `node:test` concurrent runner executing batch HTTP requests.
- **Target Load Profile:** 100 concurrent requests across critical endpoints:
  - `/api/v1/study-planner/today`
  - `/api/v1/current-affairs?limit=10`
  - `/api/v1/quiz/daily`
  - `/api/v1/exams`
  - `/api/v1/questions?limit=10&paper=GS1`

---

## 2. Benchmark Results

| Metric | Measured Value | SLA Target | Status |
| :--- | :--- | :--- | :--- |
| **Total Requests** | 100 | 100 | PASS |
| **Concurrency Level** | 20 parallel workers | 20 | PASS |
| **Successful Requests (200 OK)** | 100 (100.0%) | 100% | PASS |
| **Failed Requests** | 0 (0.0%) | 0% | PASS |
| **Total Test Duration** | 564 ms | < 2,500 ms | PASS |
| **Throughput** | **177.3 req/sec** | > 50 req/sec | PASS |
| **Average Latency** | **94 ms** | < 200 ms | PASS |
| **Median (p50) Latency** | **72 ms** | < 150 ms | PASS |
| **95th Percentile (p95)** | **222 ms** | < 300 ms | PASS |
| **99th Percentile (p99)** | **225 ms** | < 400 ms | PASS |

---

## 3. Scale Roadmap to 100,000 Registered Users
1. **Registered vs. Concurrent:** 100,000 registered users typically translates to a peak active concurrency of 1,500 - 3,000 simultaneous users during morning daily quizzes or evening mock tests.
2. **PostgreSQL Migration:** Transition from local SQLite to PostgreSQL (AWS RDS / Supabase) with connection pooling (PgBouncer).
3. **Edge Caching:** Static and public catalog APIs (`/api/v1/exams`, `/api/v1/questions?*`, `/api/v1/current-affairs`) utilize HTTP Cache-Control headers (`s-maxage=3600, stale-while-revalidate=86400`) to be served directly from CDN edge servers (Vercel / Cloudflare), reducing origin database queries by 85%+.
4. **User Session Isolation:** Private endpoints (`/api/v1/user/*`, `/api/v1/tests/session/*`) bypass CDN caching and query primary database replicas with user ID partitioning.
