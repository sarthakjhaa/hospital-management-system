import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { BookAppointmentSchema } from '@/lib/validations';
import { AppointmentStatus, Role } from '@prisma/client';
import { getDoctorAvailableSlots, normalizeSlot } from '@/lib/availability';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const where: any = {};

    // IDOR Protection: Patients strictly see only their own appointments
    if (session.role === Role.PATIENT) {
      if (!session.patientProfileId) {
        return NextResponse.json({ error: 'Patient profile missing' }, { status: 403 });
      }
      where.patientId = session.patientProfileId;
    } else if (session.role === Role.DOCTOR) {
      if (!session.doctorProfileId) {
        return NextResponse.json({ error: 'Doctor profile missing' }, { status: 403 });
      }
      where.doctorId = session.doctorProfileId;
    } else {
      // ADMIN, RECEPTIONIST, NURSE can filter by query params
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;
    }

    if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      where.status = status as AppointmentStatus;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            department: true,
          },
        },
        bills: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = BookAppointmentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { doctorId, patientId: reqPatientId, date, timeSlot: rawTimeSlot, reason, symptoms } = parseResult.data;
    const timeSlot = normalizeSlot(rawTimeSlot);

    let targetPatientId = reqPatientId;
    // IDOR Protection: Override requested patient ID with session patient ID if caller is PATIENT
    if (session.role === Role.PATIENT) {
      targetPatientId = session.patientProfileId;
    }

    if (!targetPatientId) {
      return NextResponse.json({ error: 'Valid patient profile is required for booking' }, { status: 400 });
    }

    const validPatientId: string = targetPatientId;
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Validation: Prevent past date booking
    if (targetDate < today) {
      return NextResponse.json({ error: 'Cannot book appointments for past dates' }, { status: 400 });
    }

    // 2. Check doctor availability using availability service
    const slotsInfo = await getDoctorAvailableSlots(doctorId, targetDate);
    if (!slotsInfo.isWorkingDay) {
      return NextResponse.json({ error: slotsInfo.message || 'Doctor is not available on selected day' }, { status: 400 });
    }

    const isSlotAvailable = slotsInfo.availableSlots.some((s) => normalizeSlot(s) === timeSlot);
    if (!isSlotAvailable) {
      return NextResponse.json(
        { error: 'This time slot has just been booked. Please select another available time.' },
        { status: 409 }
      );
    }

    // 3. ATOMIC TRANSACTION FOR APPOINTMENT BOOKING & DOUBLE-BOOKING PROTECTION
    const result = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctorProfile.findUnique({
        where: { id: doctorId },
        include: { user: { select: { name: true, id: true } } },
      });

      if (!doctor) {
        throw new Error('Selected doctor account does not exist');
      }

      // Re-verify slot inside transaction using same day range
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await tx.appointment.findMany({
        where: {
          doctorId,
          date: { gte: startOfDay, lte: endOfDay },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
        select: { timeSlot: true },
      });

      const isConflict = existingAppointments.some((a) => normalizeSlot(a.timeSlot) === timeSlot);
      if (isConflict) {
        throw new Error('This time slot has just been booked. Please select another available time.');
      }

      const appointmentNo = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create Appointment Record (Status defaults to CONFIRMED for seamless flow)
      const appointment = await tx.appointment.create({
        data: {
          appointmentNo,
          patientId: validPatientId,
          doctorId,
          date: targetDate,
          timeSlot,
          reason,
          symptoms,
          status: AppointmentStatus.CONFIRMED,
        },
        include: {
          patient: { include: { user: { select: { name: true, id: true } } } },
          doctor: { include: { user: { select: { name: true } }, department: true } },
        },
      });

      // Auto-generate consultation fee bill
      await tx.bill.create({
        data: {
          billNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: validPatientId,
          appointmentId: appointment.id,
          subtotal: doctor.consultationFee,
          discount: 0,
          tax: 0,
          grandTotal: doctor.consultationFee,
          paymentStatus: 'UNPAID',
          items: {
            create: [
              {
                description: `Consultation Fee - Dr. ${doctor.user.name} (${doctor.specialty})`,
                amount: doctor.consultationFee,
              },
            ],
          },
        },
      });

      // Create DB-backed Notifications (PART 17)
      if (appointment.patient?.user?.id) {
        await tx.notification.create({
          data: {
            userId: appointment.patient.user.id,
            title: 'Appointment Confirmed',
            message: `Your appointment #${appointmentNo} with Dr. ${doctor.user.name} on ${targetDate.toLocaleDateString()} at ${timeSlot} is confirmed.`,
          },
        });
      }

      // Audit Log Entry
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'APPOINTMENT_BOOKED',
          details: `Booked appointment #${appointmentNo} for patient ${validPatientId} with Doctor Dr. ${doctor.user.name}.`,
        },
      });

      return appointment;
    });

    return NextResponse.json({ message: 'Appointment booked successfully', appointment: result });
  } catch (error: any) {
    console.error('Book appointment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to book appointment' },
      { status: error.message?.includes('no longer available') ? 409 : 400 }
    );
  }
}
