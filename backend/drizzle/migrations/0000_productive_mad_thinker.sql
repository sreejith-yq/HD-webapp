DO $$ BEGIN
 CREATE TYPE "appointment_status" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "approval_status" AS ENUM('pending', 'approved', 'denied', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "clinic_staff_role" AS ENUM('admin', 'receptionist', 'medical_officer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "document_type" AS ENUM('prescription', 'lab_report', 'medical_record', 'imaging', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "health_coach_specialty" AS ENUM('nutritionist', 'physiotherapist', 'mental_wellness', 'yoga', 'fitness', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "program_status" AS ENUM('active', 'completed', 'paused', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"title" varchar(255),
	"appointment_type" varchar(50),
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"end_time" timestamp,
	"location" text,
	"meeting_link" text,
	"notes" text,
	"reminder_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid,
	"patient_id" uuid,
	"action" varchar(50) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" varchar(255),
	"metadata" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"is_valid" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "caregivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textit_uuid" varchar(100),
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinic_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textit_uuid" varchar(100),
	"clinic_id" uuid NOT NULL,
	"role" "clinic_staff_role" NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100),
	"pincode" varchar(10),
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"type" varchar(20) DEFAULT 'query' NOT NULL,
	"checkin_type" varchar(50),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp NOT NULL,
	"last_message_preview" text,
	"last_message_sender" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textit_uuid" varchar(100),
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"registration_number" varchar(50),
	"qualifications" text,
	"specialization_id" uuid,
	"clinic_id" uuid,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doctors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_sharing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_report_id" uuid NOT NULL,
	"shared_with_doctor_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"shared_at" timestamp DEFAULT now() NOT NULL,
	"shared_by_patient" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "health_coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textit_uuid" varchar(100),
	"clinic_id" uuid,
	"specialty" "health_coach_specialty" NOT NULL,
	"specialty_other" varchar(100),
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"registration_number" varchar(50),
	"qualifications" text,
	"avatar_url" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"uploaded_by" uuid,
	"title" varchar(255) NOT NULL,
	"document_type" "document_type" DEFAULT 'lab_report' NOT NULL,
	"description" text,
	"document_url" text,
	"document_key" varchar(255),
	"report_date" date NOT NULL,
	"lab_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medical_history_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"requesting_doctor_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expires_at" timestamp,
	"request_message" text,
	"response_message" text,
	"request_prescriptions" boolean DEFAULT true NOT NULL,
	"request_lab_reports" boolean DEFAULT true NOT NULL,
	"request_other_programs" boolean DEFAULT true NOT NULL,
	"approved_prescriptions" boolean DEFAULT false NOT NULL,
	"approved_lab_reports" boolean DEFAULT false NOT NULL,
	"approved_other_programs" boolean DEFAULT false NOT NULL,
	"approval_valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"content" text NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"sender" varchar(20) NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp NOT NULL,
	"media_url" text,
	"media_key" varchar(255),
	"media_duration" integer,
	"media_thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_caregivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"relationship" varchar(50),
	"is_primary" boolean DEFAULT false NOT NULL,
	"can_view_medical_info" boolean DEFAULT false NOT NULL,
	"can_communicate" boolean DEFAULT true NOT NULL,
	"can_manage_appointments" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_program_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"therapy_program_id" uuid NOT NULL,
	"status" "program_status" DEFAULT 'active' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"completed_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"recorded_by" uuid,
	"enrollment_id" uuid,
	"systolic_bp" integer,
	"diastolic_bp" integer,
	"heart_rate" integer,
	"weight" numeric(5, 2),
	"height" numeric(5, 2),
	"temperature" numeric(4, 1),
	"oxygen_saturation" integer,
	"blood_sugar_fasting" integer,
	"blood_sugar_post_meal" integer,
	"respiratory_rate" integer,
	"notes" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textit_uuid" varchar(100),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"date_of_birth" date,
	"gender" varchar(20),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"document_url" text,
	"document_key" varchar(255),
	"prescribed_date" date NOT NULL,
	"valid_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "program_specializations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"specialization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "specializations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "therapy_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"duration_days" integer,
	"icon" varchar(50),
	"color" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_doctor_idx" ON "appointments" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_patient_idx" ON "appointments" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_doctor_date_idx" ON "appointments" ("doctor_id","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_doctor_idx" ON "audit_logs" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_tokens_doctor_idx" ON "auth_tokens" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_tokens_hash_idx" ON "auth_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "caregivers_phone_idx" ON "caregivers" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "caregivers_textit_idx" ON "caregivers" ("textit_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clinic_staff_clinic_idx" ON "clinic_staff" ("clinic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clinic_staff_role_idx" ON "clinic_staff" ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clinic_staff_phone_idx" ON "clinic_staff" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clinic_staff_textit_idx" ON "clinic_staff" ("textit_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clinics_city_idx" ON "clinics" ("city");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clinics_pincode_idx" ON "clinics" ("pincode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_doctor_idx" ON "conversations" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_doctor_status_idx" ON "conversations" ("doctor_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_doctor_type_idx" ON "conversations" ("doctor_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_last_message_idx" ON "conversations" ("doctor_id","last_message_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_patient_idx" ON "conversations" ("patient_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_email_idx" ON "doctors" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_phone_idx" ON "doctors" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_textit_idx" ON "doctors" ("textit_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_clinic_idx" ON "doctors" ("clinic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctors_specialization_idx" ON "doctors" ("specialization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_registration_idx" ON "doctors" ("registration_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sharing_lab_report_idx" ON "document_sharing" ("lab_report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sharing_doctor_idx" ON "document_sharing" ("shared_with_doctor_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_document_sharing" ON "document_sharing" ("lab_report_id","shared_with_doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "health_coaches_clinic_idx" ON "health_coaches" ("clinic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "health_coaches_specialty_idx" ON "health_coaches" ("specialty");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "health_coaches_phone_idx" ON "health_coaches" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "health_coaches_textit_idx" ON "health_coaches" ("textit_uuid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "health_coaches_registration_idx" ON "health_coaches" ("registration_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_reports_patient_idx" ON "lab_reports" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_reports_patient_date_idx" ON "lab_reports" ("patient_id","report_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_requests_patient_idx" ON "medical_history_requests" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_requests_doctor_idx" ON "medical_history_requests" ("requesting_doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "history_requests_status_idx" ON "medical_history_requests" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_idx" ON "messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_time_idx" ON "messages" ("conversation_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patient_caregivers_patient_idx" ON "patient_caregivers" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patient_caregivers_caregiver_idx" ON "patient_caregivers" ("caregiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patient_caregivers_unique" ON "patient_caregivers" ("patient_id","caregiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_patient_doctor_program" ON "patient_program_enrollments" ("patient_id","doctor_id","therapy_program_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_doctor_idx" ON "patient_program_enrollments" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_patient_idx" ON "patient_program_enrollments" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_status_idx" ON "patient_program_enrollments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vitals_patient_idx" ON "patient_vitals" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vitals_patient_date_idx" ON "patient_vitals" ("patient_id","recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patients_phone_idx" ON "patients" ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patients_name_idx" ON "patients" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patients_textit_idx" ON "patients" ("textit_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prescriptions_patient_idx" ON "prescriptions" ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prescriptions_doctor_idx" ON "prescriptions" ("doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prescriptions_patient_doctor_idx" ON "prescriptions" ("patient_id","doctor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "program_specializations_program_idx" ON "program_specializations" ("program_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "program_specializations_specialization_idx" ON "program_specializations" ("specialization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "program_specializations_unique" ON "program_specializations" ("program_id","specialization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "specializations_name_idx" ON "specializations" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_staff" ADD CONSTRAINT "clinic_staff_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialization_id_specializations_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_lab_report_id_lab_reports_id_fk" FOREIGN KEY ("lab_report_id") REFERENCES "lab_reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_shared_with_doctor_id_doctors_id_fk" FOREIGN KEY ("shared_with_doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "health_coaches" ADD CONSTRAINT "health_coaches_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_uploaded_by_doctors_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medical_history_requests" ADD CONSTRAINT "medical_history_requests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medical_history_requests" ADD CONSTRAINT "medical_history_requests_requesting_doctor_id_doctors_id_fk" FOREIGN KEY ("requesting_doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medical_history_requests" ADD CONSTRAINT "medical_history_requests_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_caregivers" ADD CONSTRAINT "patient_caregivers_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_caregivers" ADD CONSTRAINT "patient_caregivers_caregiver_id_caregivers_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "caregivers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_program_enrollments" ADD CONSTRAINT "patient_program_enrollments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_program_enrollments" ADD CONSTRAINT "patient_program_enrollments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_program_enrollments" ADD CONSTRAINT "patient_program_enrollments_therapy_program_id_therapy_programs_id_fk" FOREIGN KEY ("therapy_program_id") REFERENCES "therapy_programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_recorded_by_doctors_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_enrollment_id_patient_program_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "patient_program_enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_specializations" ADD CONSTRAINT "program_specializations_program_id_therapy_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "therapy_programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_specializations" ADD CONSTRAINT "program_specializations_specialization_id_specializations_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
