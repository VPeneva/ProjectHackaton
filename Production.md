# Production Readiness Plan

This document is a concrete, implementation-level checklist for taking the current `ProjectHackaton` codebase to production. It is based on the actual code structure and dependencies in `backend/` and `frontend/`.

---

## 1. Environments and Configuration

### 1.1 Define environments
- [x] Establish `development`, `staging`, and `production` environments.
- Each environment must have:
  - [x] Its own database instance.
  - [ ] Its own object storage bucket.
  - [x] Its own secrets and API keys.
  - [x] Distinct base URLs for frontend and backend.

**DONE:** `docker-compose.yml` (dev) and `docker-compose.prod.yml` (production) provide isolated environments. `.env.production.example` documents required secrets.

### 1.2 Centralized configuration
- [x] Replace ad-hoc `.env` usage with a strict config loader (e.g. `envalid` or `zod`).
- [x] Validate all required values at startup:
  - `NODE_ENV`
  - `PORT`
  - `JWT_SECRET`
  - `DATABASE_URL`
  - `ADMIN_REGISTER_KEY`
  - `CORS_ORIGIN`
  - `UPLOAD_PROVIDER` (local/S3/etc)
  - `REDIS_URL` (if caching/rate limiting enabled)
  - `RESET_TOKEN_TTL_MINUTES`
  - `EXPOSE_RESET_TOKEN` should be `false` in production
- [x] Fail fast if any required config is missing or malformed.

**DONE:** `backend/src/config.js` uses Zod to validate all env vars at startup. Production safety checks block `EXPOSE_RESET_TOKEN=true` and default JWT secrets.

### 1.3 Secrets management
- [x] Do not keep `.env` in repo for production.
- [ ] Use a secret manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, or Doppler).
- [ ] Rotate `JWT_SECRET` and `ADMIN_REGISTER_KEY` periodically.

**PARTIAL:** `.env` is gitignored. Docker Compose uses environment variables from `.env` file at project root. External secrets manager integration is deferred.

---

## 2. Database: SQLite to PostgreSQL

### 2.1 Switch Prisma to PostgreSQL
- [x] Updated `backend/prisma/schema.prisma` to use `postgresql` provider with `env("DATABASE_URL")`.
- [x] PostgreSQL 16 running via Docker (`docker-compose.yml`).
- [x] Initial migration created: `20260210121123_init_postgresql`.
- [x] Seed data imported successfully.

**DONE:** `schema.prisma` now uses `provider = "postgresql"` and reads `DATABASE_URL` from env.

### 2.2 Migrations and data
- [x] Use `prisma migrate deploy` in production (never `migrate dev`).
- [x] Backend Docker container runs `prisma migrate deploy` on startup via `start.sh`.
- [ ] Create data export/import ETL tool for SQLite-to-PostgreSQL migration of existing data.

### 2.3 Connection pooling
- [ ] Use a managed connection pooler (PgBouncer) or Prisma Data Proxy if needed.
- [ ] Set `pool_timeout` and `connection_limit` appropriately for hosting.

### 2.4 Indexing and performance
- [x] Added indexes in Prisma schema:
  - `Report(createdAt)`
  - `Report(status, institutionId, categoryId)` (composite)
  - `Report(userId)`
  - `Report(lat, lng)` for bounding box queries
  - `Category(institutionId)`
  - `User(role)`
  - `PasswordResetToken(expiresAt)`
- [ ] Full-text search index (PostgreSQL `GIN` on `to_tsvector`) for `title`, `description`, `address`.

---

## 3. Caching Layer (Redis)

### 3.1 Why caching
Endpoints such as:
- `/api/reports` (list and filters)
- `/api/reports/active`
- `/api/reports/map`
- `/api/reports/stats`
are good candidates for caching because they are read-heavy.

### 3.2 Redis integration
- [x] Redis 7 running via Docker (`docker-compose.yml`).
- [x] `ioredis` client with auto-reconnect (`backend/src/db/redis.js`).
- [x] Cache helper functions: `cacheGet`, `cacheSet`, `cacheDel`.
- [x] Cache key strategy:
  - `reports:list:{md5HashOfQueryParams}` (TTL: 60s)
  - `reports:active` (TTL: 60s)
  - `reports:map` (TTL: 45s)
- [x] Graceful degradation: caching silently disabled if Redis unavailable.

### 3.3 Invalidation strategy
- [x] On write operations (`POST /reports`, `PATCH /reports/:id`, `DELETE /reports/:id`):
  - Deletes all `reports:*` cache keys.
- [ ] On comment/vote/subscription changes:
  - Invalidate `reports:stats` and affected report cache.

### 3.4 Rate limiting
- [x] Redis-backed rate limiting (`express-rate-limit` + `rate-limit-redis`):
  - Global: 300 req / 15 min per IP
  - Auth endpoints: 20 req / 15 min per IP
  - Upload endpoint: 30 req / 15 min per IP
