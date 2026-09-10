import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { name: true, email: true } },
                department: { select: { name: true } },
              },
            },
          },
        },
        order: {
          include: {
            items: {
              include: {
                medicine: { select: { name: true, category: true, price: true } },
              },
            },
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // IDOR Protection: Patient can strictly only access their own bills
    if (session.role === Role.PATIENT && session.patientProfileId !== bill.patientId) {
      return NextResponse.json(
        { error: 'Access denied: You do not have authorization to view this invoice' },
        { status: 403 }
      );
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Fetch bill by ID error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice details' }, { status: 500 });
  }
}
