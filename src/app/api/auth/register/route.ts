export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, getSessionCookieName } from '@/lib/auth';
import { RegisterPatientSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RegisterPatientSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name, phone, age, gender, address, emergencyContact, bloodGroup, medicalHistory } =
      parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const patientCode = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
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

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientProfileId: user.patientProfile?.id,
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        patientCode: user.patientProfile?.patientIdCode,
      },
      redirectTo: '/dashboard/patient',
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create patient account' }, { status: 500 });
  }
}
