import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { CreateMedicineSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { category: { contains: query } },
        { supplier: { contains: query } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (lowStock) {
      where.stock = { lte: 30 };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    // Compute Alert Summaries
    const lowStockAlerts = medicines.filter((m) => m.stock <= 30);
    const nearExpiryAlerts = medicines.filter(
      (m) => new Date(m.expiryDate) <= sixtyDaysLater && new Date(m.expiryDate) >= now
    );

    return NextResponse.json({
      medicines,
      stats: {
        totalItems: medicines.length,
        lowStockCount: lowStockAlerts.length,
        nearExpiryCount: nearExpiryAlerts.length,
      },
      alerts: {
        lowStock: lowStockAlerts,
        nearExpiry: nearExpiryAlerts,
      },
    });
  } catch (error) {
    console.error('Fetch pharmacy error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.PHARMACIST && session.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = CreateMedicineSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { name, category, price, stock, expiryDate, supplier, description } = parseResult.data;

    const existing = await prisma.medicine.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Medicine with this name already exists' }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        category,
        price,
        stock,
        expiryDate: new Date(expiryDate),
        supplier,
        description,
      },
    });

    return NextResponse.json({ message: 'Medicine added to inventory', medicine });
  } catch (error) {
    console.error('Create medicine error:', error);
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}
