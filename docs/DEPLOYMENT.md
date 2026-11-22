# AnatoScan AR — Deployment Architecture

## Production Deployment Topology

```
                  +-----------------------------------+
                  |   Cloudflare / Route 53 DNS       |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
| Vercel / Edge Network |                       | Render / ECS / K8s    |
| Next.js 15 Web App    |                       | NestJS API Container  |
| (SSR + Static Assets) |                       | (Node.js 20 Alpine)   |
+-----------+-----------+                       +-----------+-----------+
            |                                               |
            +----------------- HTTPS API Call --------------+
                                                            |
                                        +-------------------+-------------------+
                                        |                   |                   |
                                        v                   v                   v
                            +-------------------+   +---------------+   +---------------+
                            | Managed Postgres  |   | Managed Redis |   | Cloudflare R2 |
                            | (Neon / Supabase) |   | (Upstash/Aiven|   | / AWS S3      |
                            +-------------------+   +---------------+   +---------------+
```

### 1. Docker Compose (Single Host Production)
Run complete stack with:
```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

### 2. Frontend on Vercel
- **Root Directory**: `apps/web`
- **Framework Preset**: `Next.js`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL=https://anatoscan-api.onrender.com/api/v1` (replace with your Render backend URL)
  - `NEXT_PUBLIC_APP_URL=https://<your-project>.vercel.app`

## Render Deployment (Backend & Frontend Web Services)

### 1. Blueprint Deployment (1-Click)
1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** -> **Blueprint**.
3. Select your repository `Zingaredhiraj/ANAQR`.
4. Render reads `render.yaml` and provisions:
   - **anatoscan-backend** (NestJS Web Service using `docker/Dockerfile.api`)
   - **anatoscan-frontend** (Next.js Web Service using `docker/Dockerfile.web`)
   - **anatoscan-postgres** (PostgreSQL 16)
   - **anatoscan-redis** (Redis 7)
5. Click **Apply**.

### 2. Manual Render Web Services Setup

#### A. Backend Web Service
- **Name**: `anatoscan-backend`
- **Environment**: `Docker`
- **Dockerfile Path**: `docker/Dockerfile.api`
- **Docker Context**: `.`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `DATABASE_URL`: Your Render Postgres internal connection URL
  - `REDIS_URL`: Your Render Redis internal connection URL
  - `JWT_SECRET`: Random 32+ character string
  - `JWT_REFRESH_SECRET`: Random 32+ character string
  - `CORS_ORIGINS`: `*` (or your frontend Render URL)

#### B. Frontend Web Service
- **Name**: `anatoscan-frontend`
- **Environment**: `Docker`
- **Dockerfile Path**: `docker/Dockerfile.web`
- **Docker Context**: `.`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://anatoscan-backend.onrender.com/api/v1`
  - `NEXT_PUBLIC_APP_URL`: `https://anatoscan-frontend.onrender.com`

#### Database Setup
In the Render Web Service Shell for `anatoscan-backend`, run:
```bash
npx prisma migrate deploy
pnpm prisma:seed
```
