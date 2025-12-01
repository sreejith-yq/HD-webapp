# Database Schema

## Overview

The application uses PostgreSQL (Neon) as the database, with Drizzle ORM for type-safe queries.

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| Hosting | Neon |

---

## Setup

```bash
# Install dependencies
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

### Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.NEON_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### Database Connection

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
```

---

## Schema Definition

Full schema is implemented in [`backend/src/db/schema.ts`](./backend/src/db/schema.ts).

### Enums

```typescript
export const programStatusEnum = pgEnum('program_status', [
  'active', 'completed', 'paused', 'cancelled'
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled', 'completed', 'cancelled', 'no_show'
]);

export const approvalStatusEnum = pgEnum('approval_status', [
  'pending', 'approved', 'denied', 'expired'
]);

export const documentTypeEnum = pgEnum('document_type', [
  'prescription', 'lab_report', 'medical_record', 'imaging', 'other'
]);

// User type enums
export const clinicStaffRoleEnum = pgEnum('clinic_staff_role', [
  'admin', 'receptionist', 'medical_officer'
]);

export const healthCoachSpecialtyEnum = pgEnum('health_coach_specialty', [
  'nutritionist', 'physiotherapist', 'mental_wellness', 'yoga', 'fitness', 'other'
]);
```

---

## Tables Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `clinics` | Clinic organizations with location info |
| `specializations` | Doctor specializations (Cardiologist, Orthopedic, etc.) |
| `doctors` | Doctor profiles (belong to clinics, have specialization) |
| `clinic_staff` | Clinic admins, receptionists, medical officers |
| `health_coaches` | Nutritionists, physiotherapists, mental wellness coaches, etc. |
| `patients` | Patient profiles |
| `caregivers` | Patient caregivers (family members, helpers) |
| `therapy_programs` | Program definitions |

### Relationship Tables

| Table | Purpose |
|-------|---------|
| `patient_program_enrollments` | Doctor-patient-program relationships |
| `patient_caregivers` | Caregiver-patient relationships (many-to-many) |
| `program_specializations` | Therapy programs available per specialization (many-to-many) |

### Health Data Tables

| Table | Purpose |
|-------|---------|
| `patient_vitals` | Vital measurements (BP, HR, weight, etc.) |
| `prescriptions` | Prescription documents |
| `lab_reports` | Lab report documents |

### Privacy & Sharing Tables

| Table | Purpose |
|-------|---------|
| `document_sharing` | Lab reports shared with doctors |
| `medical_history_requests` | Full history access requests |

### Communication Tables

| Table | Purpose |
|-------|---------|
| `conversations` | Chat threads (queries and check-ins) |
| `messages` | Individual messages |

### Scheduling Tables

| Table | Purpose |
|-------|---------|
| `appointments` | Scheduled appointments |

### System Tables

| Table | Purpose |
|-------|---------|
| `auth_tokens` | JWT token tracking |
| `audit_logs` | Activity audit trail |

---

## Table Definitions

### clinics

