import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema';
import { eq, lt, gt } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('🌱 Starting full database seed...');

    // 1. Get or Create Doctor
    let doctor = await db.query.doctors.findFirst();
    if (!doctor) {
        console.log('Creating default doctor...');
        const [newDoctor] = await db.insert(schema.doctors).values({
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+15550000001',
            qualifications: 'MBBS, MD (Cardiology)',
            registrationNumber: 'REG123456',
        }).returning();
        doctor = newDoctor;
    }
    console.log(`Using doctor: ${doctor.name} (${doctor.id})`);

    // 2. Create Therapy Programs
    console.log('Creating therapy programs...');
    const programsData = [
        { name: 'Weight Management', icon: 'scale', color: 'blue', description: 'Comprehensive weight loss program' },
        { name: 'Cardiac Care', icon: 'heart', color: 'red', description: 'Post-surgery cardiac rehabilitation' },
        { name: 'Diabetes Control', icon: 'activity', color: 'green', description: 'Blood sugar management and diet' },
        { name: 'Mental Wellness', icon: 'sun', color: 'yellow', description: 'Stress management and mindfulness' },
    ];

    const programs = [];
    for (const prog of programsData) {
        let p = await db.query.therapyPrograms.findFirst({
            where: eq(schema.therapyPrograms.name, prog.name),
        });
        if (!p) {
            [p] = await db.insert(schema.therapyPrograms).values(prog).returning();
        }
        programs.push(p);
    }

    // 3. Create Patients (15 patients)
    console.log('Creating patients...');
    const patients = [];
    for (let i = 0; i < 15; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const [patient] = await db.insert(schema.patients).values({
            name: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName }),
            phone: faker.string.numeric(10),
            dateOfBirth: faker.date.birthdate({ min: 25, max: 80, mode: 'age' }).toISOString().split('T')[0],
            gender: faker.person.sex(),
            address: faker.location.streetAddress(),
            avatarUrl: faker.image.avatar(),
        }).returning();
        patients.push(patient);
    }

    // 4. Enroll Patients in Programs
    console.log('Enrolling patients...');
    const enrollments = [];
    for (const patient of patients) {
        // Enroll in 1 or 2 programs
        const numPrograms = faker.number.int({ min: 1, max: 2 });
        const selectedPrograms = faker.helpers.arrayElements(programs, numPrograms);

        for (const program of selectedPrograms) {
            const startDate = faker.date.past({ years: 1 });
            const status = faker.helpers.arrayElement(['active', 'active', 'active', 'completed', 'paused']);

            const [enrollment] = await db.insert(schema.patientProgramEnrollments).values({
                patientId: patient.id,
                doctorId: doctor.id,
                therapyProgramId: program.id,
                status: status,
                startDate: startDate.toISOString().split('T')[0],
                endDate: status === 'completed' ? faker.date.recent().toISOString().split('T')[0] : null,
            }).returning();
            enrollments.push(enrollment);

            // 5. Add Vitals (History)
            const numVitals = faker.number.int({ min: 5, max: 20 });
            for (let j = 0; j < numVitals; j++) {
                await db.insert(schema.patientVitals).values({
                    patientId: patient.id,
                    enrollmentId: enrollment.id,
                    recordedAt: faker.date.between({ from: startDate, to: new Date() }),
                    systolicBp: faker.number.int({ min: 110, max: 160 }),
                    diastolicBp: faker.number.int({ min: 70, max: 100 }),
                    heartRate: faker.number.int({ min: 60, max: 100 }),
                    weight: faker.number.float({ min: 60, max: 100, precision: 0.1 }),
                    bloodSugarFasting: faker.number.int({ min: 80, max: 140 }),
                });
            }

            // 6. Add Prescriptions
            if (faker.datatype.boolean()) {
                await db.insert(schema.prescriptions).values({
                    patientId: patient.id,
                    doctorId: doctor.id,
                    enrollmentId: enrollment.id,
                    title: `Prescription for ${program.name}`,
                    description: faker.lorem.paragraph(),
                    prescribedDate: faker.date.recent().toISOString().split('T')[0],
                    isActive: true,
                });
            }

            // 7. Add Lab Reports
            if (faker.datatype.boolean()) {
                await db.insert(schema.labReports).values({
                    patientId: patient.id,
                    title: 'Blood Test Results',
                    reportDate: faker.date.recent().toISOString().split('T')[0],
                    labName: 'City Path Labs',
                    description: 'Routine blood work',
                });
            }
        }
    }

    // 8. Create Conversations & Messages
    console.log('Creating conversations...');
    for (const patient of patients) {
        const hasOpenQuery = faker.datatype.boolean();

        if (hasOpenQuery) {
            const [conversation] = await db.insert(schema.conversations).values({
                doctorId: doctor.id,
                patientId: patient.id,
                type: 'query',
                status: 'open',
                unreadCount: faker.number.int({ min: 0, max: 3 }),
                lastMessageAt: new Date(),
                lastMessagePreview: 'I have a question about my medication.',
                lastMessageSender: 'Patient',
            }).returning();

            // Add messages
            await db.insert(schema.messages).values([
                {
                    conversationId: conversation.id,
                    content: 'Hi Doctor, I have a question.',
                    contentType: 'Text',
                    sender: 'Patient',
                    read: true,
                    timestamp: faker.date.recent({ days: 2 }),
                },
                {
                    conversationId: conversation.id,
                    content: 'Sure, go ahead.',
                    contentType: 'Text',
                    sender: 'Doctor',
                    read: true,
                    timestamp: faker.date.recent({ days: 1 }),
                },
                {
                    conversationId: conversation.id,
                    content: 'I have a question about my medication.',
                    contentType: 'Text',
                    sender: 'Patient',
                    read: false,
                    timestamp: new Date(),
                }
            ]);
        }

        // Check-ins
        if (faker.datatype.boolean()) {
            const [checkin] = await db.insert(schema.conversations).values({
                doctorId: doctor.id,
                patientId: patient.id,
                type: 'checkin',
                checkinType: 'Weekly Check-In',
                status: 'open',
                unreadCount: 1,
                lastMessageAt: new Date(),
                lastMessagePreview: 'Weekly check-in submitted.',
                lastMessageSender: 'Patient',
            }).returning();

            await db.insert(schema.messages).values({
                conversationId: checkin.id,
                content: 'Weekly check-in submitted.',
                contentType: 'Text',
                sender: 'Patient',
                read: false,
                timestamp: new Date(),
            });
        }
    }

    // 9. Create Appointments
    console.log('Creating appointments...');
    const appointmentTypes = ['in-person', 'video', 'phone'];
    const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];

    for (const patient of patients) {
        // Past appointments
        for (let i = 0; i < 3; i++) {
            await db.insert(schema.appointments).values({
                patientId: patient.id,
                doctorId: doctor.id,
                title: 'Follow-up',
                appointmentType: faker.helpers.arrayElement(appointmentTypes),
                status: 'completed',
                scheduledAt: faker.date.past(),
                duration: 30,
            });
        }

        // Upcoming appointments
        if (faker.datatype.boolean()) {
            await db.insert(schema.appointments).values({
                patientId: patient.id,
                doctorId: doctor.id,
                title: 'Regular Checkup',
                appointmentType: faker.helpers.arrayElement(appointmentTypes),
                status: 'scheduled',
                scheduledAt: faker.date.future(),
                duration: 30,
            });
        }

        // Today's appointments
        if (faker.datatype.boolean(0.3)) { // 30% chance
            const today = new Date();
            today.setHours(faker.number.int({ min: 9, max: 17 }), 0, 0, 0);

            await db.insert(schema.appointments).values({
                patientId: patient.id,
                doctorId: doctor.id,
                title: 'Urgent Consultation',
                appointmentType: 'video',
                status: 'scheduled',
                scheduledAt: today,
                duration: 30,
            });
        }
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
