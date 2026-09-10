import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { id } = await params;

    // IDOR Protection: Patient can strictly only access their own profile & EHR records
    if (session.role === Role.PATIENT && session.patientProfileId !== id) {
      return NextResponse.json({ error: 'Access denied: Cannot access another patient private record' }, { status: 403 });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        appointments: {
          include: {
            doctor: { include: { user: { select: { name: true } }, department: true } },
          },
          orderBy: { date: 'desc' },
        },
        medicalRecords: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
            prescriptions: {
              include: {
                items: { include: { medicine: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        prescriptions: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
            items: { include: { medicine: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        medicineOrders: {
          include: {
            items: { include: { medicine: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        bills: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Fetch patient profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch patient history' }, { status: 500 });
  }
}
