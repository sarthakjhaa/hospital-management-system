export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { CreateDoctorSchema } from '@/lib/validations';
import { Role } from '@prisma/client';
import { parseDoctorBio } from '@/lib/doctorUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const query = searchParams.get('query');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const city = searchParams.get('city');
    const hospital = searchParams.get('hospital');
    const language = searchParams.get('language');

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const maxLimit = parseInt(searchParams.get('limit') || '300', 10);
    const limit = maxLimit > 0 ? Math.min(maxLimit, 300) : 300;

    const andConditions: any[] = [];

    if (departmentId && departmentId !== 'ALL') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId);
      if (isUuid) {
        andConditions.push({ departmentId });
      } else {
        andConditions.push({
          OR: [
            { department: { name: { contains: departmentId } } },
            { specialty: { contains: departmentId } },
          ],
        });
      }
    }

    if (query && query.trim()) {
      const trimmedQuery = query.trim();
      andConditions.push({
        OR: [
          { user: { name: { contains: trimmedQuery } } },
          { specialty: { contains: trimmedQuery } },
          { department: { name: { contains: trimmedQuery } } },
          { bio: { contains: trimmedQuery } },
        ],
      });
    }

    if (state && state !== 'ALL') {
      andConditions.push({ bio: { contains: state } });
    }
    if (district && district !== 'ALL') {
      andConditions.push({ bio: { contains: district } });
    }
    if (city && city !== 'ALL') {
      andConditions.push({ bio: { contains: city } });
    }
    if (hospital && hospital !== 'ALL') {
      andConditions.push({ bio: { contains: hospital } });
    }
    if (language && language !== 'ALL') {
      andConditions.push({ bio: { contains: language } });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const totalCount = await prisma.doctorProfile.count({ where });

    const rawDoctors = await prisma.doctorProfile.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        department: true,
        schedules: true,
      },
      orderBy: { rating: 'desc' },
    });

    const doctors = rawDoctors.map((doc) => {
      const parsedMeta = parseDoctorBio(doc.bio);
      return {
        ...doc,
        parsedMeta,
      };
    });

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    let dbHost = 'NONE';
    let dbName = 'NONE';
    try {
      const u = new URL(process.env.DATABASE_URL || '');
      dbHost = u.hostname.length > 6 ? u.hostname.substring(0, 4) + '***' + u.hostname.substring(u.hostname.length - 8) : u.hostname;
      dbName = u.pathname.replace(/^\//, '');
    } catch(e) {}

    return NextResponse.json({
      doctors,
      allDoctorsCount: totalCount,
      departments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      dbHost,
      dbName,
    });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors', details: (error as any)?.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.RECEPTIONIST)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = CreateDoctorSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { name, email, password, phone, departmentId, specialty, consultationFee, bio, availability } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const doctorUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: Role.DOCTOR,
        doctorProfile: {
          create: {
            departmentId,
            specialty,
            consultationFee,
            bio,
            availability,
          },
        },
      },
      include: {
        doctorProfile: true,
      },
    });

    return NextResponse.json({ message: 'Doctor added successfully', doctor: doctorUser });
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}
