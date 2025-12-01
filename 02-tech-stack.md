# Tech Stack

## Overview

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Hono on Cloudflare Workers |
| Database | PostgreSQL on Neon |
| ORM | Drizzle ORM |
| Session Store | Cloudflare KV |
| Media Storage | Cloudflare R2 |
| CDN/Edge | Cloudflare |

---

## Frontend

| Component | Technology | Notes |
|-----------|------------|-------|
| **Framework** | React 18+ | Component-based UI |
| **Build Tool** | Vite | Fast HMR, optimized builds |
| **Styling** | TailwindCSS v4 | Utility-first, mobile-friendly |
| **State Management** | TanStack Query + Zustand | Server state + client state |
| **Routing** | React Router v6 | Client-side navigation |
| **HTTP Client** | Hono RPC / fetch | Type-safe API calls |

### Project Structure

```
/frontend
  ├── index.html
  ├── vite.config.ts
  ├── tailwind.config.js
  ├── tsconfig.json
  ├── /src
  │   ├── main.tsx                 # Entry point
  │   ├── App.tsx                  # Root component with routing
  │   ├── /components
  │   │   ├── /layout
  │   │   │   ├── TabNav.tsx       # All/Queries/Check-ins tabs
  │   │   │   ├── Header.tsx
  │   │   │   └── BottomNav.tsx
  │   │   ├── /conversations
  │   │   │   ├── ConversationList.tsx
  │   │   │   ├── ConversationItem.tsx
  │   │   │   ├── ConversationDetail.tsx
  │   │   │   └── NewConversation.tsx
  │   │   ├── /messages
  │   │   │   ├── MessageThread.tsx
  │   │   │   ├── MessageBubble.tsx
  │   │   │   ├── MessageInput.tsx
  │   │   │   ├── MediaMessage.tsx
  │   │   │   └── AudioPlayer.tsx
  │   │   ├── /checkins
  │   │   │   ├── CheckinList.tsx
  │   │   │   ├── CheckinDetail.tsx
  │   │   │   └── CheckinResponse.tsx
  │   │   └── /common
  │   │       ├── Badge.tsx
  │   │       ├── Avatar.tsx
  │   │       ├── Timestamp.tsx
  │   │       ├── LoadingSpinner.tsx
  │   │       └── MediaViewer.tsx
  │   ├── /hooks
  │   │   ├── useConversations.ts
  │   │   ├── useMessages.ts
  │   │   ├── useCheckins.ts
  │   │   └── useAuth.ts
  │   ├── /services
  │   │   └── api.ts               # API client
  │   ├── /store
  │   │   └── index.ts             # Zustand store
  │   ├── /types
  │   │   └── index.ts
  │   └── /utils
  │       ├── date.ts              # Timestamp formatting
  │       └── media.ts             # Media helpers
  └── /public
      └── manifest.json            # PWA manifest
```

---

## Backend

| Component | Technology | Notes |
|-----------|------------|-------|
| **Framework** | Hono | Lightweight, edge-optimized |
| **Runtime** | Cloudflare Workers (Prod) / Node.js (Dev) | Serverless edge / Local dev via @hono/node-server |
| **ORM** | Drizzle ORM | Type-safe, edge-compatible |
| **Validation** | Zod | Schema validation |
| **API Style** | REST | JSON request/response |

### Project Structure

```
/backend
  ├── wrangler.toml                # Cloudflare Workers config
  ├── drizzle.config.ts            # Drizzle migrations config
  ├── package.json
  ├── tsconfig.json
  ├── /src
  │   ├── index.ts                 # Hono app entry point
  │   ├── /routes
  │   │   ├── index.ts             # Route aggregator
  │   │   ├── auth.ts              # Authentication endpoints
  │   │   ├── conversations.ts     # Conversation CRUD
  │   │   ├── messages.ts          # Message operations
  │   │   ├── checkins.ts          # Check-in endpoints
  │   │   └── patients.ts          # Patient data
  │   ├── /middleware
  │   │   ├── auth.ts              # KV-based Session validation
  │   │   ├── cors.ts              # CORS configuration
  │   │   ├── db.ts                # Database injection
  │   │   └── logger.ts            # Request logging
  │   ├── /db
  │   │   ├── index.ts             # Drizzle + Neon connection
  │   │   ├── schema.ts            # Table definitions
  │   │   └── relations.ts         # Table relations
  │   ├── /services
  │   │   ├── auth.ts              # Auth services (Token generation)
  │   │   └── r2.ts                # R2 storage operations
  │   ├── /types
  │   │   ├── index.ts             # Shared types
  │   │   └── env.ts               # Environment bindings
  │   └── /utils
  │       ├── jwt.ts               # Token utilities
  │       └── timestamp.ts         # Date formatting
  └── /drizzle
      └── /migrations              # SQL migration files
          ├── 0000_initial.sql
          └── meta/
```

