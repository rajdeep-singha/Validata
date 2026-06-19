# Validata

A production-grade CSV transaction data validation platform with AI-assisted column mapping, automated error detection, fix suggestions, and chunked output delivery.

---

## Live Demo

- Frontend: https://validata-seven.vercel.app
- Backend API: https://datavalid-backend.onrender.com

---

## Architecture

### System Overview

```
Client (Vercel)
    |
    |  HTTPS REST + multipart/form-data
    |
Express API (Render Web Service)
    |
    |-- PostgreSQL (Neon)         stores jobs, rows, mappings, AI summaries
    |-- Upstash Redis             BullMQ queue broker + duplicate order ID sets
    |-- BullMQ Worker (in-process) processes validation pipeline
    |-- Anthropic Claude API      column mapping, fix suggestions, summaries
```

### Frontend Architecture

```
src/
  pages/
    LandingPage.tsx          hero section with video background
    UploadPage.tsx           file selection and upload trigger
    MappingPage.tsx          AI column mapping review and confirmation
    ValidationResultsPage.tsx  paginated results with error breakdown
    AIInsightsPage.tsx       natural language summary and fix suggestions
    DownloadPage.tsx         CSV or ZIP download

  components/
    upload/                  drag-drop file input, PapaParse preview
    mapping/                 mapping table, confidence indicators
    validation/              error table, fix suggestion rows
    ui/                      shared Badge, ProgressBar, Spinner, ErrorAlert

  stores/                    Zustand (4 stores)
    job.store.ts             active jobId, status, progress
    mapping.store.ts         AI mappings, user overrides, confirmed flag
    fix.store.ts             per-row fix suggestions, approval state
    ui.store.ts              active step, toast state

  hooks/
    useJobPolling.ts         TanStack Query refetchInterval=2s while PROCESSING
    useColumnMapping.ts      mapping fetch and override logic
    useFixSuggestions.ts     AI fix request and approval
    useDownload.ts           download trigger with ZIP detection

  api/
    client.ts                Axios instance with VITE_API_BASE_URL base
    upload.api.ts
    jobs.api.ts
    ai.api.ts
    download.api.ts
```

**State strategy:** Zustand for client/UI state, TanStack Query v5 for all server state. Polling uses `refetchInterval` which stops automatically when status reaches COMPLETED or FAILED. Context was avoided because 2s polling intervals cause full re-renders on Context providers.

### Backend Architecture

```
src/
  index.ts                   entry point, runs migrations, starts BullMQ worker in-process
  app.ts                     Express factory, CORS, compression, routes

  config/
    validation.config.ts     phone rules per country, date formats, payment modes
    redis.config.ts          parses REDIS_URL, adds TLS for rediss:// (Upstash)
    ai.config.ts             Anthropic client, model, token limits
    app.config.ts            port, CORS origin, file dirs

  controllers/               thin HTTP layer, delegates to services/queue
  routes/                    Express router definitions
  middleware/
    upload.middleware.ts     Multer disk storage, UUID filename, size guard
    error.middleware.ts      centralised error handler
    rate-limit.middleware.ts  20 req/min per IP on AI endpoints

  services/
    validation.service.ts    stream pipeline orchestration
    row-validator.service.ts  Zod + phone + date + dedup per row
    ai.service.ts            all three Anthropic Claude calls
    dedup.service.ts         Redis Set per job for O(1) order ID dedup
    file.service.ts          upload dir management
    job.service.ts           job lifecycle helpers

  workers/
    validation.worker.ts     BullMQ consumer, calls runValidationPipeline

  queues/
    validation.queue.ts      lazy singleton Queue to prevent startup crash

  db/
    client.ts                pg Pool singleton
    migrations/              4 SQL migration files, run on startup
    repositories/            job, job-row, column-mapping, ai-summary

  utils/
    chunk-writer.ts          Writable stream, splits output into N-row CSV chunks
    stream-counter.ts        lightweight row count before pipeline starts
    phone-validator.ts       per-country regex from validation.config
    logger.ts                Winston JSON logger
```

### Validation Pipeline

```
fs.createReadStream(filePath)
  --> csv-parser()
  --> FieldRenameTransform        applies confirmed column mappings
  --> RowValidationTransform      Zod schema + phone regex + date parse + Redis dedup
        |                         batch-inserts to job_rows every 500 rows
        |                         updates jobs.processed_rows every batch
  --> ChunkedOutputWriter         Writable sink, writes validated_part_N.csv every 10k rows
```

