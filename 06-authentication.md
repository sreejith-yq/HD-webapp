# Authentication

## Overview

The Doctor Dashboard uses a JWT-based authentication system integrated with WhatsApp notifications. Doctors receive a link via WhatsApp containing a one-time authentication token valid for 24 hours.

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                             │
│                                                                      │
│  ┌──────────┐    1. Pending      ┌──────────────┐                   │
│  │  Backend │───conversations───▶│  Notification │                   │
│  │  System  │    detected        │   Service     │                   │
│  └──────────┘                    └──────┬───────┘                   │
│                                         │                            │
│                                         │ 2. Generate JWT            │
│                                         │    (24hr expiry)           │
│                                         ▼                            │
│                                  ┌──────────────┐                   │
│                                  │   WhatsApp   │                   │
│                                  │   Message    │                   │
│                                  └──────┬───────┘                   │
│                                         │                            │
│                                         │ 3. Send link with token    │
│                                         ▼                            │
│  ┌──────────┐                    ┌──────────────┐                   │
│  │  Doctor  │◀───────────────────│   Doctor's   │                   │
│  │          │                    │   WhatsApp   │                   │
│  └────┬─────┘                    └──────────────┘                   │
│       │                                                              │
│       │ 4. Click link                                               │
│       ▼                                                              │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  https://dashboard.example.com/?token=eyJhbGciOiJIUzI1... │       │
│  └──────────────────────────────────────────────────────────┘       │
│       │                                                              │
│       │ 5. Validate token                                           │
│       ▼                                                              │
│  ┌──────────┐    6. API calls    ┌──────────────┐                   │
│  │  React   │───with Bearer───▶  │   Hono API   │                   │
│  │  App     │◀──────────────────│              │                   │
│  └──────────┘                    └──────────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## JWT Token Specification

### Token Structure

```typescript
interface JWTPayload {
  doctorId: string;      // UUID of the doctor
  iat: number;           // Issued at (Unix timestamp)
  exp: number;           // Expiration (Unix timestamp, +24 hours)
  jti?: string;          // Optional: JWT ID for single-use enforcement
}
```

### Token Generation (Backend)

```typescript
// services/auth.ts
import { sign } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';

interface GenerateTokenOptions {
  doctorId: string;
  secret: string;
  expiresInHours?: number;
}

export async function generateAuthToken({
  doctorId,
  secret,
  expiresInHours = 24,
}: GenerateTokenOptions): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    doctorId,
    iat: now,
    exp: now + (expiresInHours * 60 * 60),
    jti: uuidv4(), // Unique token ID
  };

  return await sign(payload, secret);
}

// Usage
const token = await generateAuthToken({
  doctorId: '9d8e388f-45b9-426e-a629-8eac4533ef9b',
  secret: process.env.JWT_SECRET,
});

const dashboardUrl = `https://dashboard.example.com/?token=${token}`;
```

### Token Validation (Hono Middleware)

```typescript
// middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { eq, and, gt } from 'drizzle-orm';
import { authTokens, doctors } from '../db/schema';
import { Env } from '../types/env';

declare module 'hono' {
  interface ContextVariableMap {
    doctorId: string;
    doctor: {
      id: string;
      name: string;
      email: string | null;
    };
  }
}

export const authMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    // Skip auth for public routes
    if (c.req.path === '/api/auth/validate') {
      return next();
    }

    // Extract token
    const authHeader = c.req.header('Authorization');
    const queryToken = c.req.query('token');
    const token = authHeader?.replace('Bearer ', '') || queryToken;

    if (!token) {
      return c.json({ 
        error: 'Authentication required',
        code: 'MISSING_TOKEN' 
      }, 401);
    }

    try {
      // Verify JWT signature and expiration
      const payload = await verify(token, c.env.JWT_SECRET);
      
      const doctorId = payload.doctorId as string;
      const jti = payload.jti as string | undefined;

      // Optional: Check if token has been invalidated (single-use)
      if (jti) {
        const db = c.get('db');
        const [tokenRecord] = await db
          .select()
          .from(authTokens)
          .where(
            and(
              eq(authTokens.tokenHash, hashToken(jti)),
              eq(authTokens.isValid, true),
              gt(authTokens.expiresAt, new Date())
            )
          )
          .limit(1);

        if (!tokenRecord) {
          return c.json({ 
            error: 'Token has been revoked or expired',
            code: 'INVALID_TOKEN' 
          }, 401);
        }

        // Mark token as used (optional: for strict single-use)
        // await db.update(authTokens)
        //   .set({ usedAt: new Date() })
        //   .where(eq(authTokens.id, tokenRecord.id));
      }

      // Fetch doctor details
      const db = c.get('db');
      const [doctor] = await db
        .select({
          id: doctors.id,
          name: doctors.name,
          email: doctors.email,
        })
        .from(doctors)
        .where(eq(doctors.id, doctorId))
        .limit(1);

      if (!doctor) {
        return c.json({ 
          error: 'Doctor not found',
          code: 'DOCTOR_NOT_FOUND' 
        }, 404);
      }

      // Set context variables
      c.set('doctorId', doctorId);
      c.set('doctor', doctor);

      await next();
    } catch (error) {
      if (error.name === 'JwtTokenExpired') {
        return c.json({ 
          error: 'Token has expired. Please use the latest link from WhatsApp.',
          code: 'TOKEN_EXPIRED' 
        }, 401);
      }

      return c.json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN' 
      }, 401);
    }
  }
);

