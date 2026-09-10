export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const { name, description } = await req.json();

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
    });

    return NextResponse.json({ message: 'Department updated successfully', department: updated });
  } catch (error) {
    console.error('Update department error:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Check if doctors are assigned
    const doctorsCount = await prisma.doctorProfile.count({ where: { departmentId: id } });
    if (doctorsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete department: ${doctorsCount} doctors are currently assigned to it.` },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
