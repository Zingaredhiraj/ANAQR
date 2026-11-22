# AnatoScan AR — Testing Strategy & Verification

## Test Execution Suite

### 1. Monorepo Typecheck & Linting
```bash
# Typecheck shared package, backend API, and web frontend
pnpm typecheck
```

### 2. Backend Unit & Service Tests (Vitest / Jest)
```bash
cd apps/api
pnpm test
```
Tests cover:
- Authentication service (Argon2 hashing, JWT signing, password complexity)
- QR service (Slug resolution, data URL generation, SVG formatting)
- RBAC guards and role elevation prevention

### 3. Frontend Unit & Component Tests (React Testing Library)
```bash
cd apps/web
pnpm test
```
Tests cover:
- QR code scanning state transitions
- 3D Model viewer fallback and error handling
- Quiz player answer selection, scoring math, and review mode

### 4. End-to-End Tests (Playwright)
```bash
cd apps/web
pnpm test:e2e
```
E2E flows:
1. Scan redirect flow: navigating to `/o/heart` renders complete organ tabs.
2. Sign-in flow: login with faculty credentials unlocks authoring studio.
3. Formative quiz submission: answering 5 questions and validating score card.
