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
  // Skip auth for specific public routes
  const publicPaths = ['/api/auth/login-link', '/api/auth/validate'];
  if (publicPaths.includes(c.req.path)) {
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
    console.log('Auth Middleware: Payload verified', payload);
    const sessionId = payload.sessionId as string;
    const doctorId = payload.doctorId as string;

    if (!sessionId) {
      console.log('Auth Middleware: No sessionId in payload');
      return c.json({ error: 'Invalid token structure' }, 401);
    }

    // Validate session from KV
    console.log('Auth Middleware: Checking KV for sessionId', sessionId);
    const sessionData = await c.env.AUTH_SESSION.get(sessionId, 'json');
    console.log('Auth Middleware: Session data from KV', sessionData);

    if (!sessionData) {
      return c.json({ error: 'Session expired or invalid' }, 401);
    }

    // Set context variables
    c.set('doctorId', doctorId);
    c.set('doctor', sessionData as { id: string; name: string; email: string | null }); // Use sessionData directly
    c.set('sessionId', sessionId); // Set sessionId in context

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
