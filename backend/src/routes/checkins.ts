// src/routes/checkins.ts
// Check-ins are conversations with type='checkin'
// This route provides convenience endpoints for check-in specific operations

import { Hono } from 'hono';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import type { Env } from '../types/env';
import { conversations, messages, patients, patientProgramEnrollments, therapyPrograms } from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

// GET /api/checkins - List check-in conversations with filtering
app.get('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const status = c.req.query('status'); // 'open' | 'closed'
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  // Build conditions - only checkin type conversations
  const conditions = [
    eq(conversations.doctorId, doctorId),
    eq(conversations.type, 'checkin'),
  ];
  if (status) {
    conditions.push(eq(conversations.status, status));
  }

  const results = await db
    .select({
      id: conversations.id,
      checkinType: conversations.checkinType,
      status: conversations.status,
      lastMessageAt: conversations.lastMessageAt,
      lastMessagePreview: conversations.lastMessagePreview,
      unreadCount: conversations.unreadCount,
      createdAt: conversations.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        avatarUrl: patients.avatarUrl,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(conversations)
    .innerJoin(patients, eq(conversations.patientId, patients.id))
    .leftJoin(patientProgramEnrollments, eq(conversations.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(...conditions))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    data: results,
    pagination: { limit, offset },
  });
});

// GET /api/checkins/:id - Get check-in conversation details with messages
app.get('/:id', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');

  // Get check-in conversation with patient and program info
  const result = await db
    .select({
      id: conversations.id,
      checkinType: conversations.checkinType,
      status: conversations.status,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
        avatarUrl: patients.avatarUrl,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(conversations)
    .innerJoin(patients, eq(conversations.patientId, patients.id))
    .leftJoin(patientProgramEnrollments, eq(conversations.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'checkin')
    ))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: 'Check-in not found' }, 404);
  }

  // Get messages for this check-in
  const checkinMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.timestamp);

  return c.json({
    data: {
      ...result[0],
      messages: checkinMessages,
    },
  });
});

// GET /api/checkins/count/today - Get count of check-ins submitted today
app.get('/count/today', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  // Get start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(conversations)
    .where(and(
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'checkin'),
      gte(conversations.createdAt, today)
    ));

  return c.json({ count: result[0]?.count || 0 });
});

export default app;