```typescript
export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logoUrl: text('logo_url'), // File location for clinic logo
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### specializations

Doctor specializations (e.g., Cardiologist, Orthopedic, Dermatologist).

```typescript
export const specializations = pgTable('specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### doctors

```typescript
export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 50 }), // Medical council registration
  qualifications: text('qualifications'), // e.g., "MBBS, MD, FRCP"
  specializationId: uuid('specialization_id').references(() => specializations.id),
  clinicId: uuid('clinic_id').references(() => clinics.id),
  avatarUrl: text('avatar_url'), // Photo file location
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### clinic_staff

Clinic staff includes admins, receptionists, and medical officers.

```typescript
export const clinicStaff = pgTable('clinic_staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id),
  role: clinicStaffRoleEnum('role').notNull(), // admin | receptionist | medical_officer
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### health_coaches

Health coaches may or may not be associated with a clinic.

```typescript
export const healthCoaches = pgTable('health_coaches', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  clinicId: uuid('clinic_id').references(() => clinics.id), // Optional - may be independent
  specialty: healthCoachSpecialtyEnum('specialty').notNull(),
  specialtyOther: varchar('specialty_other', { length: 100 }), // If specialty is 'other'
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 50 }), // Professional registration
  qualifications: text('qualifications'), // e.g., "MSc Nutrition, Certified Dietitian"
  avatarUrl: text('avatar_url'), // Photo file location
  bio: text('bio'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### patients

```typescript
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 20 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### caregivers

Caregivers are family members or helpers who assist patients.

```typescript
export const caregivers = pgTable('caregivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### patient_caregivers

Many-to-many relationship between patients and caregivers with permissions.

```typescript
export const patientCaregivers = pgTable('patient_caregivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  caregiverId: uuid('caregiver_id').notNull().references(() => caregivers.id),
  relationship: varchar('relationship', { length: 50 }), // spouse, child, parent, sibling, helper
  isPrimary: boolean('is_primary').default(false).notNull(),
  canViewMedicalInfo: boolean('can_view_medical_info').default(false).notNull(),
  canCommunicate: boolean('can_communicate').default(true).notNull(),
  canManageAppointments: boolean('can_manage_appointments').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### therapy_programs

```typescript
export const therapyPrograms = pgTable('therapy_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  durationDays: integer('duration_days'),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### program_specializations

Many-to-many relationship linking therapy programs to specializations. One therapy program can be available for multiple specializations.

```typescript
export const programSpecializations = pgTable('program_specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => therapyPrograms.id),
  specializationId: uuid('specialization_id').notNull().references(() => specializations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### patient_program_enrollments

```typescript
export const patientProgramEnrollments = pgTable('patient_program_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  therapyProgramId: uuid('therapy_program_id').notNull().references(() => therapyPrograms.id),
  status: programStatusEnum('status').default('active').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  completedDate: date('completed_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### patient_vitals

```typescript
export const patientVitals = pgTable('patient_vitals', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  recordedBy: uuid('recorded_by').references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  // Vital measurements
  systolicBp: integer('systolic_bp'),           // mmHg
  diastolicBp: integer('diastolic_bp'),         // mmHg
  heartRate: integer('heart_rate'),             // bpm
  weight: decimal('weight', { precision: 5, scale: 2 }),  // kg
  height: decimal('height', { precision: 5, scale: 2 }),  // cm
  temperature: decimal('temperature', { precision: 4, scale: 1 }),  // Celsius
  oxygenSaturation: integer('oxygen_saturation'),  // percentage
  bloodSugarFasting: integer('blood_sugar_fasting'),  // mg/dL
  bloodSugarPostMeal: integer('blood_sugar_post_meal'),  // mg/dL
  respiratoryRate: integer('respiratory_rate'),  // breaths per minute
  
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### prescriptions

```typescript
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  documentUrl: text('document_url'),
  documentKey: varchar('document_key', { length: 255 }),
  
  prescribedDate: date('prescribed_date').notNull(),
  validUntil: date('valid_until'),
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### lab_reports

```typescript
export const labReports = pgTable('lab_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  uploadedBy: uuid('uploaded_by').references(() => doctors.id),
  
  title: varchar('title', { length: 255 }).notNull(),
  documentType: documentTypeEnum('document_type').default('lab_report').notNull(),
  description: text('description'),
  documentUrl: text('document_url'),
  documentKey: varchar('document_key', { length: 255 }),
  
  reportDate: date('report_date').notNull(),
  labName: varchar('lab_name', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### document_sharing

```typescript
export const documentSharing = pgTable('document_sharing', {
  id: uuid('id').primaryKey().defaultRandom(),
  labReportId: uuid('lab_report_id').notNull().references(() => labReports.id),
  sharedWithDoctorId: uuid('shared_with_doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  sharedAt: timestamp('shared_at').defaultNow().notNull(),
  sharedByPatient: boolean('shared_by_patient').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### medical_history_requests

```typescript
export const medicalHistoryRequests = pgTable('medical_history_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  requestingDoctorId: uuid('requesting_doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  status: approvalStatusEnum('status').default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at'),
  
  requestMessage: text('request_message'),
  responseMessage: text('response_message'),
  
  // What was requested
  requestPrescriptions: boolean('request_prescriptions').default(true).notNull(),
  requestLabReports: boolean('request_lab_reports').default(true).notNull(),
  requestOtherPrograms: boolean('request_other_programs').default(true).notNull(),
  
  // Approval scope
  approvedPrescriptions: boolean('approved_prescriptions').default(false).notNull(),
  approvedLabReports: boolean('approved_lab_reports').default(false).notNull(),
  approvedOtherPrograms: boolean('approved_other_programs').default(false).notNull(),
  approvalValidUntil: timestamp('approval_valid_until'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### appointments

```typescript
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  title: varchar('title', { length: 255 }),
  appointmentType: varchar('appointment_type', { length: 50 }),  // in-person, video, phone
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(30).notNull(),  // minutes
  endTime: timestamp('end_time'),
  
  location: text('location'),
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  
  reminderSent: boolean('reminder_sent').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### conversations

```typescript
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  type: varchar('type', { length: 20 }).notNull().default('query'),  // query | checkin
  checkinType: varchar('checkin_type', { length: 50 }),  // For check-ins: "Weekly Check-In", "Daily Vitals", etc.
  status: varchar('status', { length: 20 }).notNull().default('open'),  // open | closed
  unreadCount: integer('unread_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at').notNull(),
  lastMessagePreview: text('last_message_preview'),
  lastMessageSender: varchar('last_message_sender', { length: 20 }),  // Doctor | Patient
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### messages

```typescript
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  contentType: varchar('content_type', { length: 20 }).notNull(),  // Text | Image | Video | Audio
  sender: varchar('sender', { length: 20 }).notNull(),  // Doctor | Patient
  read: boolean('read').notNull().default(false),
  timestamp: timestamp('timestamp').notNull(),
  
  // Media metadata
  mediaUrl: text('media_url'),
  mediaKey: varchar('media_key', { length: 255 }),
  mediaDuration: integer('media_duration'),  // seconds for audio/video
  mediaThumbnail: text('media_thumbnail'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### auth_tokens

```typescript
export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  isValid: boolean('is_valid').default(true).notNull(),
});
```

### audit_logs

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').references(() => doctors.id),
  patientId: uuid('patient_id').references(() => patients.id),
  action: varchar('action', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: varchar('resource_id', { length: 255 }),
  metadata: text('metadata'),  // JSON string
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## Entity Relationship Diagram

```
                              ┌─────────────────┐
                              │     clinics     │
                              │ (city, pincode, │
                              │   logoUrl)      │
                              └────────┬────────┘
           ┌──────────────────────────┬┴────────────────────────────┐
           │ 1:N                      │ 1:N                         │ 1:N
           ▼                          ▼                             ▼
┌─────────────────┐        ┌─────────────────┐           ┌─────────────────┐
│    doctors      │        │  clinic_staff   │           │ health_coaches  │
│  (textit_uuid,  │        │  (textit_uuid)  │           │  (textit_uuid,  │
│  registration,  │        └─────────────────┘           │  registration,  │
│  qualifications)│                                      │  qualifications)│
└────────┬────────┘                                      └─────────────────┘
         │ N:1                                                 (optional clinic)
         ▼
┌─────────────────┐       ┌─────────────────────────┐
│ specializations │◀──────│ program_specializations │
└────────┬────────┘  N:M  └───────────┬─────────────┘
         │                            │ N:M
         │                            ▼
         │                ┌─────────────────────────┐
         │                │    therapy_programs     │
         │                └───────────┬─────────────┘
         │                            │
         │                            ▼
         │    ┌─────────────────────────────────────┐
         │    │   patient_program_enrollments       │
         │    └───────────────────┬─────────────────┘
         │                        │ N:1
         │                        ▼
         │                ┌─────────────────┐       ┌─────────────────┐
         │                │    patients     │──────▶│patient_caregivers│
         │                │  (textit_uuid)  │  1:N  │  (permissions)   │
         │                └────────┬────────┘       └────────┬────────┘
         │                         │                         │ N:1
         │                         │                         ▼
         │                         │                ┌─────────────────┐
         │                         │                │   caregivers    │
         │                         │                │  (textit_uuid)  │
         │                         │                └─────────────────┘
         │                         │
         │    ┌────────────────────┼────────────────────┐
         │    │                    │                    │
         ▼    ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│  appointments   │  │ conversations   │  │    patient_vitals       │
└─────────────────┘  └────────┬────────┘  └─────────────────────────┘
                              │ 1:N
                              ▼
                     ┌─────────────────┐
                     │    messages     │
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  prescriptions  │  │   lab_reports   │
└─────────────────┘  └────────┬────────┘
                              │ 1:N
                              ▼
                     ┌─────────────────┐
                     │ document_       │
                     │ sharing         │
                     └─────────────────┘

┌──────────────────────────┐
│ medical_history_requests │
└──────────────────────────┘
```

---

## Indexes

Key indexes for performance:

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `clinics_city_idx` | `clinics` | `city` | Filter by city |
| `clinics_pincode_idx` | `clinics` | `pincode` | Filter by pincode |
| `specializations_name_idx` | `specializations` | `name` | Unique name lookup |
| `doctors_email_idx` | `doctors` | `email` | Unique email lookup |
| `doctors_phone_idx` | `doctors` | `phone` | Phone lookup |
| `doctors_textit_idx` | `doctors` | `textit_uuid` | TextIt integration lookup |
| `doctors_clinic_idx` | `doctors` | `clinic_id` | List clinic doctors |
| `doctors_specialization_idx` | `doctors` | `specialization_id` | Filter by specialization |
| `doctors_registration_idx` | `doctors` | `registration_number` | Unique registration lookup |
| `clinic_staff_clinic_idx` | `clinic_staff` | `clinic_id` | List clinic staff |
| `clinic_staff_role_idx` | `clinic_staff` | `role` | Filter by role |
| `clinic_staff_textit_idx` | `clinic_staff` | `textit_uuid` | TextIt integration lookup |
| `health_coaches_clinic_idx` | `health_coaches` | `clinic_id` | List clinic coaches |
| `health_coaches_specialty_idx` | `health_coaches` | `specialty` | Filter by specialty |
| `health_coaches_textit_idx` | `health_coaches` | `textit_uuid` | TextIt integration lookup |
| `health_coaches_registration_idx` | `health_coaches` | `registration_number` | Unique registration lookup |
| `patients_phone_idx` | `patients` | `phone` | Phone lookup |
| `patients_name_idx` | `patients` | `name` | Name search |
| `patients_textit_idx` | `patients` | `textit_uuid` | TextIt integration lookup |
| `caregivers_phone_idx` | `caregivers` | `phone` | Phone lookup |
| `caregivers_textit_idx` | `caregivers` | `textit_uuid` | TextIt integration lookup |
| `patient_caregivers_patient_idx` | `patient_caregivers` | `patient_id` | List patient's caregivers |
| `patient_caregivers_caregiver_idx` | `patient_caregivers` | `caregiver_id` | List caregiver's patients |
| `patient_caregivers_unique` | `patient_caregivers` | `patient_id, caregiver_id` | Prevent duplicates |
| `program_specializations_program_idx` | `program_specializations` | `program_id` | List program specializations |
| `program_specializations_specialization_idx` | `program_specializations` | `specialization_id` | List specialization programs |
| `program_specializations_unique` | `program_specializations` | `program_id, specialization_id` | Prevent duplicates |
| `enrollments_doctor_idx` | `patient_program_enrollments` | `doctor_id` | List doctor's patients |
| `enrollments_patient_idx` | `patient_program_enrollments` | `patient_id` | List patient's doctors |
| `enrollments_status_idx` | `patient_program_enrollments` | `status` | Filter by status |
| `conversations_doctor_idx` | `conversations` | `doctor_id` | List conversations |
| `conversations_doctor_status_idx` | `conversations` | `doctor_id, status` | Filter by status |
| `conversations_doctor_type_idx` | `conversations` | `doctor_id, type` | Filter by query/checkin |
| `conversations_last_message_idx` | `conversations` | `doctor_id, last_message_at` | Sort by recent |
| `messages_conversation_idx` | `messages` | `conversation_id` | Get messages |
| `messages_conversation_time_idx` | `messages` | `conversation_id, timestamp` | Paginate messages |
| `vitals_patient_idx` | `patient_vitals` | `patient_id` | Get vitals |
| `vitals_patient_date_idx` | `patient_vitals` | `patient_id, recorded_at` | Get latest vitals |
| `prescriptions_patient_idx` | `prescriptions` | `patient_id` | Get prescriptions |
| `prescriptions_patient_doctor_idx` | `prescriptions` | `patient_id, doctor_id` | Privacy-scoped |
| `appointments_doctor_idx` | `appointments` | `doctor_id` | List appointments |
| `appointments_doctor_date_idx` | `appointments` | `doctor_id, scheduled_at` | Schedule view |

---

## Frontend Feature to Database Mapping

### Screen 1: Conversation List

| Feature | Primary Table | Related Tables |
|---------|---------------|----------------|
| Conversation cards | `conversations` | `patients`, `patient_program_enrollments`, `therapy_programs` |
| Unread count badges | `conversations.unread_count` | - |
| Search functionality | `conversations`, `patients` | Full-text search on name, preview |
| Type filter (Query/Check-In) | `conversations.type` | - |

### Screen 2: Clinic Dashboard

| Feature | Primary Table | Query Type |
|---------|---------------|------------|
| Active Patients count | `patient_program_enrollments` | `COUNT DISTINCT patient_id WHERE status='active'` |
| Pending Queries count | `conversations` | `COUNT WHERE type='query' AND status='open'` |
| Check-ins Today count | `conversations` | `COUNT WHERE type='checkin' AND created_at >= today` |
| Appointments count | `appointments` | `COUNT WHERE scheduled_at >= today` |
| Today's Schedule | `appointments` | `WHERE scheduled_at BETWEEN today AND tomorrow` |
| Weekly Summary | `conversations` | Aggregations with date and type filters |

### Screen 3: Chat Conversation

| Feature | Primary Table | Related Tables |
|---------|---------------|----------------|
| Message thread | `messages` | `conversations` (for access control) |
| Send message | `messages` | Updates `conversations.last_message_*` |
| Media messages | `messages.media_*` columns | R2 storage for files |
| Read receipts | `messages.read` | - |
| Mark as read | `messages`, `conversations` | Batch update + reset count |

### Screen 4: Patient Details Tab

| Feature | Primary Table | Privacy Scope |
|---------|---------------|---------------|
| Patient profile | `patients` | Via `patient_program_enrollments` |
| Latest vitals | `patient_vitals` | All vitals for patient |
| Doctor's programs | `patient_program_enrollments` | `WHERE doctor_id = current` |
| Other programs count | `patient_program_enrollments` | `WHERE doctor_id != current` |
| Doctor's prescriptions | `prescriptions` | `WHERE doctor_id = current` |
| Other prescriptions count | `prescriptions` | `WHERE doctor_id != current` |
| Shared lab reports | `lab_reports`, `document_sharing` | `WHERE shared_with_doctor_id = current` |
| History request | `medical_history_requests` | `WHERE requesting_doctor_id = current` |

### Screen 5: Check-In Detail

| Feature | Primary Table | Related Tables |
|---------|---------------|----------------|
| Check-in conversation | `conversations` | `patients`, `therapy_programs` (via enrollment) |
| Check-in messages | `messages` | Including media attachments |
| Doctor responds | `messages` | Insert new message, update conversation |

### Screen 6: New Conversation

| Feature | Primary Table | Query |
|---------|---------------|-------|
| Patient list | `patients` | Via `patient_program_enrollments` |
| Patient search | `patients` | `ILIKE` on name/phone |
| Create conversation | `conversations`, `messages` | Insert with optional initial message |

---

## Privacy Model Implementation

The database enforces privacy through relationship-based access:

```sql
-- Doctors can only see patients they're enrolled with
SELECT * FROM patients p
INNER JOIN patient_program_enrollments e ON e.patient_id = p.id
WHERE e.doctor_id = :current_doctor_id AND e.status = 'active';

-- Doctors can only see their own prescriptions
SELECT * FROM prescriptions 
WHERE patient_id = :patient_id AND doctor_id = :current_doctor_id;

-- Doctors can only see lab reports shared with them
SELECT lr.* FROM lab_reports lr
INNER JOIN document_sharing ds ON ds.lab_report_id = lr.id
WHERE lr.patient_id = :patient_id AND ds.shared_with_doctor_id = :current_doctor_id;

-- Count other doctors' data (for "hidden" indicators)
SELECT COUNT(*) FROM prescriptions 
WHERE patient_id = :patient_id AND doctor_id != :current_doctor_id;
```

---

## Query Examples

See [API Specification](./04-api-specification.md) and [`backend/src/routes/`](./backend/src/routes/) for full query implementations.

---

## Version History

| Version | Changes |
|---------|---------|
| 1.0 | Initial PostgreSQL-only schema |
| 1.1 | Added patient health data tables |
| 1.2 | Added privacy and sharing tables |
| 1.3 | Added appointments and scheduling |
| 1.4 | Removed checkins/checkin_media tables - check-ins now use conversations with type='checkin' |
| 1.5 | Added user types: clinic_staff, health_coaches, caregivers. Added textit_uuid to all user tables. Added patient_caregivers relationship table. |
| 1.6 | Added specializations table, program_specializations join table. Added clinic location fields (city, pincode, logoUrl). Added professional credentials (registrationNumber, qualifications) to doctors and health_coaches. Changed doctors.specialization from varchar to FK reference. |
