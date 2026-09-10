import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.DOCTOR)) {
      return NextResponse.json({ error: 'Unauthorized: Admin or Doctor access required' }, { status: 403 });
    }

    const { doctorId, dayOfWeek, startTime, endTime, isAvailable } = await req.json();

    if (!doctorId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required schedule fields' }, { status: 400 });
    }

    // Check existing schedule for overlap on same day
    const existing = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
      },
    });

    let schedule;
    if (existing) {
      schedule = await prisma.doctorSchedule.update({
        where: { id: existing.id },
        data: {
          startTime,
          endTime,
          isAvailable: isAvailable ?? true,
        },
      });
    } else {
      schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: isAvailable ?? true,
        },
      });
    }

    return NextResponse.json({ message: 'Doctor schedule saved successfully', schedule });
  } catch (error) {
    console.error('Save schedule error:', error);
    return NextResponse.json({ error: 'Failed to save doctor schedule' }, { status: 500 });
  }
}
