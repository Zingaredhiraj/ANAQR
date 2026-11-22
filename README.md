# AnatoScan AR (AnaQR) — Academic Anatomy Learning & Management Platform

> **Scan. Place. Explore.**  
> A QR-based, browser-accessible anatomy learning and department management platform connecting physical anatomical specimens with interactive 3D and Augmented Reality (AR) digital assets.

---

## 📌 Overview

**AnatoScan AR (AnaQR)** bridges physical medical specimens and digital learning in anatomy laboratories. By affixing permanent, durable QR badges to physical cadaveric specimens, plastinated organs, and anatomical models, students and faculty can instantly access interactive 3D models, multi-layer anatomical annotations, cross-sectional views, and formative self-assessments directly in their mobile browser—without installing any native app.

---

## 🚀 Key Features

- **📱 Instant QR Scan & Direct Specimen Access:**
  - Built-in WebQR camera scanner (`/scan`) and standard camera app support.
  - Direct deep-linking to specimen learning modules (`/o/:slug`).
- **🫀 Interactive 3D & Augmented Reality (AR):**
  - Powered by Google `<model-viewer>` v4, WebXR, and Three.js.
  - One-tap AR projection into real physical space on Android (Google Scene Viewer) and iOS Safari (Apple Quick Look `.usdz`).
  - Interactive anatomical hotspots with structural descriptions, clinical correlations, and arterial/nerve supply data.
- **👥 Role-Based Access Control (RBAC):**
  - **Super Administrator:** Manage departments, faculty/students, system configurations, and macro telemetry.
  - **Faculty / Anatomist:** Author specimen curricula, manage 3D hotspots, design quizzes, and monitor engagement.
  - **Medical Student:** Explore 3D/AR models, take quizzes, track personal learning progress, and bookmark specimens.
- **📊 Real-time Lab Telemetry & Analytics:**
  - Track physical specimen interactions, scan frequencies, popular organs, and quiz completion metrics.
- **🏷️ Printable QR Badge Generation:**
  - High-resolution SVG/PNG badge generator formatted for physical lab tagging.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Web** | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, TanStack Query v5, Framer Motion, Recharts, Lucide Icons |
| **3D & AR Engine** | Google `<model-viewer>` v4, WebXR, Android Scene Viewer, Apple Quick Look AR, Three.js |
| **Backend API** | NestJS 11, TypeScript, Prisma ORM 6, BullMQ, Argon2id, JWT Auth |
| **Database & Cache** | PostgreSQL 16 (Relational schema), Redis 7 (Caching & telemetry queues) |
| **QR Engine** | `jsQR` (client-side scanner), `node-qrcode` (server-side badge rendering) |
| **Monorepo Tooling** | `pnpm` Workspaces, Turborepo structure, Docker & Docker Compose |

---

## 📂 Project Structure

```text
AnaQR/
├── apps/
│   ├── api/                     # NestJS backend application (Port 4000)
│   │   ├── prisma/              # Prisma schema, migrations, and seed scripts
│   │   └── src/                 # Auth, organs, QR, quizzes, scanner modules
│   └── web/                     # Next.js 15 frontend application (Port 3000)
│       ├── public/              # 3D models (.glb/.usdz), textures, icons
│       └── src/                 # App router, components, 3D viewer, scanner
├── packages/
│   └── shared/                  # Shared TypeScript types, schemas & DTOs
├── docker/                      # Docker Compose & Dockerfiles (Postgres, Redis)
├── docs/                        # Complete architecture & developer documentation
│   ├── ARCHITECTURE.md          # System diagram & data flow
│   ├── API_DOCUMENTATION.md     # REST endpoints & Swagger overview
│   ├── DATABASE_SCHEMA.md       # Entity-relationship schema
│   ├── DEPLOYMENT.md            # Production deployment instructions
│   ├── ENVIRONMENT_SETUP.md     # Dev environment configuration
│   └── TESTING.md               # Unit, E2E, and integration test setup
└── pnpm-workspace.yaml          # Workspace configuration
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher (Active LTS)
- **pnpm**: `v9.x` (`npm install -g pnpm@9`)
- **Docker & Docker Compose**: For local PostgreSQL 16 and Redis 7 instances

### Step-by-Step Installation

1. **Clone repository and enter project directory:**
   ```bash
   cd AnaQR/AnaQR
   ```

2. **Install all dependencies across monorepo:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(Update database credentials or port numbers in `.env` if customized).*

4. **Spin up PostgreSQL & Redis with Docker:**
   ```bash
   pnpm docker:up
   ```

5. **Initialize Database Schema & Seed Demo Data:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

6. **Start All Development Servers:**
   ```bash
   pnpm dev
   ```

---

## 🌐 Local Service Endpoints

| Service | URL | Purpose |
|---|---|---|
| **Frontend Portal** | [http://localhost:3000](http://localhost:3000) | Main student & faculty dashboard |
| **Web QR Scanner** | [http://localhost:3000/scan](http://localhost:3000/scan) | In-browser camera QR code reader |
| **Sample Specimen Landing** | [http://localhost:3000/o/heart](http://localhost:3000/o/heart) | Interactive 3D heart model |
| **Backend API** | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | Core RESTful services |
| **Interactive Swagger Docs**| [http://localhost:4000/api/docs](http://localhost:4000/api/docs) | OpenAPI specification & tester |
| **Prisma Studio (Optional)**| `pnpm db:studio` | Visual database manager at port 5555 |

---

## 🔐 Seed Accounts & Credentials

The seed script (`pnpm db:seed`) pre-populates default demo accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Administrator** | `admin@anatoscan.edu` | `Admin@AnatoScan2024!` | Full department control, system settings, global telemetry |
| **Faculty / Anatomist** | `dr.sharma@anatoscan.edu` | `Faculty@2024!` | Organ curriculum authoring, 3D hotspots, quizzes, feedback |
| **Medical Student** | `student@anatoscan.edu` | `Student@2024!` | 3D/AR exploration, quizzes, progress tracking, bookmarks |

---

## 📜 Monorepo Command Reference

| Command | Action |
|---|---|
| `pnpm dev` | Start web and API services concurrently |
| `pnpm build` | Compile shared packages, web app, and backend API |
| `pnpm lint` | Run ESLint check across all apps and packages |
| `pnpm test` | Run test suites across applications |
| `pnpm docker:up` | Launch PostgreSQL and Redis containers |
| `pnpm docker:down` | Stop and teardown local Docker containers |
| `pnpm db:generate` | Generate Prisma client code |
| `pnpm db:migrate` | Run Prisma database migrations |
| `pnpm db:seed` | Seed default organs, users, hotspots, and quizzes |
| `pnpm db:studio` | Open Prisma Studio visual database editor |

---

## 📚 In-Depth Documentation

For detailed guides, please refer to the documents in the [`docs/`](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs) directory:
- [Architecture & System Flow](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/ARCHITECTURE.md)
- [RESTful API Documentation](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/API_DOCUMENTATION.md)
- [Database Schema & ERD](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/DATABASE_SCHEMA.md)
- [Environment Setup & Configuration](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/ENVIRONMENT_SETUP.md)
- [Testing Guidelines](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/TESTING.md)
- [Production Deployment Guide](file:///home/dhiraj/Downloads/AnaQR/AnaQR/docs/DEPLOYMENT.md)

---

## 📄 License

Academic / Institutional use under the MIT License.
