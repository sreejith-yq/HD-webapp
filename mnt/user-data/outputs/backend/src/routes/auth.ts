// src/routes/auth.ts
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { Env } from '../types/env';
import { doctors } from '../db/schema';

const auth = new Hono<{ Bindings: Env }>();

// GET /api/auth/validate - Validate JWT token
auth.get('/validate', async (c) => {
  const authHeader = c.req.header('Authorization');
  const queryToken = c.req.query('token');
  const token = authHeader?.replace('Bearer ', '') || queryToken;

  if (!token) {
    return c.json({ valid: false, error: 'No token provided' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const db = c.get('db');
    
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, payload.doctorId as string),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        avatarUrl: true,
      },
    });

    if (!doctor) {
      return c.json({ valid: false, error: 'Doctor not found' }, 404);
    }

    return c.json({
      valid: true,
      doctor,
      expiresAt: payload.exp,
    });
  } catch (error) {
    return c.json({ valid: false, error: 'Invalid token' }, 401);
  }
});

// GET /api/auth/me - Get current authenticated doctor
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const db = c.get('db');
    
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, payload.doctorId as string),
      with: {
        clinic: true,
      },
    });

    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }

    return c.json({ doctor });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export default auth;
