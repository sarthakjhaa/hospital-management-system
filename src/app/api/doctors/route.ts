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

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    const where: any = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (query) {
      where.OR = [
        { user: { name: { contains: query } } },
        { specialty: { contains: query } },
        { department: { name: { contains: query } } },
        { bio: { contains: query } },
      ];
    }

    const rawDoctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        department: true,
        schedules: true,
      },
      orderBy: { rating: 'desc' },
    });

    let doctors = rawDoctors.map((doc) => {
      const parsedMeta = parseDoctorBio(doc.bio);
      return {
        ...doc,
        parsedMeta,
      };
    });

    // Apply location, hospital & language filters
    if (state && state !== 'ALL') {
      doctors = doctors.filter((d) => d.parsedMeta.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== 'ALL') {
      doctors = doctors.filter((d) => d.parsedMeta.district.toLowerCase() === district.toLowerCase());
    }
    if (city && city !== 'ALL') {
      doctors = doctors.filter((d) => d.parsedMeta.city.toLowerCase() === city.toLowerCase());
    }
    if (hospital && hospital !== 'ALL') {
      doctors = doctors.filter((d) => d.parsedMeta.hospital.toLowerCase() === hospital.toLowerCase());
    }
    if (language && language !== 'ALL') {
      doctors = doctors.filter((d) =>
        d.parsedMeta.languages.some((l) => l.toLowerCase() === language.toLowerCase())
      );
    }

    const totalCount = doctors.length;
    let paginatedDoctors = doctors;

    let totalPages = 1;
    if (limit > 0) {
      totalPages = Math.ceil(totalCount / limit) || 1;
      const startIndex = (page - 1) * limit;
      paginatedDoctors = doctors.slice(startIndex, startIndex + limit);
    }

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      doctors: paginatedDoctors,
      allDoctorsCount: totalCount,
      departments,
      pagination: {
        page,
        limit: limit > 0 ? limit : totalCount,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
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
