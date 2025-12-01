# API Specification

## Overview

This document describes the REST API for the Healthy Dialogue doctor dashboard. The API is built with Hono on Cloudflare Workers.

**Source Code**: See the `backend/` directory for full implementation.

## Base URL

```
Production: https://api.healthydialogue.com
Development: http://localhost:8787
```

## Authentication

All endpoints (except `/api/auth/*`) require a valid JWT token.

**Token Location**: 
- Header: `Authorization: Bearer {token}`
- Query: `?token={token}`

---

## Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/validate` | Validate JWT token |
| GET | `/api/auth/me` | Get current doctor info |
| POST | `/api/auth/login-link` | Generate login link (TextIt/Phone) |
| POST | `/api/auth/logout` | Invalidate session |

**Implementation**: [`backend/src/routes/auth.ts`](./backend/src/routes/auth.ts) (Login Link), [`backend/src/index.ts`](./backend/src/index.ts) (Validate/Me)

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations with filtering |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/:id` | Get conversation details |
| GET | `/api/conversations/:id/messages` | Get messages (paginated) |
| POST | `/api/conversations/:id/messages` | Send message |
| PUT | `/api/conversations/:id/read` | Mark all as read |
| PUT | `/api/conversations/:id/close` | Close conversation |

**Implementation**: [`backend/src/routes/conversations.ts`](./backend/src/routes/conversations.ts)

### Check-ins

Check-ins are conversations with `type='checkin'`. These convenience endpoints provide filtered access:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checkins` | List check-in conversations |
| GET | `/api/checkins/:id` | Get check-in with messages |
| GET | `/api/checkins/count/today` | Count of today's check-ins |

Note: To respond to a check-in, use `POST /api/conversations/:id/messages` and optionally `PUT /api/conversations/:id/close`.

**Implementation**: [`backend/src/routes/checkins.ts`](./backend/src/routes/checkins.ts)

### Patients (Privacy-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List assigned patients |
| GET | `/api/patients/search?q=` | Search by name/phone |
| GET | `/api/patients/:id` | Get patient basic info |
| GET | `/api/patients/:id/vitals` | Get latest vitals |
| GET | `/api/patients/:id/programs` | Get programs (scoped + counts) |
| GET | `/api/patients/:id/prescriptions` | Get prescriptions (scoped + counts) |
| GET | `/api/patients/:id/lab-reports` | Get shared lab reports only |
| POST | `/api/patients/:id/history-request` | Request full history access |
| GET | `/api/patients/:id/history-request` | Get request status |

**Implementation**: [`backend/src/routes/patients.ts`](./backend/src/routes/patients.ts)

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Clinic statistics |
| GET | `/api/dashboard/schedule?date=` | Day's schedule |
| GET | `/api/dashboard/weekly-summary` | Weekly metrics |

**Implementation**: [`backend/src/routes/dashboard.ts`](./backend/src/routes/dashboard.ts)

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |

**Implementation**: [`backend/src/routes/appointments.ts`](./backend/src/routes/appointments.ts)

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/upload-url` | Get upload URL |
| PUT | `/api/media/upload/:key` | Upload file to R2 |
| GET | `/api/media/:key` | Retrieve media file |

**Implementation**: [`backend/src/routes/media.ts`](./backend/src/routes/media.ts)

---

## Request/Response Examples

### Generate Login Link

**Request**:
```http
POST /api/auth/login-link
Content-Type: application/json

