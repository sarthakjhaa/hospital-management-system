import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.medicineOrder.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        items: { include: { medicine: true } },
        bills: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // IDOR Protection (PART 17 & 24)
    if (session.role === Role.PATIENT && order.patientId !== session.patientProfileId) {
      return NextResponse.json({ error: 'Forbidden: Access to another patient\'s order is denied' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
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
    const { status, items } = body;

    const existingOrder = await prisma.medicineOrder.findUnique({
      where: { id },
      include: { items: true, patient: { include: { user: { select: { id: true } } } } },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // IDOR & Role Protection
    if (session.role === Role.PATIENT) {
      if (existingOrder.patientId !== session.patientProfileId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Patients can only cancel or modify orders if status is still PENDING (PART 18)
      if (existingOrder.status !== OrderStatus.PENDING) {
        return NextResponse.json(
          { error: 'This order can no longer be modified or cancelled as it is already being processed or completed.' },
          { status: 400 }
        );
      }
    }

    // ATOMIC TRANSACTION FOR ORDER STATUS UPDATE / CANCELLATION WITH INVENTORY RESTORATION (PART 19)
    const result = await prisma.$transaction(async (tx) => {
      // Handle Order Cancellation & Inventory Restoration
      if (status === OrderStatus.CANCELLED && existingOrder.status !== OrderStatus.CANCELLED) {
        // Restore inventory stock for each order item exactly once
        for (const item of existingOrder.items) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } },
          });
        }

        const updatedOrder = await tx.medicineOrder.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
          include: { items: { include: { medicine: true } } },
        });

        // Audit Log Entry
        await tx.auditLog.create({
          data: {
            userId: session.id,
            action: 'ORDER_CANCELLED',
            details: `Order #${existingOrder.orderNo} cancelled. Restored inventory stock for ${existingOrder.items.length} item(s).`,
          },
        });

        return updatedOrder;
      }

      // Handle Normal Status Change (Pharmacist / Admin)
      if (status && Object.values(OrderStatus).includes(status)) {
        const updatedOrder = await tx.medicineOrder.update({
          where: { id },
          data: { status: status as OrderStatus },
          include: { items: { include: { medicine: true } } },
        });

        await tx.auditLog.create({
          data: {
            userId: session.id,
            action: 'ORDER_STATUS_UPDATED',
            details: `Order #${existingOrder.orderNo} status updated to ${status}.`,
          },
        });

        return updatedOrder;
      }

      // Notify patient of order status update (PART 16)
      if (existingOrder.patient?.user?.id && status) {
        await tx.notification.create({
          data: {
            userId: existingOrder.patient.user.id,
            title: 'Medicine Order Updated',
            message: `Your medicine order #${existingOrder.orderNo} is now ${status}.`,
          },
        });
      }

      return existingOrder;
    });

    return NextResponse.json({ message: 'Order updated successfully', order: result });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 400 });
  }
}
