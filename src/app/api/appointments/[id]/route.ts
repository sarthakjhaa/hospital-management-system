export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AppointmentStatus, Role } from '@prisma/client';
import { getDoctorAvailableSlots } from '@/lib/availability';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            department: true,
          },
        },
        bills: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // IDOR Protection (PART 8 & 18)
    if (session.role === Role.PATIENT && appointment.patientId !== session.patientProfileId) {
      return NextResponse.json({ error: 'Forbidden: You cannot access another patient\'s appointment details' }, { status: 403 });
    }

    if (session.role === Role.DOCTOR && appointment.doctorId !== session.doctorProfileId) {
      return NextResponse.json({ error: 'Forbidden: You are not assigned to this appointment' }, { status: 403 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Fetch appointment detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, date, timeSlot, reason } = body;

    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // IDOR Protection for Updates
    if (session.role === Role.PATIENT && existing.patientId !== session.patientProfileId) {
      return NextResponse.json({ error: 'Forbidden: You cannot modify this appointment' }, { status: 403 });
    }

    if (session.role === Role.DOCTOR && existing.doctorId !== session.doctorProfileId) {
      return NextResponse.json({ error: 'Forbidden: You are not assigned to this appointment' }, { status: 403 });
    }

    // Case 1: Rescheduling (PART 10)
    if (date || timeSlot) {
      const targetDate = date ? new Date(date) : new Date(existing.date);
      const targetTimeSlot = timeSlot || existing.timeSlot;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        return NextResponse.json({ error: 'Cannot reschedule to a past date' }, { status: 400 });
      }

      // Check double booking on target date/slot (excluding current appointment ID)
      const isSlotConflict = await prisma.appointment.findFirst({
        where: {
          doctorId: existing.doctorId,
          date: targetDate,
          timeSlot: targetTimeSlot,
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          id: { not: existing.id },
        },
      });

      if (isSlotConflict) {
        return NextResponse.json(
          { error: 'The selected rescheduled time slot is no longer available. Please select a different time.' },
          { status: 409 }
        );
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          date: targetDate,
          timeSlot: targetTimeSlot,
          status: AppointmentStatus.CONFIRMED,
          ...(reason && { reason }),
        },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      });

      // DB Notification for Reschedule (PART 17)
      if (existing.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: existing.patient.user.id,
            title: 'Appointment Rescheduled',
            message: `Your appointment #${existing.appointmentNo} with Dr. ${existing.doctor.user.name} has been rescheduled to ${targetDate.toLocaleDateString()} at ${targetTimeSlot}.`,
          },
        });
      }

      return NextResponse.json({ message: 'Appointment rescheduled successfully', appointment: updated });
    }

    // Case 2: Status Update / Cancellation (PART 9)
    if (status && Object.values(AppointmentStatus).includes(status)) {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      });

      // DB Notification for Cancellation or Status Change
      if (existing.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: existing.patient.user.id,
            title: `Appointment ${status}`,
            message: `Your appointment #${existing.appointmentNo} status has been updated to ${status}.`,
          },
        });
      }

      return NextResponse.json({ message: `Appointment status updated to ${status}`, appointment: updated });
    }

    return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
