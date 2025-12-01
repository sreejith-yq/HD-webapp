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
    const doctorId = payload.doctorId as string;

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
      return c.json({ error: 'Doctor not found' }, 401);
    }

    c.set('doctorId', doctorId);
    c.set('doctor', doctor);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
