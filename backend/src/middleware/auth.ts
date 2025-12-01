// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import type { Env } from '../types/env';
import { doctors } from '../db/schema';

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

export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  // Skip for auth routes
  if (c.req.path.startsWith('/api/auth')) {
    return next();
  }

  // Get token from header or query
  const authHeader = c.req.header('Authorization');
  const queryToken = c.req.query('token');

  const token = authHeader?.replace('Bearer ', '') || queryToken;

  if (!token) {
    return c.json({ error: 'Missing authentication token' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const sessionId = payload.sessionId as string;
    const doctorId = payload.doctorId as string;

    if (!sessionId) {
      return c.json({ error: 'Invalid token structure' }, 401);
    }

    // Validate session from KV
    const sessionData = await c.env.AUTH_SESSION.get(sessionId, 'json');

    if (!sessionData) {
      return c.json({ error: 'Session expired or invalid' }, 401);
    }

    // Type assertion for session data
    const doctor = sessionData as { id: string; name: string; email: string | null };

    c.set('doctorId', doctorId);
    c.set('doctor', doctor);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
