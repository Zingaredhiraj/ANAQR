# AnatoScan AR — Environment Setup Guide

## Environment Variables (.env)

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://anatoscan:anatoscan_dev@localhost:5432/anatoscan_db?schema=public` |
| `REDIS_URL` | Redis instance connection | `redis://localhost:6379` |
| `API_PORT` | NestJS backend port | `4000` |
| `NEXT_PUBLIC_API_URL` | API endpoint accessible by browser | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for signing access tokens | Min 64 chars random string |
| `JWT_EXPIRES_IN` | Access token lifespan | `7d` |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Min 64 chars random string |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `30d` |
| `CORS_ORIGINS` | Permitted browser origins | `http://localhost:3000` |
| `SUPER_ADMIN_EMAIL` | Default administrator account | `admin@anatoscan.edu` |
| `SUPER_ADMIN_PASSWORD` | Default administrator password | `Admin@AnatoScan2024!` |