function hashToken(token: string): string {
  // Use a proper hash function in production
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
    .then(hash => btoa(String.fromCharCode(...new Uint8Array(hash))));
}
```

---

## Frontend Authentication

### Token Extraction and Storage

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

interface Doctor {
  id: string;
  name: string;
  email: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  doctor: Doctor | null;
  error: string | null;
}

export function useAuth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    doctor: null,
    error: null,
  });

  useEffect(() => {
    async function validateToken() {
      // Check URL for token
      const urlToken = searchParams.get('token');
      
      // Check sessionStorage for existing token
      const storedToken = sessionStorage.getItem('auth_token');
      
      const token = urlToken || storedToken;

      if (!token) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          doctor: null,
          error: 'No authentication token found',
        });
        return;
      }

      try {
        // Validate token with backend
        const response = await api.auth.validate(token);

        if (response.valid) {
          // Store token in sessionStorage (not localStorage for security)
          sessionStorage.setItem('auth_token', token);
          
          // Remove token from URL for cleaner UX
          if (urlToken) {
            searchParams.delete('token');
            setSearchParams(searchParams, { replace: true });
          }

          setState({
            isAuthenticated: true,
            isLoading: false,
            doctor: response.doctor,
            error: null,
          });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        sessionStorage.removeItem('auth_token');
        setState({
          isAuthenticated: false,
          isLoading: false,
          doctor: null,
          error: error.message || 'Authentication failed',
        });
      }
    }

    validateToken();
  }, [searchParams, setSearchParams]);

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    setState({
      isAuthenticated: false,
      isLoading: false,
      doctor: null,
      error: null,
    });
  };

  return { ...state, logout };
}
```

### API Client with Auth

```typescript
// src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.example.com';

function getAuthHeader(): HeadersInit {
  const token = sessionStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired - clear and redirect
    sessionStorage.removeItem('auth_token');
    window.location.href = '/expired';
  }

  return response;
}

export const api = {
  auth: {
    validate: async (token: string) => {
      const response = await fetch(
        `${API_BASE}/api/auth/validate?token=${token}`
      );
      return response.json();
    },
  },

  conversations: {
    list: async (params?: { type?: string; status?: string }) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(`/api/conversations?${query}`);
      return response.json();
    },

    get: async (id: string) => {
      const response = await fetchWithAuth(`/api/conversations/${id}`);
      return response.json();
    },

    // ... other methods
  },

  // ... other resources
};
```

### Protected Routes

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { Conversation } from './pages/Conversation';
import { Loading } from './components/common/Loading';
import { Expired } from './pages/Expired';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return <Loading message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/expired" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/expired" element={<Expired />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/:id"
          element={
            <ProtectedRoute>
              <Conversation />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Token Expiration Page

```typescript
// src/pages/Expired.tsx
export function Expired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Session Expired
        </h1>
        <p className="text-gray-600 mb-6">
          Your authentication link has expired. Please check your WhatsApp for
          a new link, or wait for the next notification.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Authentication links are valid for 24
            hours. You'll receive a new link via WhatsApp when you have pending
            patient queries.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## WhatsApp Notification Service

```typescript
// services/notification.ts (Backend - runs on schedule)
import { getDb } from '../db';
import { conversations, doctors } from '../db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { generateAuthToken } from './auth';

interface PendingDoctor {
  doctorId: string;
  doctorName: string;
  doctorPhone: string;
  pendingCount: number;
}

export async function sendPendingNotifications() {
  const db = getDb();

  // Find doctors with pending conversations
  const pendingDoctors = await db
    .select({
      doctorId: doctors.id,
      doctorName: doctors.name,
      doctorPhone: doctors.phone,
      pendingCount: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .innerJoin(doctors, eq(conversations.doctorId, doctors.id))
    .where(
      and(
        eq(conversations.status, 'open'),
        gt(conversations.unreadCount, 0)
      )
    )
    .groupBy(doctors.id, doctors.name, doctors.phone);

  for (const doctor of pendingDoctors) {
    // Generate auth token
    const token = await generateAuthToken({
      doctorId: doctor.doctorId,
      secret: process.env.JWT_SECRET!,
    });

    // Store token record
    await db.insert(authTokens).values({
      doctorId: doctor.doctorId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Build dashboard URL
    const dashboardUrl = `https://dashboard.example.com/?token=${token}`;

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: doctor.doctorPhone,
      template: 'pending_queries',
      params: {
        doctor_name: doctor.doctorName,
        pending_count: doctor.pendingCount,
        dashboard_url: dashboardUrl,
      },
    });

    console.log(`Sent notification to ${doctor.doctorName}: ${doctor.pendingCount} pending`);
  }
}

// WhatsApp Business API integration
async function sendWhatsAppMessage(options: {
  to: string;
  template: string;
  params: Record<string, string | number>;
}) {
  // Implement using WhatsApp Business API
  // or a service like Twilio, MessageBird, etc.
}
```

---

## Security Considerations

### Token Security

| Concern | Mitigation |
|---------|------------|
| Token in URL | Removed from URL after extraction |
| Token storage | sessionStorage (not localStorage) |
| Token transmission | HTTPS only |
| Token reuse | Optional single-use enforcement via `jti` |
| Token expiration | 24-hour validity |

### Additional Measures

1. **Rate Limiting**: Limit token validation attempts
2. **IP Logging**: Log IP addresses for audit
3. **Device Fingerprinting**: Optional additional verification
4. **Token Rotation**: Issue new token on each notification

### Future Enhancements

1. **Refresh Tokens**: Extend session without new WhatsApp link
2. **Biometric Auth**: Add fingerprint/face ID for mobile
3. **SSO Integration**: Support clinic-wide authentication
4. **2FA**: Optional second factor for sensitive operations
