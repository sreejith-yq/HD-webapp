// src/db/schema.ts
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  integer,
  boolean,
  text,
  decimal,
  date,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const programStatusEnum = pgEnum('program_status', ['active', 'completed', 'paused', 'cancelled']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled', 'no_show']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'denied', 'expired']);
export const documentTypeEnum = pgEnum('document_type', ['prescription', 'lab_report', 'medical_record', 'imaging', 'other']);

// User type enums
export const clinicStaffRoleEnum = pgEnum('clinic_staff_role', ['admin', 'receptionist', 'medical_officer']);
export const healthCoachSpecialtyEnum = pgEnum('health_coach_specialty', [
  'nutritionist', 'physiotherapist', 'mental_wellness', 'yoga', 'fitness', 'other'
]);

// ============================================
// CORE TABLES
// ============================================

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
}, (table) => ({
  cityIdx: index('clinics_city_idx').on(table.city),
  pincodeIdx: index('clinics_pincode_idx').on(table.pincode),
}));

// Specializations for doctors (e.g., Cardiologist, Orthopedic, etc.)
export const specializations = pgTable('specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: uniqueIndex('specializations_name_idx').on(table.name),
}));

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
}, (table) => ({
  emailIdx: uniqueIndex('doctors_email_idx').on(table.email),
  phoneIdx: index('doctors_phone_idx').on(table.phone),
  textitIdx: uniqueIndex('doctors_textit_idx').on(table.textitUuid),
  clinicIdx: index('doctors_clinic_idx').on(table.clinicId),
  specializationIdx: index('doctors_specialization_idx').on(table.specializationId),
  registrationIdx: uniqueIndex('doctors_registration_idx').on(table.registrationNumber),
}));

// Clinic Staff: admins, receptionists, medical officers
export const clinicStaff = pgTable('clinic_staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  textitUuid: varchar('textit_uuid', { length: 100 }), // TextIt/WhatsApp integration ID
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id),
  role: clinicStaffRoleEnum('role').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clinicIdx: index('clinic_staff_clinic_idx').on(table.clinicId),
  roleIdx: index('clinic_staff_role_idx').on(table.role),
  phoneIdx: index('clinic_staff_phone_idx').on(table.phone),
  textitIdx: uniqueIndex('clinic_staff_textit_idx').on(table.textitUuid),
}));

// Health Coaches: nutritionists, physiotherapists, mental wellness coaches, etc.
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
}, (table) => ({
  clinicIdx: index('health_coaches_clinic_idx').on(table.clinicId),
  specialtyIdx: index('health_coaches_specialty_idx').on(table.specialty),
  phoneIdx: index('health_coaches_phone_idx').on(table.phone),
  textitIdx: uniqueIndex('health_coaches_textit_idx').on(table.textitUuid),
  registrationIdx: uniqueIndex('health_coaches_registration_idx').on(table.registrationNumber),
}));

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
}, (table) => ({
  phoneIdx: index('patients_phone_idx').on(table.phone),
  nameIdx: index('patients_name_idx').on(table.name),
  textitIdx: uniqueIndex('patients_textit_idx').on(table.textitUuid),
}));

// Caregivers: family members, helpers who assist patients
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
}, (table) => ({
  phoneIdx: index('caregivers_phone_idx').on(table.phone),
  textitIdx: uniqueIndex('caregivers_textit_idx').on(table.textitUuid),
}));

// Patient-Caregiver relationships (many-to-many)
export const patientCaregivers = pgTable('patient_caregivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  caregiverId: uuid('caregiver_id').notNull().references(() => caregivers.id),
  relationship: varchar('relationship', { length: 50 }), // e.g., "spouse", "child", "parent", "sibling", "helper"
  isPrimary: boolean('is_primary').default(false).notNull(), // Primary caregiver
  canViewMedicalInfo: boolean('can_view_medical_info').default(false).notNull(),
  canCommunicate: boolean('can_communicate').default(true).notNull(), // Can message on behalf of patient
  canManageAppointments: boolean('can_manage_appointments').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  patientIdx: index('patient_caregivers_patient_idx').on(table.patientId),
  caregiverIdx: index('patient_caregivers_caregiver_idx').on(table.caregiverId),
  uniqueRelation: uniqueIndex('patient_caregivers_unique').on(table.patientId, table.caregiverId),
}));