{
  "identifier": "9876543210" 
}
```
*Identifier can be phone number or TextIt UUID*

**Response**:
```json
{
  "url": "http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1..."
}
```

### List Conversations

**Request**:
```http
GET /api/conversations?type=query&status=open&search=john
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "PzfgRCcoNHywyhbtY6So",
      "type": "query",
      "status": "open",
      "unreadCount": 2,
      "lastMessageAt": "2025-10-04T13:13:32+05:30",
      "lastMessagePreview": "Thank you doctor...",
      "lastMessageSender": "Patient",
      "patient": {
        "id": "4bbeb86e-b47b-4f95-b3ef-ff7bbf1c734d",
        "name": "Rajesh Kumar",
        "avatarUrl": null
      },
      "program": {
        "id": "abc123",
        "name": "Cardiac Care",
        "icon": "heart",
        "color": "#EF4444"
      }
    }
  ],
  "counts": {
    "total": 15,
    "unread": 8,
    "queries": 5,
    "checkins": 3
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 15
  }
}
```

### Send Message

**Request**:
```http
POST /api/conversations/PzfgRCcoNHywyhbtY6So/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Please continue taking the medication.",
  "contentType": "Text"
}
```

**Response**:
```json
{
  "id": "EKuUad1dtWSAq1EmZXdP"
}
```

### Send Media Message

**Request** (Step 1 - Get upload URL):
```http
POST /api/media/upload-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "filename": "prescription.pdf",
  "contentType": "application/pdf"
}
```

**Response**:
```json
{
  "key": "doctor-123/documents/1699012345-abc123.pdf",
  "uploadUrl": "https://api.healthydialogue.com/api/media/upload/...",
  "expiresIn": 3600
}
```

**Request** (Step 2 - Upload file):
```http
PUT /api/media/upload/doctor-123/documents/1699012345-abc123.pdf
Authorization: Bearer {token}
Content-Type: application/pdf

[binary file content]
```

**Request** (Step 3 - Send message with media):
```http
POST /api/conversations/PzfgRCcoNHywyhbtY6So/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Here's your prescription",
  "contentType": "Image",
  "mediaUrl": "https://api.healthydialogue.com/api/media/doctor-123/documents/...",
  "mediaKey": "doctor-123/documents/1699012345-abc123.pdf"
}
```

### Get Patient Details (Privacy-Scoped)

**Request**:
```http
GET /api/patients/4bbeb86e-b47b-4f95-b3ef-ff7bbf1c734d
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": {
    "id": "4bbeb86e-b47b-4f95-b3ef-ff7bbf1c734d",
    "name": "Rajesh Kumar",
    "phone": "+919876543210",
    "email": "rajesh@email.com",
    "dateOfBirth": "1975-03-15",
    "gender": "male",
    "avatarUrl": null,
    "currentProgram": {
      "id": "abc123",
      "name": "Cardiac Care",
      "icon": "heart",
      "color": "#EF4444"
    },
    "enrollmentStatus": "active",
    "enrollmentStartDate": "2025-09-01"
  }
}
```

### Get Patient Programs (Scoped)

**Request**:
```http
GET /api/patients/4bbeb86e-b47b-4f95-b3ef-ff7bbf1c734d/programs
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": {
    "myPrograms": [
      {
        "id": "enroll-123",
        "status": "active",
        "startDate": "2025-09-01",
        "endDate": null,
        "program": {
          "id": "abc123",
          "name": "Cardiac Care",
          "icon": "heart",
          "color": "#EF4444"
        }
      }
    ],
    "otherPrograms": {
      "activeCount": 2,
      "completedCount": 1
    }
  }
}
```

### Get Dashboard Stats

**Request**:
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": {
    "activePatients": 24,
    "pendingQueries": 8,
    "checkinsToday": 12,
    "appointmentsToday": 3,
    "totalUnread": 15
  }
}
```

### Request Medical History

**Request**:
```http
POST /api/patients/4bbeb86e-b47b-4f95-b3ef-ff7bbf1c734d/history-request
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "I need to review your complete history for the cardiac evaluation.",
  "requestPrescriptions": true,
  "requestLabReports": true,
  "requestOtherPrograms": true
}
```