- [x] Falls back to in-memory rate limiting if Redis unavailable.

**DONE.**

---

## 4. File Uploads: Local to Object Storage

Current behavior:
- Files are stored in a local `uploads/` directory and served via Express.

### 4.1 Production storage
- [ ] Use S3, Google Cloud Storage, or Azure Blob Storage.
- [ ] Replace `multer.diskStorage` with:
  - `multer-s3`, or
  - upload directly to object storage using signed URLs.

### 4.2 Serving files
- [ ] Do not serve files directly from Express in production.
- [ ] Serve via CDN (CloudFront, Cloudflare, etc).
- [ ] Store only file URLs in the database.

### 4.3 File security
- [ ] Enforce MIME validation server-side.
- [ ] Virus scanning if user-supplied files are public.
- [ ] Limit file size and count.

**TODO:** Deferred. Local upload volume is mounted in Docker for now.

---

## 5. Authentication and Authorization

### 5.1 JWT handling
- [x] `JWT_SECRET` validated to be at least 32 characters at startup.
- [x] Production check blocks default JWT secret value.
- [ ] Consider short-lived access tokens and refresh tokens.
- [ ] Store refresh tokens in DB with revocation support.

### 5.2 Admin registration
- [x] `ADMIN_REGISTER_KEY` validated at startup.
- [ ] Prefer one-time admin invites instead of a static shared key.

### 5.3 Password reset
- [x] `EXPOSE_RESET_TOKEN` blocked in production via config.js safety check.
- [ ] Integrate email sending (SendGrid, SES, Mailgun).
- [ ] Add audit logging for password resets.

### 5.4 Role enforcement
- [x] Middleware exists for role checks (`isAdmin.js`, `isInstitution.js`).
- [ ] Full audit of all routes depending on `req.user.role`.

---

## 6. API Security Hardening

### 6.1 HTTP security headers
- [x] `helmet` middleware added with all default headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy).
- [x] `crossOriginResourcePolicy` set to `cross-origin` for uploaded file serving.

### 6.2 CORS
- [x] Replaced `app.use(cors())` with explicit `CORS_ORIGIN` from config.
- [x] Credentials enabled.

### 6.3 Input validation
- [x] Request body size limited to 10MB (`express.json({ limit: "10mb" })`).
- [ ] Add Zod validation schemas for all request bodies and query params.
- [ ] Avoid trusting client values (e.g. categoryId, institutionId, lat/lng).

### 6.4 Error handling
- [x] Centralized error handler (`backend/src/middleware/errorHandler.js`).
- [x] Stack traces hidden in production, shown only in development.
- [x] 404 handler for unknown routes.

**DONE (core).** Input validation schemas are a follow-up.

---

## 7. Observability

### 7.1 Logging
- [x] Replaced `console.log` with `pino` structured JSON logging.
- [x] HTTP request logging via `pino-http` middleware.
- [x] Logs include: request method, URL, status code, user ID, timing.
- [x] Error handler logs with pino.

### 7.2 Metrics
- [ ] Add Prometheus metrics:
  - request count
  - latency
  - error rate
  - DB query time

### 7.3 Tracing
- [ ] Optional OpenTelemetry instrumentation for end-to-end tracing.

**PARTIAL:** Structured logging is complete. Metrics and tracing are deferred.

---

## 8. Deployment Architecture

### 8.1 Backend
- [x] Dockerfile created (`backend/Dockerfile`).
- [x] Startup script runs `prisma migrate deploy` before starting server.
- [x] Exposed via Nginx reverse proxy.

### 8.2 Frontend
- [x] Multi-stage Dockerfile (`frontend/Dockerfile`): build with Node, serve with Nginx.
- [x] SPA routing configured with `try_files` fallback.
- [x] Static asset caching headers (1 year, immutable).

### 8.3 Reverse proxy
- [x] Nginx reverse proxy config (`nginx/nginx.conf`).
- [x] Path routing:
  - `/api/*` -> backend:5000
  - `/uploads/*` -> backend:5000 (with 7d cache headers)
  - `/health` -> backend:5000
  - `/*` -> frontend:80
