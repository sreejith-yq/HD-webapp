// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types/env';
import { authMiddleware } from './middleware/auth';
import { dbMiddleware } from './middleware/db';
import auth from './routes/auth';
import conversations from './routes/conversations';
import checkins from './routes/checkins';
import patients from './routes/patients';
import dashboard from './routes/dashboard';
import appointments from './routes/appointments';
import media from './routes/media';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['https://dashboard.healthydialogue.com', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Database middleware
app.use('/api/*', dbMiddleware);

// Public routes
app.route('/api/auth', auth);

// Protected routes
app.use('/api/*', authMiddleware);
app.route('/api/conversations', conversations);
app.route('/api/checkins', checkins);
app.route('/api/patients', patients);
app.route('/api/dashboard', dashboard);
app.route('/api/appointments', appointments);
app.route('/api/media', media);

// Protected Auth Routes
app.get('/api/auth/me', async (c) => {
  const doctor = c.get('doctor');
  return c.json({ doctor });
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
