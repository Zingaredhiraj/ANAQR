# AnatoScan AR — Academic Anatomy Platform

> **Scan. Place. Explore.**
> A QR-based, browser-accessible anatomy learning and department management platform connecting physical anatomical specimens with interactive 3D and Augmented Reality digital assets.

---

## 1. Quick Start

### Prerequisites
- Node.js 20+ (Active LTS)
- pnpm 9.x (`npm install -g pnpm@9`)
- Docker Desktop (for PostgreSQL 16 & Redis 7)

### Local Development Setup

1. **Clone & install dependencies:**
   ```bash
   git clone <repo-url> AnatoScan
   cd AnatoScan
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL & Redis:**
   ```bash
   pnpm docker:up
   ```

4. **Initialize Database & Seed Demonstration Data:**
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   ```

5. **Start Development Servers:**
   ```bash
   # From monorepo root:
   pnpm dev
   ```
   - **Frontend Web:** http://localhost:3000
   - **Backend API & Swagger:** http://localhost:4000/api/docs
   - **Specimen Direct Landing:** http://localhost:3000/o/heart

---

## 2. Seed Accounts & Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Administrator** | `admin@anatoscan.edu` | `Admin@AnatoScan2024!` | Full department control, users, system settings, global telemetry |
| **Faculty / Anatomist** | `dr.sharma@anatoscan.edu` | `Faculty@2024!` | Organ curriculum authoring, 3D hotspots, quizzes, feedback |
| **Medical Student** | `student@anatoscan.edu` | `Student@2024!` | 3D/AR exploration, quizzes, progress tracking, bookmarks |

---

## 3. Technology Stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, TanStack Query v5, Framer Motion, Recharts
- **Spatial 3D & AR:** Google `<model-viewer>` v4, WebXR, Android SceneViewer, Apple Quick Look AR, Three.js
- **Backend:** NestJS 11, TypeScript, Prisma ORM 6, PostgreSQL 16, Redis 7, BullMQ, Argon2id, JWT
- **QR Engine:** jsQR (browser scanner), node-qrcode (high-res SVG/PNG generation)
- **Monorepo:** pnpm workspaces
