// src/db/relations.ts
import { relations } from 'drizzle-orm';
import {
  clinics,
  specializations,
  doctors,
  clinicStaff,
  healthCoaches,
  patients,
  caregivers,
  patientCaregivers,
  patientProgramEnrollments,
  therapyPrograms,
  programSpecializations,
  patientVitals,
  prescriptions,
  labReports,
  documentSharing,
  medicalHistoryRequests,
  appointments,
  conversations,
  messages,
  authTokens,
} from './schema';

export const clinicsRelations = relations(clinics, ({ many }) => ({
  doctors: many(doctors),
  staff: many(clinicStaff),
  healthCoaches: many(healthCoaches),
}));

export const specializationsRelations = relations(specializations, ({ many }) => ({
  doctors: many(doctors),
  programLinks: many(programSpecializations),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [doctors.clinicId],
    references: [clinics.id],
  }),
  specialization: one(specializations, {
    fields: [doctors.specializationId],
    references: [specializations.id],
  }),
  enrollments: many(patientProgramEnrollments),
  conversations: many(conversations),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
  historyRequests: many(medicalHistoryRequests),
  authTokens: many(authTokens),
}));

export const clinicStaffRelations = relations(clinicStaff, ({ one }) => ({
  clinic: one(clinics, {
    fields: [clinicStaff.clinicId],
    references: [clinics.id],
  }),
}));

export const healthCoachesRelations = relations(healthCoaches, ({ one }) => ({
  clinic: one(clinics, {
    fields: [healthCoaches.clinicId],
    references: [clinics.id],
  }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  enrollments: many(patientProgramEnrollments),
  conversations: many(conversations),
  vitals: many(patientVitals),
  prescriptions: many(prescriptions),
  labReports: many(labReports),
  appointments: many(appointments),
  historyRequests: many(medicalHistoryRequests),
  caregiverLinks: many(patientCaregivers),
}));

export const caregiversRelations = relations(caregivers, ({ many }) => ({
  patientLinks: many(patientCaregivers),
}));

export const patientCaregiversRelations = relations(patientCaregivers, ({ one }) => ({
  patient: one(patients, {
    fields: [patientCaregivers.patientId],
    references: [patients.id],
  }),
  caregiver: one(caregivers, {
    fields: [patientCaregivers.caregiverId],
    references: [caregivers.id],
  }),
}));

export const therapyProgramsRelations = relations(therapyPrograms, ({ many }) => ({
  enrollments: many(patientProgramEnrollments),
  specializationLinks: many(programSpecializations),
}));

export const programSpecializationsRelations = relations(programSpecializations, ({ one }) => ({
  program: one(therapyPrograms, {
    fields: [programSpecializations.programId],
    references: [therapyPrograms.id],
  }),
  specialization: one(specializations, {
    fields: [programSpecializations.specializationId],
    references: [specializations.id],
  }),
}));

export const patientProgramEnrollmentsRelations = relations(patientProgramEnrollments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientProgramEnrollments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [patientProgramEnrollments.doctorId],
    references: [doctors.id],
  }),
  therapyProgram: one(therapyPrograms, {
    fields: [patientProgramEnrollments.therapyProgramId],
    references: [therapyPrograms.id],
  }),
  vitals: many(patientVitals),
  prescriptions: many(prescriptions),
  conversations: many(conversations),
  appointments: many(appointments),
}));

export const patientVitalsRelations = relations(patientVitals, ({ one }) => ({
  patient: one(patients, {
    fields: [patientVitals.patientId],
    references: [patients.id],
  }),
  recordedByDoctor: one(doctors, {
    fields: [patientVitals.recordedBy],
    references: [doctors.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [patientVitals.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [prescriptions.doctorId],
    references: [doctors.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [prescriptions.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
}));

export const labReportsRelations = relations(labReports, ({ one, many }) => ({
  patient: one(patients, {
    fields: [labReports.patientId],
    references: [patients.id],
  }),
  uploadedByDoctor: one(doctors, {
    fields: [labReports.uploadedBy],
    references: [doctors.id],
  }),
  sharing: many(documentSharing),
}));

export const documentSharingRelations = relations(documentSharing, ({ one }) => ({
  labReport: one(labReports, {
    fields: [documentSharing.labReportId],
    references: [labReports.id],
  }),
  sharedWithDoctor: one(doctors, {
    fields: [documentSharing.sharedWithDoctorId],
    references: [doctors.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [documentSharing.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
}));

export const medicalHistoryRequestsRelations = relations(medicalHistoryRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalHistoryRequests.patientId],
    references: [patients.id],
  }),
  requestingDoctor: one(doctors, {
    fields: [medicalHistoryRequests.requestingDoctorId],
    references: [doctors.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [medicalHistoryRequests.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [appointments.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [conversations.doctorId],
    references: [doctors.id],
  }),
  patient: one(patients, {
    fields: [conversations.patientId],
    references: [patients.id],
  }),
  enrollment: one(patientProgramEnrollments, {
    fields: [conversations.enrollmentId],
    references: [patientProgramEnrollments.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