export const therapyPrograms = pgTable('therapy_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  durationDays: integer('duration_days'),
  icon: varchar('icon', { length: 50 }), // Icon identifier for UI
  color: varchar('color', { length: 20 }), // Color code for UI
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Many-to-many: Therapy programs available for specific specializations
export const programSpecializations = pgTable('program_specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => therapyPrograms.id),
  specializationId: uuid('specialization_id').notNull().references(() => specializations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  programIdx: index('program_specializations_program_idx').on(table.programId),
  specializationIdx: index('program_specializations_specialization_idx').on(table.specializationId),
  uniqueRelation: uniqueIndex('program_specializations_unique').on(table.programId, table.specializationId),
}));

// ============================================
// PATIENT-DOCTOR RELATIONSHIP TABLES
// ============================================

// Patient assignments to therapy programs with specific doctors
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
}, (table) => ({
  patientDoctorProgramIdx: uniqueIndex('unique_patient_doctor_program').on(
    table.patientId, 
    table.doctorId, 
    table.therapyProgramId
  ),
  doctorIdx: index('enrollments_doctor_idx').on(table.doctorId),
  patientIdx: index('enrollments_patient_idx').on(table.patientId),
  statusIdx: index('enrollments_status_idx').on(table.status),
}));

// ============================================
// PATIENT HEALTH DATA TABLES
// ============================================

// Patient vitals tracking
export const patientVitals = pgTable('patient_vitals', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  recordedBy: uuid('recorded_by').references(() => doctors.id), // Doctor who recorded (optional)
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  // Vital measurements
  systolicBp: integer('systolic_bp'), // mmHg
  diastolicBp: integer('diastolic_bp'), // mmHg
  heartRate: integer('heart_rate'), // bpm
  weight: decimal('weight', { precision: 5, scale: 2 }), // kg
  height: decimal('height', { precision: 5, scale: 2 }), // cm
  temperature: decimal('temperature', { precision: 4, scale: 1 }), // Celsius
  oxygenSaturation: integer('oxygen_saturation'), // percentage
  bloodSugarFasting: integer('blood_sugar_fasting'), // mg/dL
  bloodSugarPostMeal: integer('blood_sugar_post_meal'), // mg/dL
  respiratoryRate: integer('respiratory_rate'), // breaths per minute
  
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  patientIdx: index('vitals_patient_idx').on(table.patientId),
  patientDateIdx: index('vitals_patient_date_idx').on(table.patientId, table.recordedAt),
}));

// Prescriptions as documents (not medication list)
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  title: varchar('title', { length: 255 }).notNull(), // "Cardiac Care Prescription"
  description: text('description'),
  documentUrl: text('document_url'), // URL to PDF/file in R2
  documentKey: varchar('document_key', { length: 255 }), // R2 storage key
  
  prescribedDate: date('prescribed_date').notNull(),
  validUntil: date('valid_until'),
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  patientIdx: index('prescriptions_patient_idx').on(table.patientId),
  doctorIdx: index('prescriptions_doctor_idx').on(table.doctorId),
  patientDoctorIdx: index('prescriptions_patient_doctor_idx').on(table.patientId, table.doctorId),
}));

// Lab reports and medical documents
export const labReports = pgTable('lab_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  uploadedBy: uuid('uploaded_by').references(() => doctors.id), // Can be null if patient uploaded
  
  title: varchar('title', { length: 255 }).notNull(), // "Lipid Profile", "ECG Report"
  documentType: documentTypeEnum('document_type').default('lab_report').notNull(),
  description: text('description'),
  documentUrl: text('document_url'),
  documentKey: varchar('document_key', { length: 255 }),
  
  reportDate: date('report_date').notNull(),
  labName: varchar('lab_name', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  patientIdx: index('lab_reports_patient_idx').on(table.patientId),
  patientDateIdx: index('lab_reports_patient_date_idx').on(table.patientId, table.reportDate),
}));

// ============================================
// DATA SHARING & PRIVACY TABLES
// ============================================

// Track which lab reports/documents are shared with which doctors/programs
export const documentSharing = pgTable('document_sharing', {
  id: uuid('id').primaryKey().defaultRandom(),
  labReportId: uuid('lab_report_id').notNull().references(() => labReports.id),
  sharedWithDoctorId: uuid('shared_with_doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  sharedAt: timestamp('shared_at').defaultNow().notNull(),
  sharedByPatient: boolean('shared_by_patient').default(true).notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  labReportIdx: index('sharing_lab_report_idx').on(table.labReportId),
  doctorIdx: index('sharing_doctor_idx').on(table.sharedWithDoctorId),
  uniqueSharing: uniqueIndex('unique_document_sharing').on(table.labReportId, table.sharedWithDoctorId),
}));

