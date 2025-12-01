// src/routes/patients.ts
import { Hono } from 'hono';
import { eq, and, desc, ne, or, ilike, sql } from 'drizzle-orm';
import type { Env } from '../types/env';
import {
  patients,
  patientProgramEnrollments,
  therapyPrograms,
  patientVitals,
  prescriptions,
  labReports,
  documentSharing,
  medicalHistoryRequests,
} from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

// Helper: Verify doctor has active enrollment with patient
async function verifyPatientAccess(db: any, doctorId: string, patientId: string) {
  const enrollment = await db.query.patientProgramEnrollments.findFirst({
    where: and(
      eq(patientProgramEnrollments.patientId, patientId),
      eq(patientProgramEnrollments.doctorId, doctorId),
      eq(patientProgramEnrollments.status, 'active')
    ),
  });
  return enrollment;
}

// GET /api/patients - List doctor's assigned patients
app.get('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  const results = await db
    .select({
      id: patients.id,
      name: patients.name,
      phone: patients.phone,
      avatarUrl: patients.avatarUrl,
      enrollment: {
        id: patientProgramEnrollments.id,
        status: patientProgramEnrollments.status,
        startDate: patientProgramEnrollments.startDate,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(patients)
    .innerJoin(patientProgramEnrollments, eq(patientProgramEnrollments.patientId, patients.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(eq(patientProgramEnrollments.doctorId, doctorId))
    .orderBy(patients.name)
    .limit(limit)
    .offset(offset);

  return c.json({
    data: results,
    pagination: { limit, offset },
  });
});

// GET /api/patients/search - Search patients by name or phone
app.get('/search', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const query = c.req.query('q');

  if (!query || query.length < 2) {
    return c.json({ error: 'Search query must be at least 2 characters' }, 400);
  }

  const results = await db
    .select({
      id: patients.id,
      name: patients.name,
      phone: patients.phone,
      avatarUrl: patients.avatarUrl,
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
      },
    })
    .from(patients)
    .innerJoin(patientProgramEnrollments, eq(patientProgramEnrollments.patientId, patients.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(patientProgramEnrollments.doctorId, doctorId),
      eq(patientProgramEnrollments.status, 'active'),
      or(
        ilike(patients.name, `%${query}%`),
        ilike(patients.phone, `%${query}%`)
      )
    ))
    .limit(20);

  return c.json({ data: results });
});

// GET /api/patients/:id - Get patient basic info
app.get('/:id', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
    columns: {
      id: true,
      name: true,
      phone: true,
      email: true,
      dateOfBirth: true,
      gender: true,
      avatarUrl: true,
    },
  });

  // Get current program info
  const programResult = await db
    .select({
      id: therapyPrograms.id,
      name: therapyPrograms.name,
      icon: therapyPrograms.icon,
      color: therapyPrograms.color,
    })
    .from(therapyPrograms)
    .where(eq(therapyPrograms.id, enrollment.therapyProgramId))
    .limit(1);

  return c.json({
    data: {
      ...patient,
      currentProgram: programResult[0] || null,
      enrollmentStatus: enrollment.status,
      enrollmentStartDate: enrollment.startDate,
    },
  });
});

// GET /api/patients/:id/vitals - Get latest vitals
app.get('/:id/vitals', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Get latest vitals
  const vitals = await db
    .select()
    .from(patientVitals)
    .where(eq(patientVitals.patientId, patientId))
    .orderBy(desc(patientVitals.recordedAt))
    .limit(1);

  if (vitals.length === 0) {
    return c.json({ data: null });
  }

  return c.json({ data: vitals[0] });
});

// GET /api/patients/:id/programs - Get programs with this doctor + counts of others
app.get('/:id/programs', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Get doctor's programs with this patient
  const myPrograms = await db
    .select({
      id: patientProgramEnrollments.id,
      status: patientProgramEnrollments.status,
      startDate: patientProgramEnrollments.startDate,
      endDate: patientProgramEnrollments.endDate,
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(patientProgramEnrollments)
    .innerJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(patientProgramEnrollments.patientId, patientId),
      eq(patientProgramEnrollments.doctorId, doctorId)
    ))
    .orderBy(desc(patientProgramEnrollments.startDate));

  // Count other doctors' programs (not visible, just counts)
  const otherCounts = await db
    .select({
      activeCount: sql<number>`count(*) filter (where ${patientProgramEnrollments.status} = 'active')::int`,
      completedCount: sql<number>`count(*) filter (where ${patientProgramEnrollments.status} = 'completed')::int`,
    })
    .from(patientProgramEnrollments)
    .where(and(
      eq(patientProgramEnrollments.patientId, patientId),
      ne(patientProgramEnrollments.doctorId, doctorId)
    ));

  return c.json({
    data: {
      myPrograms,
      otherPrograms: {
        activeCount: otherCounts[0]?.activeCount || 0,
        completedCount: otherCounts[0]?.completedCount || 0,
      },
    },
  });
});

