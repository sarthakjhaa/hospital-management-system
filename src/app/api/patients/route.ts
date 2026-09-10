import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { RegisterPatientSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    const where: any = {};
    if (query) {
      where.OR = [
        { patientIdCode: { contains: query } },
        { user: { name: { contains: query } } },
        { user: { email: { contains: query } } },
        { user: { phone: { contains: query } } },
      ];
    }

    const patients = await prisma.patientProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        appointments: {
          take: 3,
          orderBy: { date: 'desc' },
          include: { doctor: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Fetch patients error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.RECEPTIONIST)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = RegisterPatientSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { name, email, password, phone, age, gender, address, emergencyContact, bloodGroup, medicalHistory } =
      parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const patientCode = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: Role.PATIENT,
        patientProfile: {
          create: {
            patientIdCode: patientCode,
            age,
            gender,
            address,
            emergencyContact,
            bloodGroup,
            medicalHistory,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    return NextResponse.json({ message: 'Patient registered successfully', patient: user });
  } catch (error) {
    console.error('Register patient error:', error);
    return NextResponse.json({ error: 'Failed to register patient' }, { status: 500 });
  }
}
