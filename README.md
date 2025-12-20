# Website Architecture Overview

This document describes the **current, working architecture** of the home‑server website project. It reflects the state where **DEV is stable**, authentication/roles are implemented, and Docker + Makefile orchestration is in place.

---

## 1. High‑Level Architecture

The system is split into **DEV** and **PROD** modes, switched explicitly via Makefile commands.

```
Browser (LAN/WAN)
        │
        ▼
 ┌──────────────────┐
 │  NGINX (PROD)    │   ← Only in prod
 │  80 / 443        │
 └─────────┬────────┘
           │
           ▼
 ┌───────────────────────────────┐
 │      Next.js Application      │
 │  (DEV or PROD container)      │
 │                               │
 │  • Pages / App Router         │
 │  • API Routes                 │
 │  • NextAuth (JWT)             │
 │  • Role‑based auth            │
 └─────────┬─────────────────────┘
           │ Prisma
           ▼
 ┌───────────────────────────────┐
 │        PostgreSQL 16           │
 │   (DEV or PROD database)       │
 └───────────────────────────────┘
```

---

## 2. Containers

### DEV Environment

| Container | Image | Purpose | Ports |
|---------|------|--------|------|
| website-dev | node:20-alpine | Next.js dev server + API | 3000:3000 |
| website-dev-db | postgres:16 | Development database | internal |

- Started via: `make dev`
- URL: `http://192.168.0.15:3000`
- No nginx in DEV

### PROD Environment

| Container | Image | Purpose | Ports |
|---------|------|--------|------|
| nginx-proxy | nginx:alpine | Reverse proxy + SSL | 80 / 443 |
| website-app | custom build | Next.js production | internal |
| website-db | postgres:16 | Production database | internal |

- Started via: `make prod`
- Domain based (HTTPS)

---

## 3. Authentication & Authorization

### Authentication

- NextAuth with **Credentials provider**
- Passwords stored as **bcrypt hashes**
- JWT session strategy

### User Model

```
User
- id (cuid)
- email (unique)
- name
- role (USER | ADMIN)
- passwordHash
```

### Authorization Rules

| Area | Rule |
|----|----|
| /login | Public |
| / | Logged‑in users |
| /admin | ADMIN only |
| /api/admin/* | ADMIN only |

Non‑admin users:
- Redirected to `/` when accessing protected pages
- Receive 403 from admin API routes

---

## 4. Request Flows

### Login

```
User → /login
     → Credentials provider
     → Prisma (verify user)
     → JWT issued
```

### Admin Page

```
GET /admin
 → requireAdmin()
    ├─ no session → /login
    ├─ role USER → /
    └─ role ADMIN → render page
```

### Admin API

```
POST /api/admin/users
 → requireAdminApi()
    ├─ no session → 401
    ├─ USER → 403
    └─ ADMIN → DB action
```

---

## 5. Repository Structure

```
website/
├── docker/
│   ├── website/        # prod compose
│   └── nginx/          # reverse proxy
├── scripts/
│   ├── dev.sh
│   ├── prod.sh
│   ├── stop.sh
│   └── _common.sh
├── website_data/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── api/
│   │   │   └── login/
│   │   ├── auth/
│   │   ├── lib/
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
├── Makefile
└── mode
```

---

## 6. Makefile Workflow

| Command | Action |
|------|------|
| make dev | Start DEV containers |
| make prod | Start PROD stack |
| make stop | Stop all containers |
| make restart-dev | Clean restart DEV |
| make status | Show running containers |

Hard‑blocked so DEV and PROD cannot run simultaneously.

---

## 7. Design Decisions

### Why JWT (not DB sessions)
- Stateless
- Simple scaling
- Works cleanly in Docker

### Why DEV uses node:alpine
- Fast startup
- Matches Prisma musl target

### Why strict role enforcement
- Prevents privilege escalation
- API & UI both protected

---

## 8. Known Limitations (acceptable)

- No password reset UI yet
- No audit log
- Single‑node deployment

---

## 9. Next Planned Features

- Admin user management UI
- Promote / demote roles
- Password reset flow
- Monitoring stack

---

## 10. Data Persistence & Volumes

The system is designed so containers are disposable, while data persists.

### PostgreSQL
- DEV and PROD databases run in separate containers
- Data is stored in Docker volumes
- Rebuilding or redeploying containers does NOT remove data

### Application Code
- DEV mounts the source code directly for hot reload
- PROD uses a built, immutable image

### Secrets
- Secrets (e.g. NEXTAUTH_SECRET) are provided via Docker secrets
- Secrets are never committed to the repository

| Data | Storage | Persistent |
|----|----|----|
| Dev DB | Docker volume | ✅ |
| Prod DB | Docker volume | ✅ |
| Prisma migrations | Git | ✅ |
| JWT secret | Docker secret | ✅ |
| SSL certificates | nginx volume | ✅ |

## 11. Environment Variables

| Variable | DEV | PROD | Description |
|-------|-----|------|------------|
| NEXTAUTH_URL | http://192.168.0.15:3000 | https://domain | Public site URL |
| NEXTAUTH_SECRET | Docker secret | Docker secret | JWT encryption |
| DATABASE_URL | Internal | Internal | Prisma connection |
| NODE_ENV | development | production | Runtime mode |

## 12. Known Failure Modes

- Changing NEXTAUTH_SECRET will invalidate all active sessions
- Running DEV while PROD nginx is active will cause port conflicts
- Prisma client and database schema must stay in sync
- Deleting database volumes will permanently remove user data

## 13. Administrative Responsibilities

Admin users are responsible for:

- Managing user accounts and roles
- Monitoring system health
- Performing maintenance tasks
- Managing application configuration

These responsibilities are enforced through role-based access control.


