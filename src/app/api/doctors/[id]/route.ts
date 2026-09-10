export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { parseDoctorBio } from '@/lib/doctorUtils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: true,
        schedules: true,
        appointments: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const parsedMeta = parseDoctorBio(doctor.bio);

    return NextResponse.json({
      doctor: {
        ...doctor,
        parsedMeta,
      },
    });
  } catch (error) {
    console.error('Fetch doctor detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, departmentId, specialty, consultationFee, bio, availability } = body;

    const existing = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    // Update User Name / Phone if provided
    if (name || phone) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    // Update Doctor Profile
    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: {
        ...(departmentId && { departmentId }),
        ...(specialty && { specialty }),
        ...(consultationFee !== undefined && { consultationFee: parseFloat(consultationFee) }),
        ...(bio !== undefined && { bio }),
        ...(availability && { availability }),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        department: true,
        schedules: true,
      },
    });

    return NextResponse.json({ message: 'Doctor profile updated successfully', doctor: updated });
  } catch (error) {
    console.error('Update doctor error:', error);
    return NextResponse.json({ error: 'Failed to update doctor profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.doctorProfile.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Safely delete associated user account (cascades profile)
    await prisma.user.delete({ where: { id: existing.userId } });

    return NextResponse.json({ message: 'Doctor account removed successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json({ error: 'Failed to delete doctor account' }, { status: 500 });
  }
}
