export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CreateBillSchema } from '@/lib/validations';
import { PaymentStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const paymentStatus = searchParams.get('paymentStatus');

    const where: any = {};
    if (session.role === Role.PATIENT && session.patientProfileId) {
      where.patientId = session.patientProfileId;
    } else if (patientId) {
      where.patientId = patientId;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } },
        order: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Fetch bills error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.RECEPTIONIST)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = CreateBillSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { patientId, appointmentId, orderId, items, discount, tax } = parseResult.data;

    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const grandTotal = Math.max(0, subtotal - discount + tax);

    const billNo = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const bill = await prisma.bill.create({
      data: {
        billNo,
        patientId,
        appointmentId: appointmentId || null,
        orderId: orderId || null,
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentStatus: PaymentStatus.UNPAID,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        patient: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ message: 'Billing invoice generated successfully', bill });
  } catch (error) {
    console.error('Generate bill error:', error);
    return NextResponse.json({ error: 'Failed to generate billing invoice' }, { status: 500 });
  }
}