**Response**:
```json
{
  "id": "request-uuid-123"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - No access to resource |
| 404 | Not Found |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error |

---

## Privacy Model

The API enforces strict privacy controls. Doctors can only access:

| Data Type | Visibility |
|-----------|------------|
| Patient Info | Only if active enrollment exists |
| Programs | Only their programs; others shown as counts |
| Prescriptions | Only their prescriptions; others shown as counts |
| Lab Reports | Only explicitly shared reports |
| Vitals | All vitals (full access if enrolled) |
| Full History | Requires patient approval via request workflow |

See [`backend/src/routes/patients.ts`](./backend/src/routes/patients.ts) for implementation.

---

## Backend File Structure

```
backend/
├── src/
│   ├── index.ts              # App entry point
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   ├── schema.ts         # Drizzle schema (all tables)
│   │   └── relations.ts      # Drizzle relations
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── db.ts             # Database injection
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── conversations.ts  # Conversation CRUD
│   │   ├── checkins.ts       # Check-in endpoints
│   │   ├── patients.ts       # Patient data (privacy-scoped)
│   │   ├── dashboard.ts      # Dashboard statistics
│   │   ├── appointments.ts   # Appointment management
│   │   └── media.ts          # R2 media storage
│   ├── types/
│   │   └── env.ts            # Environment types
│   └── utils/
│       └── id.ts             # ID generation utilities
├── drizzle/
│   └── migrations/           # Generated migrations
├── drizzle.config.ts         # Drizzle Kit config
├── package.json
├── tsconfig.json
└── wrangler.toml             # Cloudflare Workers config
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret |
| `MEDIA_BUCKET` | R2 bucket binding |
| `API_URL` | Base API URL for media URLs |
| `ENVIRONMENT` | `development` / `staging` / `production` |

---

## Complete Frontend-to-API Mapping

### Screen 1: Conversation List

| UI Element | API Endpoint |
|------------|--------------|
| Conversation Cards | `GET /api/conversations` |
| Search | `GET /api/conversations?search=` |
| Unread Badges | `counts` in response |
| Filter by Type | `GET /api/conversations?type=query` |

### Screen 2: Clinic Dashboard

| UI Element | API Endpoint |
|------------|--------------|
| Stats Grid | `GET /api/dashboard/stats` |
| Today's Schedule | `GET /api/dashboard/schedule` |
| Weekly Summary | `GET /api/dashboard/weekly-summary` |

### Screen 3: Chat Conversation

| UI Element | API Endpoint |
|------------|--------------|
| Header Info | `GET /api/conversations/:id` |
| Messages | `GET /api/conversations/:id/messages` |
| Send Message | `POST /api/conversations/:id/messages` |
| Mark Read | `PUT /api/conversations/:id/read` |

### Screen 4: Patient Details Tab

| UI Element | API Endpoint |
|------------|--------------|
| Profile | `GET /api/patients/:id` |
| Vitals | `GET /api/patients/:id/vitals` |
| Programs | `GET /api/patients/:id/programs` |
| Prescriptions | `GET /api/patients/:id/prescriptions` |
| Lab Reports | `GET /api/patients/:id/lab-reports` |
| Request History | `POST /api/patients/:id/history-request` |

### Screen 5: Check-In Detail

| UI Element | API Endpoint |
|------------|--------------|
| Check-in Content | `GET /api/checkins/:id` (returns conversation + messages) |
| Media Attachments | Included in messages |
| Send Response | `POST /api/conversations/:id/messages` |
| Close Check-in | `PUT /api/conversations/:id/close` |

### Screen 6: New Conversation

| UI Element | API Endpoint |
|------------|--------------|
| Patient List | `GET /api/patients` |
| Search | `GET /api/patients/search?q=` |
| Create Chat | `POST /api/conversations` |

---

## Version History

| Version | Changes |
|---------|---------|
| 1.0 | Initial API design |
| 2.0 | Added dashboard, appointments, search |
| 3.0 | Privacy-scoped patient endpoints |
| 3.1 | Frontend-to-API mapping |
| 4.0 | Moved code to separate backend files |
| 4.1 | Check-ins consolidated into conversations |