// Medical history access requests
export const medicalHistoryRequests = pgTable('medical_history_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  requestingDoctorId: uuid('requesting_doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  status: approvalStatusEnum('status').default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at'), // Request expires if not responded
  
  requestMessage: text('request_message'),
  responseMessage: text('response_message'),
  
  // What was requested
  requestPrescriptions: boolean('request_prescriptions').default(true).notNull(),
  requestLabReports: boolean('request_lab_reports').default(true).notNull(),
  requestOtherPrograms: boolean('request_other_programs').default(true).notNull(),
  
  // Approval scope (if approved)
  approvedPrescriptions: boolean('approved_prescriptions').default(false).notNull(),
  approvedLabReports: boolean('approved_lab_reports').default(false).notNull(),
  approvedOtherPrograms: boolean('approved_other_programs').default(false).notNull(),
  approvalValidUntil: timestamp('approval_valid_until'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  patientIdx: index('history_requests_patient_idx').on(table.patientId),
  doctorIdx: index('history_requests_doctor_idx').on(table.requestingDoctorId),
  statusIdx: index('history_requests_status_idx').on(table.status),
}));

// ============================================
// APPOINTMENTS TABLE
// ============================================

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  
  title: varchar('title', { length: 255 }), // "Follow-up", "Initial Consultation"
  appointmentType: varchar('appointment_type', { length: 50 }), // "in-person", "video", "phone"
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(30).notNull(), // minutes
  endTime: timestamp('end_time'),
  
  location: text('location'),
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  
  reminderSent: boolean('reminder_sent').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  doctorIdx: index('appointments_doctor_idx').on(table.doctorId),
  patientIdx: index('appointments_patient_idx').on(table.patientId),
  doctorDateIdx: index('appointments_doctor_date_idx').on(table.doctorId, table.scheduledAt),
  statusIdx: index('appointments_status_idx').on(table.status),
}));

// ============================================
// COMMUNICATION TABLES
// ============================================

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  enrollmentId: uuid('enrollment_id').references(() => patientProgramEnrollments.id),
  type: varchar('type', { length: 20 }).notNull().default('query'), // 'query' | 'checkin'
  checkinType: varchar('checkin_type', { length: 50 }), // For check-ins: "Weekly Check-In", "Daily Vitals", etc.
  status: varchar('status', { length: 20 }).notNull().default('open'), // 'open' | 'closed'
  unreadCount: integer('unread_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at').notNull(),
  lastMessagePreview: text('last_message_preview'),
  lastMessageSender: varchar('last_message_sender', { length: 20 }), // 'Doctor' | 'Patient'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  doctorIdx: index('conversations_doctor_idx').on(table.doctorId),
  doctorStatusIdx: index('conversations_doctor_status_idx').on(table.doctorId, table.status),
  doctorTypeIdx: index('conversations_doctor_type_idx').on(table.doctorId, table.type),
  lastMessageIdx: index('conversations_last_message_idx').on(table.doctorId, table.lastMessageAt),
  patientIdx: index('conversations_patient_idx').on(table.patientId),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  contentType: varchar('content_type', { length: 20 }).notNull(), // 'Text' | 'Image' | 'Video' | 'Audio'
  sender: varchar('sender', { length: 20 }).notNull(), // 'Doctor' | 'Patient'
  read: boolean('read').notNull().default(false),
  timestamp: timestamp('timestamp').notNull(),
  
  // Media metadata
  mediaUrl: text('media_url'),
  mediaKey: varchar('media_key', { length: 255 }),
  mediaDuration: integer('media_duration'), // seconds for audio/video
  mediaThumbnail: text('media_thumbnail'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  conversationTimeIdx: index('messages_conversation_time_idx').on(
    table.conversationId,
    table.timestamp
  ),
}));

// ============================================
// SYSTEM TABLES
// ============================================

export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  isValid: boolean('is_valid').default(true).notNull(),
}, (table) => ({
  doctorIdx: index('auth_tokens_doctor_idx').on(table.doctorId),
  tokenHashIdx: index('auth_tokens_hash_idx').on(table.tokenHash),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').references(() => doctors.id),
  patientId: uuid('patient_id').references(() => patients.id),
  action: varchar('action', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: varchar('resource_id', { length: 255 }),
  metadata: text('metadata'), // JSON string
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  doctorIdx: index('audit_logs_doctor_idx').on(table.doctorId),
  createdAtIdx: index('audit_logs_created_idx').on(table.createdAt),
  actionIdx: index('audit_logs_action_idx').on(table.action),
}));
