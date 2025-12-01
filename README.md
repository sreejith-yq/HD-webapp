# Healthy Dialogue - Doctor Dashboard

A mobile-friendly web dashboard for doctors to manage patient queries and check-ins, inspired by WhatsApp's familiar chat-based UX patterns.

## Quick Links

| Document | Description |
|----------|-------------|
| [Product Requirements](./01-product-requirements.md) | Features, user flows, UI/UX specifications |
| [Tech Stack](./02-tech-stack.md) | Frontend, backend, infrastructure details |
| [Database Schema](./03-database-schema.md) | PostgreSQL with Drizzle ORM |
| [API Specification](./04-api-specification.md) | Endpoints, request/response formats |
| [Authentication](./06-authentication.md) | JWT tokens, WhatsApp notification flow |
| [UI Feature List](./07-ui-feature-list.md) | Quick reference for all UI components |

## Backend Source Code

| Path | Description |
|------|-------------|
| [`backend/src/index.ts`](./backend/src/index.ts) | Hono app entry point |
| [`backend/src/routes/`](./backend/src/routes/) | API route handlers |
| [`backend/src/db/schema.ts`](./backend/src/db/schema.ts) | Drizzle ORM schema |
| [`backend/src/middleware/`](./backend/src/middleware/) | Auth & DB middleware |
| [`backend/wrangler.toml`](./backend/wrangler.toml) | Cloudflare Workers config |

## Prototypes

| File | Description |
|------|-------------|
| [healthy-dialogue-prototype.html](./healthy-dialogue-prototype.html) | Standalone HTML prototype (open in browser) |
| [HealthyDialoguePrototype.jsx](./HealthyDialoguePrototype.jsx) | React component version |

---

## Branding

| Element | Value |
|---------|-------|
| App Name | Healthy Dialogue |
| Tagline | Patient Inbox |
| Primary Color | #5ce1e6 (Cyan) |
| Highlight Color | #180f63 (Navy) |

---

## Project Summary

### What We're Building
A WhatsApp-style interface for healthcare providers to:
- View and respond to patient queries (threaded conversations)
- Review and respond to patient check-ins (single response)
- Initiate new conversations with patients
- Handle multimedia messages (text, images, video, audio)
- View patient health data with privacy controls

### Key Features

| Feature | Description |
|---------|-------------|
| Bottom Navigation | Conversations + Clinic Dashboard tabs |
| Search Bar | Integrated in header for patient/message search |
| Squircle Avatars | Rounded square avatars for all patients |
| Patient Details Tab | Two-tab layout in chat (Conversation + Details) |
| Privacy-Scoped Data | Doctor sees only their relationship data |
| Full History Request | Button to request patient approval for full access |

### Privacy Model

Doctors can only view patient data within their direct relationship:

| Data Type | Visibility |
|-----------|------------|
| Therapy Programs | Only programs where doctor is assigned |
| Prescriptions | Only prescriptions written by the doctor |
| Lab Reports | Only reports patient has shared for the program |
| Other Data | Requires patient approval |

### Key Design Decisions

| Decision | Choice |
|----------|--------|
| Navigation | Bottom nav (not top tabs) |
| Avatar Shape | Squircle (rounded square) |
| Check-in threading | Single response only |
| Conversation status | Binary: "open" or "closed" |
| Doctor-initiated conversations | Yes, via FAB button |
| Authentication | JWT via WhatsApp link (24-hour validity) |
| Database | PostgreSQL (Neon) with Drizzle ORM |

### Tech Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React + Vite + TailwindCSS                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                 Hono on Cloudflare Workers                  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐  ┌─────────────────┐
          │ PostgreSQL/Neon │  │  Cloudflare R2  │
          │   (database)    │  │    (media)      │
          └─────────────────┘  └─────────────────┘
```

### Target Users
- **Primary**: Doctors managing patient communications
- **Secondary**: Clinic administrators
- **Region**: India (initially)

---

## Screen Overview

| # | Screen | Access | Purpose |
|---|--------|--------|---------|
| 1 | Conversation List | Default | View all patient conversations |
| 2 | Clinic Dashboard | Bottom nav | View stats and schedule |
| 3 | Chat Conversation | Tap conversation | Message thread with patient |
| 4 | Patient Details | Tab in chat | View patient health data |
| 5 | Check-In Detail | Tap check-in | Review and respond to check-in |
| 6 | New Conversation | Tap FAB | Select patient for new chat |

---

## Document Versions

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial draft |
| 1.1 | Nov 2025 | Added confirmed design decisions |
| 1.2 | Nov 2025 | Added tech stack details |
| 2.0 | Nov 2025 | Split docs, Drizzle ORM schema |
| 3.0 | Nov 2025 | Healthy Dialogue branding, bottom nav, squircle avatars |
| 3.1 | Nov 2025 | Patient Details tab, privacy-scoped data visibility |
| 3.2 | Nov 2025 | Complete API & database coverage for all frontend features |
| 4.0 | Dec 2025 | PostgreSQL-only, removed Firestore/migration references |

---

## API & Database Coverage

All frontend features are fully backed by API endpoints and database tables:

| Screen | Endpoints | Tables |
|--------|-----------|--------|
| Conversation List | 2 endpoints | 4 tables |
| Clinic Dashboard | 3 endpoints | 5 tables |
| Chat Conversation | 5 endpoints | 3 tables |
| Patient Details | 7 endpoints | 8 tables |
| Check-In Detail | 2 endpoints | 3 tables |
| New Conversation | 3 endpoints | 4 tables |

**Total**: 22 API endpoints across 18 database tables

See [API Specification](./04-api-specification.md#complete-frontend-to-api-to-database-mapping) for the complete mapping.

---

*Status: Approved - Ready for Development*