// GET /api/patients/:id/prescriptions - Get prescriptions by this doctor + count of others
app.get('/:id/prescriptions', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Get this doctor's prescriptions
  const myPrescriptions = await db
    .select({
      id: prescriptions.id,
      title: prescriptions.title,
      description: prescriptions.description,
      documentUrl: prescriptions.documentUrl,
      prescribedDate: prescriptions.prescribedDate,
      validUntil: prescriptions.validUntil,
      isActive: prescriptions.isActive,
    })
    .from(prescriptions)
    .where(and(
      eq(prescriptions.patientId, patientId),
      eq(prescriptions.doctorId, doctorId)
    ))
    .orderBy(desc(prescriptions.prescribedDate));

  // Count other doctors' prescriptions
  const otherCount = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(prescriptions)
    .where(and(
      eq(prescriptions.patientId, patientId),
      ne(prescriptions.doctorId, doctorId)
    ));

  return c.json({
    data: {
      myPrescriptions,
      otherPrescriptionsCount: otherCount[0]?.count || 0,
    },
  });
});

// GET /api/patients/:id/lab-reports - Get lab reports shared with this doctor
app.get('/:id/lab-reports', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Get lab reports that are explicitly shared with this doctor
  const sharedReports = await db
    .select({
      id: labReports.id,
      title: labReports.title,
      documentType: labReports.documentType,
      description: labReports.description,
      documentUrl: labReports.documentUrl,
      reportDate: labReports.reportDate,
      labName: labReports.labName,
      sharedAt: documentSharing.sharedAt,
      sharedFor: {
        programId: therapyPrograms.id,
        programName: therapyPrograms.name,
      },
    })
    .from(labReports)
    .innerJoin(documentSharing, eq(documentSharing.labReportId, labReports.id))
    .leftJoin(patientProgramEnrollments, eq(documentSharing.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(labReports.patientId, patientId),
      eq(documentSharing.sharedWithDoctorId, doctorId)
    ))
    .orderBy(desc(labReports.reportDate));

  return c.json({
    data: sharedReports,
  });
});

// POST /api/patients/:id/history-request - Request full medical history access
app.post('/:id/history-request', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');
  const body = await c.req.json();

  const { message, requestPrescriptions = true, requestLabReports = true, requestOtherPrograms = true } = body;

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Check for existing pending request
  const existingRequest = await db.query.medicalHistoryRequests.findFirst({
    where: and(
      eq(medicalHistoryRequests.patientId, patientId),
      eq(medicalHistoryRequests.requestingDoctorId, doctorId),
      eq(medicalHistoryRequests.status, 'pending')
    ),
  });

  if (existingRequest) {
    return c.json({ error: 'A pending request already exists' }, 409);
  }

  // Create request
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [newRequest] = await db
    .insert(medicalHistoryRequests)
    .values({
      patientId,
      requestingDoctorId: doctorId,
      enrollmentId: enrollment.id,
      status: 'pending',
      requestedAt: now,
      expiresAt,
      requestMessage: message,
      requestPrescriptions,
      requestLabReports,
      requestOtherPrograms,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: medicalHistoryRequests.id });

  return c.json({ id: newRequest.id }, 201);
});

// GET /api/patients/:id/history-request - Get status of history request
app.get('/:id/history-request', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const patientId = c.req.param('id');

  // Verify access
  const enrollment = await verifyPatientAccess(db, doctorId, patientId);
  if (!enrollment) {
    return c.json({ error: 'Patient not found or no active enrollment' }, 404);
  }

  // Get most recent request
  const request = await db
    .select()
    .from(medicalHistoryRequests)
    .where(and(
      eq(medicalHistoryRequests.patientId, patientId),
      eq(medicalHistoryRequests.requestingDoctorId, doctorId)
    ))
    .orderBy(desc(medicalHistoryRequests.requestedAt))
    .limit(1);

  if (request.length === 0) {
    return c.json({ data: null });
  }

  return c.json({ data: request[0] });
});

export default app;
