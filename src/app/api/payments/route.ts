import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { ProcessDemoPaymentSchema } from '@/lib/validations';
import { PaymentStatus, OrderStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const method = searchParams.get('method');
    const query = searchParams.get('query');

    const where: any = {};

    // IDOR Protection: Patient role can strictly only view own payments
    if (session.role === Role.PATIENT) {
      if (!session.patientProfileId) {
        return NextResponse.json({ error: 'Patient profile missing' }, { status: 403 });
      }
      where.bill = { patientId: session.patientProfileId };
    } else if (query) {
      where.OR = [
        { transactionId: { contains: query } },
        { bill: { billNo: { contains: query } } },
        { bill: { patient: { user: { name: { contains: query } } } } },
      ];
    }

    if (method) {
      where.method = method;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        bill: {
          include: {
            patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
            appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } },
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = ProcessDemoPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payment parameters', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { billId, amount, method, simulateFailure } = body;

    // Verify Bill Exists & IDOR Protection
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { order: true, patient: { include: { user: { select: { id: true, name: true } } } } },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill invoice not found' }, { status: 404 });
    }

    // IDOR Protection: PATIENT role can only pay own bill
    if (session.role === Role.PATIENT && session.patientProfileId !== bill.patientId) {
      return NextResponse.json({ error: 'Access denied: Cannot pay another patient invoice' }, { status: 403 });
    }

    if (bill.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ error: 'This bill has already been settled and paid' }, { status: 400 });
    }

    // Handle Simulated Failure (PART 12)
    if (simulateFailure) {
      // Audit log entry for failed attempt
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: 'DEMO_PAYMENT_FAILED',
          details: `Simulated DEMO ${method} payment failure for Invoice #${bill.billNo}.`,
        },
      });

      if (bill.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: bill.patient.user.id,
            title: 'Payment Failed',
            message: `Payment failed for Invoice #${bill.billNo}. Please try again.`,
          },
        });
      }

      return NextResponse.json({ error: 'Demo Payment Gateway: Transaction simulated failure. Please retry payment.' }, { status: 400 });
    }

    // ATOMIC TRANSACTION FOR DEMO PAYMENT PROCESSING (PART 13)
    const result = await prisma.$transaction(async (tx) => {
      const txnPrefix = method === 'UPI' ? 'UPI' : method === 'CARD' ? 'CARD' : 'WLT';
      const transactionId = `TXN-DEMO-${txnPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          transactionId,
          billId,
          amount: bill.grandTotal, // Enforce server-calculated grand total (PART 21)
          method,
          status: 'SUCCESS',
        },
      });

      // 2. Update Bill Status to PAID
      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: { paymentStatus: PaymentStatus.PAID },
        include: {
          items: true,
          patient: { include: { user: { select: { name: true, email: true } } } },
        },
      });

      // 3. If bill is linked to a Medicine Order, update Order Status to DISPENSED
      if (bill.orderId) {
        await tx.medicineOrder.update({
          where: { id: bill.orderId },
          data: { status: OrderStatus.DISPENSED },
        });
      }

      // 4. Create Notification (PART 23)
      if (bill.patient?.user?.id) {
        await tx.notification.create({
          data: {
            userId: bill.patient.user.id,
            title: 'Payment Successful',
            message: `Payment successful for Invoice #${bill.billNo}. Transaction reference: ${transactionId}.`,
          },
        });
      }

      // 5. Audit Log Entry (PART 24)
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'DEMO_PAYMENT_PROCESSED',
          details: `Simulated DEMO ${method} payment of $${bill.grandTotal} for Invoice #${bill.billNo} (Txn: ${transactionId}).`,
        },
      });

      return { payment, bill: updatedBill, transactionId };
    });

    return NextResponse.json({
      message: 'DEMO Payment processed successfully!',
      transactionId: result.transactionId,
      payment: result.payment,
      bill: result.bill,
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process demo payment' }, { status: 500 });
  }
}
