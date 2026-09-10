export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.PHARMACIST && session.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, category, price, stock, expiryDate, supplier, description } = body;

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(supplier && { supplier }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ message: 'Medicine updated successfully', medicine: updated });
  } catch (error) {
    console.error('Update medicine error:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.PHARMACIST && session.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.medicine.delete({ where: { id } });
    return NextResponse.json({ message: 'Medicine removed from inventory' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ error: 'Failed to remove medicine' }, { status: 500 });
  }
}
