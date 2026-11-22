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

### 3. Backend on Render (1-Click Blueprint or Manual)

#### Option A: Using the included `render.yaml` Blueprint
1. Push your repository to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Connect your repository. Render automatically reads `render.yaml` and provisions:
   - PostgreSQL 16 database (`anatoscan-postgres`)
   - Redis 7 instance (`anatoscan-redis`)
   - Dockerized NestJS API (`anatoscan-api`) with healthcheck at `/api/v1/health` and auto-generated secrets.

#### Option B: Manual Setup on Render
1. Create a **PostgreSQL** database on Render.
2. Create a **Redis** instance on Render.
3. Create a **Web Service**:
   - Environment: `Docker`
   - Dockerfile path: `docker/Dockerfile.api`
   - Docker Context: `.`
   - Health Check Path: `/api/v1/health`
   - Port: `10000` (detected automatically from `PORT` env)
   - Environment variables:
     - `DATABASE_URL`: Connection string from your Render Postgres
     - `REDIS_URL`: Connection string from your Render Redis
     - `JWT_SECRET`: Random 32+ character string
     - `JWT_REFRESH_SECRET`: Random 32+ character string
     - `CORS_ORIGINS`: `https://*.vercel.app,https://<your-custom-domain>`
4. Run migrations in the Render Web Service Shell:
   ```bash
   npx prisma migrate deploy
   pnpm prisma:seed
   ```
