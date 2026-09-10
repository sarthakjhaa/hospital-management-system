export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, getSessionCookieName } from '@/lib/auth';
import { LoginSchema } from '@/lib/validations';
import { ROLE_DASHBOARDS } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = LoginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientProfileId: user.patientProfile?.id,
      doctorProfileId: user.doctorProfile?.id,
    };

    const token = await signToken(sessionPayload);
    const redirectTo = ROLE_DASHBOARDS[user.role] || '/dashboard/patient';

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo,
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
  }
}
