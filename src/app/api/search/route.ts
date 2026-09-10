import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ patients: [], doctors: [], appointments: [], medicines: [], bills: [] });
    }

    const q = query.trim();

    const [patients, doctors, appointments, medicines, bills] = await Promise.all([
      prisma.patientProfile.findMany({
        where: {
          OR: [
            { patientIdCode: { contains: q } },
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
          ],
        },
        include: { user: { select: { name: true, email: true, phone: true } } },
        take: 5,
      }),
      prisma.doctorProfile.findMany({
        where: {
          OR: [
            { specialty: { contains: q } },
            { user: { name: { contains: q } } },
            { department: { name: { contains: q } } },
          ],
        },
        include: { user: { select: { name: true, email: true } }, department: true },
        take: 5,
      }),
      prisma.appointment.findMany({
        where: {
          OR: [
            { appointmentNo: { contains: q } },
            { reason: { contains: q } },
            { patient: { user: { name: { contains: q } } } },
          ],
        },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
        take: 5,
      }),
      prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
            { supplier: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.bill.findMany({
        where: {
          OR: [
            { billNo: { contains: q } },
            { patient: { user: { name: { contains: q } } } },
          ],
        },
        include: { patient: { include: { user: { select: { name: true } } } } },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      patients,
      doctors,
      appointments,
      medicines,
      bills,
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
