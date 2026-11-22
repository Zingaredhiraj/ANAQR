# AnatoScan AR — System Architecture

```mermaid
flowchart TD
    subgraph Physical Anatomy Lab
        Specimen[Physical Cadaver / Specimen / Model] -->|Attached Label| QRBadge[Permanent Organ QR Code]
    end

    subgraph Client Layer
        Smartphone[Medical Student Smartphone] -->|Camera Scan| Scanner[WebQR Camera Scanner /scan]
        Scanner -->|HTTP GET /o/:slug| QRLanding[Organ Direct Landing Page /o/heart]
        Browser[Faculty & Admin Web Portal] -->|Next.js 15 UI| Dashboards[Admin / Faculty / Student Dashboards]
    end

    subgraph 3D & AR Rendering Engine
        QRLanding --> ModelViewer[Google &lt;model-viewer&gt; Web Component]
        ModelViewer -->|Android| SceneViewer[Google Scene Viewer via Intent]
        ModelViewer -->|iOS Safari| QuickLook[Apple AR Quick Look .usdz]
        ModelViewer -->|Desktop / Laptop| WebGLCanvas[Interactive 3D Orbit Canvas]
    end

    subgraph Backend Services NestJS
        API[NestJS API Gateway :4000]
        Auth[JWT & Argon2id Auth Module]
        OrganMgr[Organs & Systems Module]
        QREngine[QR Generation & Scan Telemetry]
        QuizMgr[Quizzes & Assessments Module]
        Analytics[Real-time Engagement Analytics]
    end

    subgraph Data & Storage Persistence
        API --> Prisma[Prisma ORM 6]
        Prisma --> Postgres[(PostgreSQL 16 Database)]
        API --> Redis[(Redis 7 Cache & BullMQ)]
        API --> S3[(Cloudflare R2 / AWS S3 Object Storage)]
    end

    QRBadge -.->|Scanned by| Smartphone
    Dashboards --> API
    QRLanding --> API
```

## Architectural Highlights
1. **Permanent Slug Decoupling:** QR codes store unchanging endpoints (`/o/heart`). The underlying 3D models, textures, or educational modules can be updated by faculty without re-printing physical specimen labels.
2. **Zero-App-Install AR:** Uses Google `<model-viewer>` to seamlessly trigger native iOS QuickLook and Android SceneViewer AR experiences directly from the mobile browser without requiring students to install custom mobile apps.
3. **Institutional RBAC:** 4 tiered personas (Super Admin, Faculty Anatomist, Medical Student, Public Visitor).
