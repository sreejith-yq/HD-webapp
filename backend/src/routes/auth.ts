import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import type { Env } from '../types/env';
import { doctors } from '../db/schema';

import { generateAuthToken } from '../services/auth';
import { or } from 'drizzle-orm';

const app = new Hono<{ Bindings: Env }>();

// POST /api/auth/login-link - Generate login link from TextIt UUID or Phone
app.post('/login-link', async (c) => {
    const { identifier } = await c.req.json<{ identifier: string }>();

    if (!identifier) {
        return c.json({ error: 'Identifier (TextIt UUID or Phone) is required' }, 400);
    }

    const db = c.get('db');
    const [doctor] = await db
        .select({
            id: doctors.id,
            name: doctors.name,
            email: doctors.email,
        })
        .from(doctors)
        .where(or(
            eq(doctors.textitUuid, identifier),
            eq(doctors.phone, identifier)
        ))
        .limit(1);

    if (!doctor) {
        return c.json({ error: 'Doctor not found' }, 404);
    }

    const token = await generateAuthToken({
        doctorId: doctor.id,
        doctorData: doctor,
        secret: c.env.JWT_SECRET,
        kv: c.env.AUTH_SESSION,
    });
    console.log('Login Link: Generated token', token);
    console.log('Login Link: Stored session in KV');

    const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:5173';
    const loginLink = `${frontendUrl}/auth/callback?token=${token}`;

    return c.json({ url: loginLink });
});

// GET /api/auth/validate - Validate JWT token
app.get('/validate', async (c) => {
    const token = c.req.query('token');

    if (!token) {
        return c.json({ valid: false, error: 'Token is required' }, 400);
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
            return c.json({ valid: false, error: 'Doctor not found' }, 404);
        }

        return c.json({
            valid: true,
            doctor,
        });
    } catch (error) {
        return c.json({ valid: false, error: 'Invalid or expired token' }, 401);
    }
});



export default app;
