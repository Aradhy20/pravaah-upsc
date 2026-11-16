# Pravaah UPSC: Local Docker PostgreSQL Environment

## 1. Overview
The Pravaah UPSC platform runs locally using a dedicated Docker container running PostgreSQL 17 (`postgres:17-alpine`), replacing remote cloud database latency with high-performance local NVMe storage.

---

## 2. Container Configuration (`docker-compose.yml`)

- **Service Name**: `postgres`
- **Container Name**: `pravaah-postgres`
- **Image**: `postgres:17-alpine`
- **Port**: `5432:5432`
- **Database**: `pravaah_upsc`
- **User**: `postgres`
- **Password**: `postgres`
- **Volume**: `pravaah_postgres_data` (Persistent named volume)

Connection URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pravaah_upsc?schema=public"
```

---

## 3. Operational Commands

### Start the Database:
```bash
docker compose up -d
```

### Stop the Database:
```bash
docker compose down
```

### Check Database Health:
```bash
docker ps
docker compose ps
```

### Synchronize Prisma Schema:
```bash
npx prisma db push
```

### Full Data Restore / Seed:
```bash
node scripts/restore_all_local_data.mjs
```

### Run Automated Test Suite:
```bash
node --test tests/knowledge_database.test.mjs
```
All API queries respond in sub-millisecond to under 100ms on the local container.
