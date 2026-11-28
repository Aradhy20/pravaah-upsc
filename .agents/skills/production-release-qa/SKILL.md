---
name: production-release-qa
description: Release readiness auditing, test automation, cross-browser validation, and formal launch decision framework for Pravaah UPSC.
---

# Production Release QA Skill

## Verification Framework
1. **Automated Test Gate**:
   - Execute all test suites (`npm run test` or node test runners) covering authentication, registration, payment isolation, pricing synchronization, and data integrity.
   - Ensure zero compilation errors (`npx tsc --noEmit`) and successful production build (`npm run build`).
2. **API & Route Smoke Testing**:
   - Probe all critical user-facing routes and API endpoints:
     - Authentication: `/login`, `/register`, `/api/v1/auth/*`
     - Core Study: `/dashboard`, `/pyqs`, `/csat-coach`, `/mock-tests`, `/mains`, `/revision`
     - Discovery: `/api/v1/search`, `/api/v1/interview`, `/api/v1/map-lab`
   - Verify every endpoint responds with HTTP 200/201 and valid JSON schema.
3. **Launch Verdict Criteria**:
   - **READY**: All P0 security checks pass, zero HTTP 500s on critical routes, published question bank verified, payments safely configured, build clean.
   - **READY WITH LIMITATIONS**: Core study journeys fully functional, published question bank verified, payments safely disabled for beta, optional secondary features (e.g., Map Lab or Interview simulator) clearly labeled as beta.
   - **BLOCKED**: Any P0 authentication bypass, active database schema drift causing registration or study failure, or severe data corruption.