`pipeline()` from `stream/promises` is used so errors propagate across all stages and the promise rejects cleanly on failure. `ChunkedOutputWriter` is a `Writable` (not `Transform`) so `pipeline()` can finish when the final callback fires rather than waiting for a downstream consumer.

---

## Database Schema

```sql
jobs               id, status, total_rows, processed_rows, valid_rows, invalid_rows,
                   output_paths[], file_path, error_message, created_at

column_mappings    job_id, uploaded_header, mapped_field, confidence, confirmed_by_user

job_rows           job_id, row_number, row_data (JSONB), status, errors (JSONB),
                   fix_suggestions (JSONB)

ai_summaries       job_id, summary_text, top_issues (JSONB), recommendations (JSONB)
```

---

## Validation Rules

Rules are config-driven in `validation.config.ts`. Adding a new country requires no code changes.

| Field | Rule |
|-------|------|
| order_date | YYYY-MM-DD, DD/MM/YYYY, or MM-DD-YYYY — Day.js strict mode |
| customer_phone | Per-country regex (IN, SG, US configured) |
| payment_mode | Enum: UPI, CARD, NETBANKING, PAYPAL, CASH |
| quantity | Positive integer |
| unit_price / total_amount | Non-negative number |
| order_id | Deduplicated per job via Redis Set |

---

## AI Features

All three features use `claude-haiku-4-5` via `@anthropic-ai/sdk`. Prompts enforce JSON-only responses.

| Feature | Input | Output |
|---------|-------|--------|
| Column mapping | Headers + 5 sample rows | Field mapping with confidence 0-1 |
| Fix suggestions | Up to 50 errored rows | suggestedValue, reason, confidence per field |
| Validation summary | Job stats + error breakdown | Natural language report, cached in ai_summaries |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Inline styles, Google Fonts |
| State | Zustand 4, TanStack Query v5 |
| HTTP client | Axios |
| CSV preview | PapaParse |
| Backend | Node.js, Express, TypeScript |
| Validation | Zod v3, Day.js, custom phone regex |
| Queue | BullMQ over Upstash Redis |
| Database | PostgreSQL via node-postgres (pg) |
| AI | Anthropic Claude (claude-haiku-4-5) |
| File output | csv-parser (streaming), Archiver (ZIP) |
| Logging | Winston (JSON) |
| Frontend host | Vercel |
| Backend host | Render (Web Service) |
| Database host | Neon (PostgreSQL) |
| Redis host | Upstash |

---

## Environment Variables

### Backend

```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://validata-seven.vercel.app
DATABASE_URL=
REDIS_URL=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_FILE_SIZE_BYTES=524288000
CHUNK_SIZE=10000
BATCH_INSERT_SIZE=500
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX_REQUESTS=20
BULLMQ_CONCURRENCY=3
```

### Frontend

```
VITE_API_BASE_URL=https://datavalid-backend.onrender.com
VITE_MAX_FILE_SIZE_MB=500
VITE_POLL_INTERVAL_MS=2000
```

---

## Local Development

```bash
# Prerequisites: Node 20+, PostgreSQL, Redis

# Backend
cd datavalid-backend
cp .env.example .env      # fill in DATABASE_URL and REDIS_URL
npm install
npm run dev:all           # API on :3000

# Frontend
cd datavalid-frontend
cp .env.example .env      # set VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev               # UI on :5173
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root: datavalid-frontend, Framework: Vite |
| API + Worker | Render Web Service | Build: `npm install --include=dev && npm run build && cp -r src/db/migrations dist/db/migrations` |
| PostgreSQL | Neon | Standard connection string |
| Redis | Upstash | rediss:// TLS URL |

---

## Design Decisions

**Streaming over buffering.** The validation pipeline never loads the full file into memory. A 500 MB CSV processes with flat memory usage regardless of row count.

**Worker in-process.** The BullMQ worker runs inside the API process on Render rather than as a separate Background Worker service. This ensures the worker has access to the same ephemeral filesystem as the upload handler, avoiding cross-service file access issues on Render's free tier.

**Direct pg driver.** node-postgres was chosen over Prisma to avoid ORM overhead on a write-heavy batch insert loop where 500 rows are inserted per transaction.

**Redis Sets for deduplication.** Each job maintains a Redis Set of seen order IDs. Membership checks are O(1) and avoid a database round-trip per row during the hot validation path.

**AI responses cached.** Validation summaries are stored in the ai_summaries table after first generation. Subsequent requests serve from the database with no Anthropic API call.
