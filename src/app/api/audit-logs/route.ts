export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