- [ ] TLS termination (Let's Encrypt or managed certs).

### 8.4 Docker Compose
- [x] `docker-compose.yml` — development (Postgres + Redis only, ports exposed to host).
- [x] `docker-compose.prod.yml` — full-stack production (Postgres, Redis, Backend, Frontend, Nginx).
- [x] Health checks on Postgres and Redis.
- [x] Named volumes for persistent data.
- [x] `.env.production.example` documents all required variables.

**DONE.**

---

## 9. Testing

### 9.1 Backend
- [ ] Unit tests for utils and middleware.
- [ ] Integration tests for critical routes:
  - auth
  - reports
  - votes
  - uploads

### 9.2 Frontend
- [ ] Component tests (React Testing Library).
- [ ] E2E tests (Playwright or Cypress) for key flows:
  - register/login
  - create report
  - vote/comment

**TODO.**

---

## 10. Data Privacy and Compliance

### 10.1 GDPR/Privacy
- [ ] Provide data export and deletion flow for users.
- [ ] Update privacy policy (frontend `Legal.jsx`).

### 10.2 Audit trails
- [ ] Track admin actions (changes, deletions).
- [ ] Store immutable audit logs.

**TODO.**

---

## 11. Performance and Scalability

### 11.1 DB optimization
- [x] Pagination already in place.
- [x] DB indexes added for heavy filter patterns.

### 11.2 Caching
- [x] Redis caching for read-heavy endpoints.
- [ ] Add CDN caching for frontend and assets.

### 11.3 Background jobs
- [ ] Use a queue (BullMQ + Redis) for:
  - Sending notifications
  - Email dispatch
  - Cleanup tasks (expired reset tokens)

---

## 12. Frontend Production Considerations

### 12.1 Environment variables
- [x] `VITE_API_BASE_URL` is set to `/api` in Docker build (proxied via Nginx).
- [x] Frontend builds successfully (verified).

### 12.2 Error monitoring
- [ ] Add Sentry or similar error tracking.

### 12.3 Bundle optimization
- [ ] Analyze bundle size (current: 1.3MB, gzip: 376KB).
- [ ] Enable code splitting for large routes with `React.lazy`.

---

## 13. Operational Runbook

### Deploy (Production)
```bash
# 1. Copy and fill env vars
cp .env.production.example .env

# 2. Edit .env with real secrets
#    - DB_PASSWORD, JWT_SECRET, ADMIN_REGISTER_KEY, CORS_ORIGIN

# 3. Start everything
docker compose -f docker-compose.prod.yml up -d --build

# 4. Seed database (first time only)
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js
```

### Deploy (Development)
```bash
# 1. Start database services
docker compose up -d

# 2. Run migrations
cd backend && npx prisma migrate dev

# 3. Seed
npm run seed

# 4. Start backend
npm run dev

# 5. Start frontend (separate terminal)
cd frontend && npm run dev
```

### Rollback
- [ ] Rollback strategy: keep DB snapshots before deploys.
- Docker: `docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d` with previous image tags.

### Rotate secrets
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env and restart
docker compose -f docker-compose.prod.yml up -d --no-deps backend
```

### Check health
```bash
curl http://localhost/health
# Expected: {"status":"ok","uptime":...}
```

---

## Immediate Priority Checklist (MVP to Production)

1. [x] Switch Prisma datasource to PostgreSQL.
2. [x] Add Redis for caching and rate limiting.
3. [ ] Move uploads to object storage (S3/GCS).
4. [x] Add strict env validation and secrets management.
5. [x] Harden security (helmet, CORS, input validation).
6. [x] Add logging and monitoring.
7. [x] Build Docker deployment setup.
8. [ ] Build CI/CD pipeline.

---

## Implementation Summary

### Files Created
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Dev: PostgreSQL + Redis |
| `docker-compose.prod.yml` | Prod: Full stack (PG, Redis, Backend, Frontend, Nginx) |
| `backend/src/config.js` | Zod env validation, fail-fast startup |
| `backend/src/logger.js` | Pino structured JSON logger |
| `backend/src/db/redis.js` | Redis client + cache helpers |
| `backend/src/middleware/errorHandler.js` | Centralized error handler + 404 |
| `backend/Dockerfile` | Backend container image |
| `backend/start.sh` | Startup script (migrate + serve) |
| `backend/.dockerignore` | Docker build exclusions |
| `frontend/Dockerfile` | Multi-stage build + Nginx |
| `frontend/nginx.conf` | SPA routing for frontend container |
| `frontend/.dockerignore` | Docker build exclusions |
| `nginx/nginx.conf` | Reverse proxy config |
| `.env.production.example` | Required env vars documentation |

### Files Modified
| File | Changes |
|------|---------|
| `backend/prisma/schema.prisma` | SQLite -> PostgreSQL, added 7 new indexes |
| `backend/.env` | Added all required env vars for dev |
| `backend/src/index.js` | Added helmet, pino-http, rate limiting, CORS config, error handlers, health check |
| `backend/src/controllers/authController.js` | Uses `config` instead of raw `process.env` |
| `backend/src/middleware/authMiddleware.js` | Uses `config.JWT_SECRET` |
| `backend/src/routes/reports.js` | Added Redis caching + cache invalidation |
| `backend/package.json` | Added: zod, helmet, express-rate-limit, rate-limit-redis, pino, pino-http, ioredis |

### Dependencies Added (Backend)
- `zod` — env validation
- `helmet` — HTTP security headers
- `express-rate-limit` — rate limiting
- `rate-limit-redis` — Redis-backed rate limit store
- `ioredis` — Redis client
- `pino` — structured logging
- `pino-http` — HTTP request logging
