# How to Run CivicReport

## Production Mode (Docker, everything containerized)

```bash
cd ProjectHackaton

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Seed database (first time only)
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

App available at **http://localhost**

---

## Development Mode (hot reload)

```bash
cd ProjectHackaton

# 1. Start only DB + Redis
docker compose up -d

# 2. Backend (terminal 1)
cd backend
npm run dev

# 3. Frontend (terminal 2)
cd frontend
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000**

---

## Switching Between Modes

Always stop one before starting the other:

```bash
# Stop prod before starting dev
docker compose -f docker-compose.prod.yml down

# Stop dev before starting prod
docker compose down
```

---

## Quick Reference

| | Production | Development |
|---|---|---|
| Start command | `docker compose -f docker-compose.prod.yml up -d` | `docker compose up -d` + `npm run dev` in both folders |
| URL | http://localhost | http://localhost:5173 (frontend), http://localhost:5000 (API) |
| Hot reload | No | Yes |
| DB + Redis | Docker (internal) | Docker (ports on host) |

## Test Accounts

- **Admin:** admin@admin.com / admin123
- **User:** user@user.com / user123
