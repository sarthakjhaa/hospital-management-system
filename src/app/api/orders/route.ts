export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CreateMedicineOrderSchema } from '@/lib/validations';
import { OrderStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const where: any = {};

    // IDOR Protection: Patient role can strictly only view own orders
    if (session.role === Role.PATIENT) {
      if (!session.patientProfileId) {
        return NextResponse.json({ error: 'Patient profile missing' }, { status: 403 });
      }
      where.patientId = session.patientProfileId;
    } else if (patientId) {
      where.patientId = patientId;
    }

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    const orders = await prisma.medicineOrder.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        items: { include: { medicine: true } },
        bills: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch medicine orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = CreateMedicineOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { patientId: reqPatientId, items } = parseResult.data;

    let targetPatientId: string | undefined = reqPatientId;
    // IDOR Protection: Enforce session patient ID for PATIENT role
    if (session.role === Role.PATIENT) {
      targetPatientId = session.patientProfileId;
    }

    if (!targetPatientId) {
      return NextResponse.json({ error: 'Valid patient profile is required' }, { status: 400 });
    }

    const patientId: string = targetPatientId;

    // ATOMIC TRANSACTION FOR MEDICINE ORDER CREATION & INVENTORY DEDUCTION
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemData = [];

      // 1. Verify Medicine Stock and Calculate Server-Side Total
      for (const item of items) {
        const med = await tx.medicine.findUnique({ where: { id: item.medicineId } });
        if (!med) {
          throw new Error(`Medicine ${item.medicineId} not found in inventory`);
        }

        if (med.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stock}, requested: ${item.quantity}`);
        }

        const itemTotal = med.price * item.quantity;
        totalAmount += itemTotal;

        orderItemData.push({
          medicineId: med.id,
          quantity: item.quantity,
          price: med.price,
        });
      }

      const orderNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Create Order & Items
      const order = await tx.medicineOrder.create({
        data: {
          orderNo,
          patientId,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemData,
          },
        },
        include: {
          items: { include: { medicine: true } },
          patient: { include: { user: { select: { name: true } } } },
        },
      });

      // 3. Deduct stock for each medicine
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Auto-create Invoice Bill with 5% Tax
      const tax = Math.round(totalAmount * 0.05 * 100) / 100;
      const grandTotal = Math.round((totalAmount + tax) * 100) / 100;

      await tx.bill.create({
        data: {
          billNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId,
          orderId: order.id,
          subtotal: totalAmount,
          discount: 0,
          tax,
          grandTotal,
          paymentStatus: 'UNPAID',
          items: {
            create: [
              {
                description: `Pharmacy Order #${order.orderNo}`,
                amount: totalAmount,
              },
            ],
          },
        },
      });

      // 5. Audit Log Entry
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'MEDICINE_ORDER_CREATED',
          details: `Created order #${orderNo} (Amount: $${totalAmount}) and updated inventory stock.`,
        },
      });

      return order;
    });

    return NextResponse.json({ message: 'Medicine order placed successfully', order: result });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place medicine order' }, { status: 400 });
  }
}
