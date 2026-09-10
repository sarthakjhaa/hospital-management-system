import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CreateMedicalRecordSchema } from '@/lib/validations';
import { Role, AppointmentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    const where: any = {};
    if (session.role === Role.PATIENT && session.patientProfileId) {
      where.patientId = session.patientProfileId;
    } else if (patientId) {
      where.patientId = patientId;
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        appointment: true,
        prescriptions: {
          include: {
            items: { include: { medicine: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Fetch medical records error:', error);
    return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.DOCTOR && session.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = CreateMedicalRecordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { appointmentId, patientId, diagnosis, treatment, labResults, prescriptionNotes, medicines } =
      parseResult.data;

    let targetDoctorId = session.doctorProfileId;
    if (!targetDoctorId) {
      // Admin override selector
      const doc = await prisma.doctorProfile.findFirst();
      targetDoctorId = doc?.id;
    }

    if (!targetDoctorId) {
      return NextResponse.json({ error: 'Doctor profile required to create EHR record' }, { status: 400 });
    }

    // Create Medical Record
    const record = await prisma.medicalRecord.create({
      data: {
        appointmentId: appointmentId || null,
        patientId,
        doctorId: targetDoctorId,
        diagnosis,
        treatment,
        labResults,
      },
    });

    // If appointment is linked, mark appointment as COMPLETED
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }

    // Create Prescription if medicines provided
    let prescription = null;
    if (medicines && medicines.length > 0) {
      prescription = await prisma.prescription.create({
        data: {
          medicalRecordId: record.id,
          patientId,
          doctorId: targetDoctorId,
          notes: prescriptionNotes,
          items: {
            create: medicines.map((m) => ({
              medicineId: m.medicineId,
              dosage: m.dosage,
              quantity: m.quantity,
            })),
          },
        },
        include: {
          items: { include: { medicine: true } },
        },
      });
    }

    // Send notification to patient (PART 17)
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      select: { userId: true },
    });

    if (patientProfile?.userId) {
      await prisma.notification.create({
        data: {
          userId: patientProfile.userId,
          title: 'New Medical Record Added',
          message: 'New medical record information has been added to your account.',
        },
      });

      if (prescription) {
        await prisma.notification.create({
          data: {
            userId: patientProfile.userId,
            title: 'New Prescription Added',
            message: 'A new prescription has been added to your account.',
          },
        });
      }
    }

    return NextResponse.json({ message: 'Medical record & prescription created successfully', record, prescription });
  } catch (error) {
    console.error('Create medical record error:', error);
    return NextResponse.json({ error: 'Failed to create medical record' }, { status: 500 });
  }
}
