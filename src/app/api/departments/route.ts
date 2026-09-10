export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Fetch departments error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { name, description } = await req.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Department name must be at least 2 characters' }, { status: 400 });
    }

    const existing = await prisma.department.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
      },
    });

    // Audit Log Entry
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DEPARTMENT_CREATED',
        details: `Created new department '${department.name}'.`,
      },
    });

    return NextResponse.json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
