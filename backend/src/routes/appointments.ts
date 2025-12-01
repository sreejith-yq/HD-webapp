// src/routes/appointments.ts
import { Hono } from 'hono';
import { eq, and, desc, gte } from 'drizzle-orm';
import type { Env } from '../types/env';
import {
  appointments,
  patients,
  therapyPrograms,
  patientProgramEnrollments,
} from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

// GET /api/appointments - List appointments with filtering
app.get('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const status = c.req.query('status'); // 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  const upcoming = c.req.query('upcoming') === 'true';
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  // Build conditions
  const conditions = [eq(appointments.doctorId, doctorId)];

  if (status) {
    conditions.push(eq(appointments.status, status as any));
  }

  if (upcoming) {
    conditions.push(gte(appointments.scheduledAt, new Date()));
  }

  const results = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      appointmentType: appointments.appointmentType,
      status: appointments.status,
      scheduledAt: appointments.scheduledAt,
      duration: appointments.duration,
      location: appointments.location,
      meetingLink: appointments.meetingLink,
      notes: appointments.notes,
      patient: {
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
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
    .where(and(...conditions))
    .orderBy(appointments.scheduledAt)
    .limit(limit)
    .offset(offset);

  return c.json({
    data: results,
    pagination: { limit, offset },
  });
});

// POST /api/appointments - Create appointment
app.post('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const body = await c.req.json();

  const {
    patientId,
    enrollmentId,
    title,
    appointmentType = 'in-person',
    scheduledAt,
    duration = 30,
    location,
    meetingLink,
    notes,
  } = body;

  if (!patientId || !scheduledAt) {
    return c.json({ error: 'patientId and scheduledAt are required' }, 400);
  }

  // Verify patient access
  const enrollment = await db.query.patientProgramEnrollments.findFirst({
    where: and(
      eq(patientProgramEnrollments.patientId, patientId),
      eq(patientProgramEnrollments.doctorId, doctorId),
      eq(patientProgramEnrollments.status, 'active')
    ),
  });

  if (!enrollment) {
    return c.json({ error: 'No active enrollment with this patient' }, 403);
  }

  const now = new Date();
  const scheduledDate = new Date(scheduledAt);
  const endTime = new Date(scheduledDate.getTime() + duration * 60 * 1000);

  const [newAppointment] = await db
    .insert(appointments)
    .values({
      patientId,
      doctorId,
      enrollmentId: enrollmentId || enrollment.id,
      title,
      appointmentType,
      status: 'scheduled',
      scheduledAt: scheduledDate,
      duration,
      endTime,
      location,
      meetingLink,
      notes,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: appointments.id });

  return c.json({ id: newAppointment.id }, 201);
});

// PUT /api/appointments/:id - Update appointment
app.put('/:id', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const appointmentId = c.req.param('id');
  const body = await c.req.json();

  // Verify access
  const existing = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.doctorId, doctorId)
    ),
  });

  if (!existing) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  const {
    title,
    appointmentType,
    status,
    scheduledAt,
    duration,
    location,
    meetingLink,
    notes,
  } = body;

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (title !== undefined) updateData.title = title;
  if (appointmentType !== undefined) updateData.appointmentType = appointmentType;
  if (status !== undefined) updateData.status = status;
  if (location !== undefined) updateData.location = location;
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
  if (notes !== undefined) updateData.notes = notes;

  if (scheduledAt !== undefined) {
    updateData.scheduledAt = new Date(scheduledAt);
    const newDuration = duration || existing.duration;
    updateData.endTime = new Date(updateData.scheduledAt.getTime() + newDuration * 60 * 1000);
  }

  if (duration !== undefined) {
    updateData.duration = duration;
    const baseTime = updateData.scheduledAt || existing.scheduledAt;
    updateData.endTime = new Date(new Date(baseTime).getTime() + duration * 60 * 1000);
  }

  await db
    .update(appointments)
    .set(updateData)
    .where(eq(appointments.id, appointmentId));

  return c.json({ success: true });
});

// DELETE /api/appointments/:id - Cancel appointment
app.delete('/:id', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const appointmentId = c.req.param('id');

  // Verify access
  const existing = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.doctorId, doctorId)
    ),
  });

  if (!existing) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  // Soft delete by setting status to cancelled
  await db
    .update(appointments)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, appointmentId));

  return c.json({ success: true });
});

export default app;
