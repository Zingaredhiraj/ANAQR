# AnatoScan AR — Relational Database Schema

Engineered with PostgreSQL 16 and Prisma ORM.

## Core Relational Entities

### 1. User & Authentication
- `User`: Primary account record with Argon2id password hash, role (`SUPER_ADMIN`, `FACULTY`, `STUDENT`), and active status.
- `FacultyProfile`: Bio, title, academic specialization, assigned department.
- `StudentProfile`: Year of study, enrollment number, learning streak metrics.
- `RefreshToken`: Stored hashed refresh tokens with automatic rotation.

### 2. Anatomical Systems & Organs
- `AnatomicalSystem`: The 10 body systems (Cardiovascular, Respiratory, etc.) with description and display ordering.
- `Organ`: Organ details, scientific name, Latin name, system relation, publication state (`DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `ARCHIVED`).
- `OrganContent`: Gross structure, internal architecture, arterial perfusion, and autonomic innervation.
- `AnatomicalStructure`: Specific identifiable structures / landmarks with 3D hotspot coordinates.
- `Disorder`: Clinical anomalies and congenital disorders with etiology and symptom profiles.
- `LearningModule`: The 3 core pedagogical modules (Physiology, Disorders, Clinical Diagnostics).

### 3. Spatial Assets & Physical Identifiers
- `Model3D`: GLB asset URLs, USDZ fallback, polygon counts, texture sizes, and bounding box dimensions.
- `QRCode`: Organ association, high-resolution SVG/PNG assets, and lifetime scan counters.
- `ScanEvent`: Telemetry record capturing timestamp, anonymized hashed IP, user agent, and referrer.

### 4. Pedagogy & Quality Control
- `Quiz`: Organ formative assessments with pass thresholds.
- `QuizQuestion`: Multiple-choice questions with answer choices and explanations.
- `QuizAttempt`: Student submission record with score and question-level responses.
- `Feedback`: Anonymous student feedback, star ratings, and faculty review triage.
- `AuditLog`: Immutable administrative audit trail for compliance and content changes.
