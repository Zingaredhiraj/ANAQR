# AnatoScan AR — RESTful API Documentation

The NestJS API runs on port 4000. Interactive Swagger documentation is available at `http://localhost:4000/api/docs`.

## Key Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /auth/login`: Authenticate with email & password, sets HTTP-only JWT cookies.
- `POST /auth/register`: Student self-registration.
- `POST /auth/logout`: Revokes refresh token and clears cookie.
- `GET /auth/me`: Retrieves current authenticated user context.

### Anatomical Catalog (`/api/v1/organs`)
- `GET /organs`: List organs with pagination, search, and system filters.
- `GET /organs/:slug`: Get full organ learning package (3D models, modules, disorders, quiz).
- `POST /organs`: Create new organ (Admin & Faculty only).
- `PATCH /organs/:id`: Update organ metadata.
- `DELETE /organs/:id`: Soft delete / archive organ.

### Physical QR Management (`/api/v1/qr`)
- `POST /qr/generate/:organId`: Generate high-res printable QR code.
- `GET /qr/:organId`: Retrieve active QR metadata and scan count.

### Scanner Telemetry (`/api/v1/scanner`)
- `POST /scanner/log`: Records anonymized physical scan event for department metrics.

### Formative Assessments (`/api/v1/quizzes`)
- `GET /quizzes/organ/:organId`: Retrieve quiz for organ.
- `POST /quizzes/:id/submit`: Submit student answers, calculate grade, and record attempt.

### Academic Feedback (`/api/v1/feedback`)
- `POST /feedback`: Submit peer rating and commentary.
- `GET /feedback`: Faculty/Admin triage review list.
