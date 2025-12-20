# FultonsMovies – Home Server & Docker Setup

This repository contains the **FultonsMovies** website and admin system, designed to run on a **self-hosted Linux home server** using **Docker Compose**.

The system is intentionally:
- Server-first
- Docker-native
- Low maintenance
- Secure by default
- Easy to operate remotely

This README reflects the **current state of the project**, including the admin system, user management, and UI improvements completed in recent development.

---

## 1. Host Environment

Typical host setup:

- Linux (Ubuntu / Debian-based)
- Docker & Docker Compose
- Single-node deployment
- Remote access via SSH / Tailscale
- External storage mounted for media & backups

Example host layout:

```
/
├── repos/
│   ├── website/          # this repository
│   └── monitoring/       # future monitoring stack
├── docker/
│   ├── nginx/
│   └── website/
├── disk1/
├── disk2/
├── disk3/
└── disk4/
```

The **internal SSD** is used for:
- Application code
- Docker containers
- PostgreSQL data
- Monitoring

External disks are reserved for **media storage and backups**.

---

## 2. Docker Architecture

```
Internet
   │
   ▼
NGINX (Reverse Proxy)
   │
   ├── HTTPS (Certbot)
   └── HTTP → HTTPS redirect
   │
   ▼
Next.js App (App Router)
   │
   ▼
PostgreSQL 16 (Prisma ORM)
```

Each service runs in its **own container**, connected via Docker networks.

Only **NGINX exposes ports 80/443** to the host.

---

## 3. Docker Compose Layout

The project is split into **separate Docker Compose stacks** for clarity and safety.

### Website stack

```
docker/website/
├── docker-compose.yml
├── Dockerfile
└── .env
```

Services:
- `website-app` → Next.js application
- `website-db` → PostgreSQL 16

### NGINX stack

```
docker/nginx/
├── docker-compose.yml
├── nginx.conf
└── certbot/
```

Services:
- `nginx-proxy`
- `certbot`

This separation allows:
- Independent restarts
- Cleaner networking
- Easier SSL renewal

---

## 4. Networking

Docker networks are explicitly defined:

- `web` → shared between NGINX and website
- `website_default` → internal app ↔ database traffic

The Next.js container is **never directly exposed to the internet**.

---

## 5. Authentication & Roles

Authentication uses **NextAuth (Credentials provider)**.

Roles:
- `USER`
- `ADMIN`

Authorization is enforced **server-side only**.

Guards:
- `requireAdmin()` → admin pages & Server Actions
- `requireAdminApi()` → API routes (if used)

Sessions persist until expiry or logout.

---

## 6. Admin Panel Overview

Admin routes:

```
/admin
/admin/users
/admin/system
/admin/maintenance
```

All admin routes are protected at the **layout level**.

The admin panel is:
- Server-rendered
- Server-action driven
- Free of client-side state
- Safe to operate remotely

---

## 7. Admin User Management (`/admin/users`)

The user management page is fully implemented using **Server Actions**.

### Capabilities

- View all users
- Add new users (email, name, role, password)
- Promote / demote users
- Reset user passwords
- Delete users (with confirmation)

### Safety Rules

- Admin **cannot delete or demote themselves**
- **Last remaining ADMIN cannot be deleted**
- Delete requires explicit confirmation checkbox
- All checks enforced server-side

---

## 8. Admin UI Design

### Design Principles

- No client-side JavaScript for admin logic
- No REST APIs for admin mutations
- Native HTML controls
- Predictable behaviour

### Actions Dropdown

Per-user actions are grouped under a native dropdown:

```html
<details>
  <summary>Actions ▾</summary>
  <!-- Promote / Reset / Delete -->
</details>
```

This provides:
- Clean table layout
- Reduced visual clutter
- Accessible keyboard navigation
- No hydration issues

---

## 9. Admin System Page (`/admin/system`)

Read-only operational overview for administrators.

Displays:
- Environment (DEV / PROD)
- Node.js version
- Database connectivity status
- Current admin session info

This page acts as a lightweight **system health dashboard**.

---

## 10. Database

- PostgreSQL 16
- Prisma ORM
- Data stored on internal SSD

Relevant schema:

```prisma
model User {
  id           String  @id @default(cuid())
  email        String  @unique
  name         String?
  role         Role    @default(USER)
  passwordHash String?
}

enum Role {
  USER
  ADMIN
}
```

---

## 11. Secrets & Environment Variables

Secrets are **never committed**.

Common variables:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Provided via:
- `.env` files (local)
- Docker secrets (production)

---

## 12. SSL & HTTPS

- SSL handled by Certbot container
- Certificates stored on host volume
- Automated renewal via cron
- NGINX reloads after renewal

Production traffic is **HTTPS-only**.

---

## 13. Deployment Workflow (Home Server)

Typical update process:

```bash
ssh homeserver
cd ~/repos/website
git pull
docker compose -f docker/website/docker-compose.yml build
docker compose -f docker/website/docker-compose.yml up -d
docker compose -f docker/nginx/docker-compose.yml up -d
```

This manual flow is intentional for home-server control.

---

## 14. Monitoring & Maintenance

Current:
- `/admin/system` health overview

Planned:
- Dedicated monitoring stack
- Disk usage alerts
- Backup automation

---

## 15. Design Philosophy

This system is designed to:
- Run unattended for long periods
- Be easy to recover
- Avoid unnecessary complexity
- Remain understandable months later

It deliberately avoids:
- Kubernetes
- Heavy client frameworks
- Over-engineered CI/CD

---

## 16. Planned Enhancements

- Audit logging for admin actions
- Forced password reset on next login
- Soft-delete users
- Automated database backups
- Media server integration

---

## 17. Summary

This project represents a **production-grade home server deployment**:

- Dockerised
- Secure by default
- Admin-safe
- Low maintenance
- Easy to extend

Designed for **real-world self-hosting**, not cloud-only environments.
