---
name: database-safety
description: Safe database management, schema drift detection, non-destructive migrations, and production data preservation protocols.
---

# Database Safety Skill

## Non-Negotiable Rules
1. **Zero Data Loss Guarantee**:
   - NEVER execute destructive commands such as `prisma db push --accept-data-loss` or `DROP TABLE` in any environment containing real user records or content.
   - All schema changes must be backward-compatible, additive, and executed via validated Prisma migration scripts or idempotent DDL scripts (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
2. **Schema Drift Healing**:
   - Production serverless databases (e.g., Neon PostgreSQL) can drift if migrations are not deployed synchronously with application builds.
   - Implement idempotent self-healing schema checks (`deploy_db_setup.mjs` or database init helpers) that verify critical relations (`InterviewQuestion`, `MapFeature`, `UserUsageLedger`, `MainsDraft`, `UserProfile` columns) exist before application queries execute.
3. **Connection Pooling & Concurrency**:
   - PostgreSQL connections must utilize connection pooling (`pgBouncer` / Neon pooled endpoints) with reasonable timeout parameters.
   - Disconnect Prisma Client cleanly in CLI scripts and background workers.
4. **Data Isolation & Backup**:
   - Always verify target database URI before running migration or seed operations.
   - Historical student attempt data (`UserQuestionAttempt`, `MockTestAttempt`) and transaction records (`Payment`, `Subscription`) must remain intact across updates.
