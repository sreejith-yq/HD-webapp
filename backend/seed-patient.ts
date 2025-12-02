import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { patients, patientProgramEnrollments, therapyPrograms, patientVitals, prescriptions } from './src/db/schema';
import * as schema from './src/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('Seeding test patient data...');

    // Get the first doctor
    const doctor = await db.query.doctors.findFirst();
    if (!doctor) {
        console.error('No doctor found. Please create a doctor first.');
        process.exit(1);
    }

    // Create a therapy program if none exists
    let program = await db.query.therapyPrograms.findFirst();
    if (!program) {
        const [newProgram] = await db.insert(therapyPrograms).values({
            name: 'Weight Management',
            description: 'A comprehensive program for weight loss.',
            durationWeeks: 12,
            icon: 'scale',
            color: 'blue',
        }).returning();
        program = newProgram;
    }

    // Create a patient
    const [patient] = await db.insert(patients).values({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+15551234567',
        dateOfBirth: new Date('1980-01-01'),
        gender: 'male',
        address: '123 Main St',
    }).returning();

    // Enroll patient
    await db.insert(patientProgramEnrollments).values({
        patientId: patient.id,
        doctorId: doctor.id,
        therapyProgramId: program.id,
        status: 'active',
        startDate: new Date(),
    });

    // Add vitals
    await db.insert(patientVitals).values({
        patientId: patient.id,
        recordedAt: new Date(),
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        weight: 75.5,
    });

    // Add prescription
    await db.insert(prescriptions).values({
        patientId: patient.id,
        doctorId: doctor.id,
        title: 'Vitamin D Supplement',
        description: 'Take one tablet daily.',
        prescribedDate: new Date(),
        isActive: true,
    });

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
