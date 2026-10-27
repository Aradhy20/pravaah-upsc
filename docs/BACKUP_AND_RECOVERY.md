# Pravaah UPSC — Backup & Disaster Recovery Architecture

## 1. Backup Policy & Retention Schedule
1. **Local Development Snapshots:**
   - Saved in `data/backups/`:
     - `dev_baseline_backup.db`
     - `pravaah_db_backup_20261028_000445.db`
2. **Production Database (PostgreSQL):**
   - **Continuous WAL Archiving:** Point-in-time recovery (PITR) with up to 30 days retention.
   - **Daily Automated pg_dump:** Stored in encrypted S3/GCS object storage bucket with lifecycle policy.
   - **Pre-Migration Snapshot:** Mandatory full database dump taken immediately before applying any schema migration.

---

## 2. Disaster Recovery Protocol

### Scenario A: Local Database Corruption
```bash
# Immediate rollback to verified baseline snapshot
cp data/backups/dev_baseline_backup.db prisma/dev.db
npx prisma generate
```

### Scenario B: Production Database Recovery
```bash
# 1. Stop web traffic
pm2 stop pravaah-app

# 2. Restore PostgreSQL dump
pg_restore -h <db_host> -U <db_user> -d <db_name> --clean <backup_file.dump>

# 3. Verify integrity
npm run test:prod

# 4. Resume service
pm2 restart pravaah-app
```
