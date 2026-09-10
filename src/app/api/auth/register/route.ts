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
      const firstIssue = parseResult.error.issues[0];
      const errorMessage = firstIssue ? firstIssue.message : 'Invalid registration details provided';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const {
      email,
      password,
      name,
      phone,
      age,
      gender,
      address,
      emergencyContact,
      bloodGroup,
      medicalHistory,
    } = parseResult.data;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // Check duplicate email or phone number
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === normalizedEmail) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 400 }
        );
      }
      if (existingUser.phone === normalizedPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please use another phone number.' },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(password);
    // Collision-proof unique patient ID code
    const patientCode = `PAT-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        phone: normalizedPhone,
        role: Role.PATIENT,
        patientProfile: {
          create: {
            patientIdCode: patientCode,
            age,
            gender: gender || 'Male',
            address: address || 'Not specified',
            emergencyContact: emergencyContact || 'Not specified',
            bloodGroup: bloodGroup || 'O+',
            medicalHistory: medicalHistory || '',
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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Registration API Error:', error);

    // Handle Prisma unique constraint violations (P2002)
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (Array.isArray(target) && target.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 400 }
        );
      }
      if (Array.isArray(target) && target.includes('phone')) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please try another phone number.' },
          { status: 400 }
        );
      }
    }

    // Handle Database Connection Failures
    if (
      error?.message?.includes('Can\'t reach database server') ||
      error?.message?.includes('ECONNREFUSED') ||
      error?.code === 'P1001'
    ) {
      return NextResponse.json(
        {
          error:
            'Database service unavailable. Please check your production DATABASE_URL connection in Vercel Environment Variables.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Could not complete patient registration. Please try again.' },
      { status: 500 }
    );
  }
}

