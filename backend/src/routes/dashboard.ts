// src/routes/dashboard.ts
import { Hono } from 'hono';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import type { Env } from '../types/env';
import {
  conversations,
  appointments,
  patients,
  therapyPrograms,
  patientProgramEnrollments,
} from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

// Helper: Get start and end of day
function getDayBounds(date: Date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Helper: Get start of week (Monday)
function getWeekStart(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/dashboard/stats - Clinic statistics
app.get('/stats', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const { start: todayStart, end: todayEnd } = getDayBounds();

  // Active patients count
  const activePatientsResult = await db
    .select({
      count: sql<number>`count(distinct ${patientProgramEnrollments.patientId})::int`,
    })
    .from(patientProgramEnrollments)
    .where(and(
      eq(patientProgramEnrollments.doctorId, doctorId),
      eq(patientProgramEnrollments.status, 'active')
    ));

  // Pending queries count
  const pendingQueriesResult = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'query'),
      eq(conversations.status, 'open')
    ));

  // Check-ins today count (conversations with type='checkin' created today)
  const checkinsResult = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'checkin'),
      gte(conversations.createdAt, todayStart),
      lt(conversations.createdAt, todayEnd)
    ));

  // Appointments today count
  const appointmentsResult = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .where(and(
      eq(appointments.doctorId, doctorId),
      gte(appointments.scheduledAt, todayStart),
      lt(appointments.scheduledAt, todayEnd),
      eq(appointments.status, 'scheduled')
    ));

  // Total unread messages
  const unreadResult = await db
    .select({
      total: sql<number>`coalesce(sum(${conversations.unreadCount}), 0)::int`,
    })
    .from(conversations)
    .where(eq(conversations.doctorId, doctorId));

  return c.json({
    data: {
      activePatients: activePatientsResult[0]?.count || 0,
      pendingQueries: pendingQueriesResult[0]?.count || 0,
      checkinsToday: checkinsResult[0]?.count || 0,
      appointmentsToday: appointmentsResult[0]?.count || 0,
      totalUnread: unreadResult[0]?.total || 0,
    },
  });
});

// GET /api/dashboard/schedule - Get day's schedule
app.get('/schedule', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const dateParam = c.req.query('date');
  const date = dateParam ? new Date(dateParam) : new Date();
  const { start, end } = getDayBounds(date);

  const schedule = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      appointmentType: appointments.appointmentType,
      status: appointments.status,
      scheduledAt: appointments.scheduledAt,
      duration: appointments.duration,
      location: appointments.location,
      meetingLink: appointments.meetingLink,
      patient: {
        id: patients.id,
        name: patients.name,
        avatarUrl: patients.avatarUrl,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(patientProgramEnrollments, eq(appointments.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(appointments.doctorId, doctorId),
      gte(appointments.scheduledAt, start),
      lt(appointments.scheduledAt, end)
    ))
    .orderBy(appointments.scheduledAt);

  return c.json({
    data: schedule,
    date: date.toISOString().split('T')[0],
  });
});

// GET /api/dashboard/weekly-summary - Weekly metrics
app.get('/weekly-summary', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const weekStart = getWeekStart();
  const now = new Date();

  // Queries resolved this week
  const queriesResolvedResult = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'query'),
      eq(conversations.status, 'closed'),
      gte(conversations.updatedAt, weekStart),
      lt(conversations.updatedAt, now)
    ));

  // Check-ins reviewed this week (checkin conversations that are now closed)
  const checkinsReviewedResult = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(
      eq(conversations.doctorId, doctorId),
      eq(conversations.type, 'checkin'),
      eq(conversations.status, 'closed'),
      gte(conversations.updatedAt, weekStart),
      lt(conversations.updatedAt, now)
    ));

  return c.json({
    data: {
      queriesResolved: queriesResolvedResult[0]?.count || 0,
      checkinsReviewed: checkinsReviewedResult[0]?.count || 0,
      weekStartDate: weekStart.toISOString().split('T')[0],
    },
  });
});

export default app;