### Cloudflare Workers Configuration

```toml
# wrangler.toml
name = "doctor-dashboard-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "doctor-dashboard-media"

# Secrets (set via wrangler secret put)
# NEON_DATABASE_URL
# JWT_SECRET
```

### Environment Types

```typescript
// src/types/env.ts
export interface Env {
  // Cloudflare bindings
  MEDIA_BUCKET: R2Bucket;
  
  // Secrets
  NEON_DATABASE_URL: string;
  JWT_SECRET: string;
  
  // Variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
}
```

---

## Database

### PostgreSQL
- **Production/Staging**: Neon (Serverless PostgreSQL) via `@neondatabase/serverless`
- **Development**: Neon Local (via Neon CLI)
- Single source of truth for all data

### ORM: Drizzle

Why Drizzle over alternatives:

| Feature | Drizzle | Prisma | Kysely |
|---------|---------|--------|--------|
| Bundle size | ~35kb | ~2MB+ | ~30kb |
| Edge support | ✅ Native | ⚠️ Needs Accelerate | ✅ Native |
| Type safety | ✅ Excellent | ✅ Excellent | ✅ Good |
| SQL visibility | ✅ SQL-like syntax | ❌ Abstracted | ✅ Query builder |
| Neon integration | ✅ Built-in | ⚠️ Via adapter | ✅ Via driver |

See [Database Schema](./03-database-schema.md) for full Drizzle schema definitions.

---

## Media Storage: Cloudflare R2

### Configuration
```
Bucket: doctor-dashboard-media
Region: Auto (Cloudflare manages distribution)
Access: Private (pre-signed URLs only)
```

### Folder Structure
```
/media
  ├── /images
  │   └── {conversationId}/{timestamp}-{uuid}.{ext}
  ├── /videos
  │   └── {conversationId}/{timestamp}-{uuid}.{ext}
  └── /audio
      └── {conversationId}/{timestamp}-{uuid}.{ext}
```

### Supported Formats

| Type | Formats | Max Size |
|------|---------|----------|
| Image | JPG, PNG, WebP, HEIC | 10MB |
| Video | MP4, MOV, WebM | 50MB |
| Audio | OGG, MP3, WAV, M4A | 10MB |

### Upload Flow
```
1. Frontend requests upload URL from API
2. Backend generates pre-signed R2 PUT URL (5 min expiry)
3. Frontend uploads directly to R2
4. Frontend confirms upload, sends media key to API
5. API stores media reference in database
```

### Retrieval Flow
```
1. Frontend requests message with media
2. Backend generates pre-signed R2 GET URL (1 hour expiry)
3. Frontend displays media using signed URL
4. URL expires, re-requested if needed
```

---

## Infrastructure

| Component | Technology |
|-----------|------------|
| Edge Network | Cloudflare |
| SSL/TLS | Cloudflare (automatic) |
| Domain/DNS | Cloudflare |
| CI/CD | GitHub Actions (recommended) |
| Monitoring | Cloudflare Analytics + Sentry |

---

## Development Tools

| Purpose | Tool |
|---------|------|
| Package Manager | pnpm |
| Monorepo | Turborepo (optional) |
| Linting | ESLint + Biome |
| Formatting | Prettier |
| Type Safety | TypeScript (strict mode) |
| Testing | Vitest + Playwright |
| API Testing | Bruno / Hoppscotch |
