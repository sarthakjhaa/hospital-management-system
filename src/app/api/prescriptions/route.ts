export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    const where: any = {};

    // IDOR Protection (PART 7 & 24)
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
    } else if (patientId) {
      where.patientId = patientId;
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        medicalRecord: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}
