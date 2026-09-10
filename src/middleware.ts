import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hms_super_secret_jwt_key_btech_cse_2026'
);

const COOKIE_NAME = 'hms_session';

const ROLE_SAFE_REDIRECTS: Record<Role, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  PATIENT: '/patient/dashboard',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/pharmacist') ||
    pathname.startsWith('/dashboard') ||
    (pathname.startsWith('/patient') && !pathname.startsWith('/patient/doctors'));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as Role;
    const userSafeDashboard = ROLE_SAFE_REDIRECTS[role] || '/patient/dashboard';

    // 1. ADMIN Route Protection
    if ((pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')) && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    // 2. DOCTOR Route Protection
    if ((pathname.startsWith('/doctor') || pathname.startsWith('/dashboard/doctor')) && role !== 'DOCTOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    // 3. NURSE Route Protection
    if ((pathname.startsWith('/nurse') || pathname.startsWith('/dashboard/nurse')) && role !== 'NURSE' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    // 4. RECEPTIONIST Route Protection
    if ((pathname.startsWith('/receptionist') || pathname.startsWith('/dashboard/receptionist')) && role !== 'RECEPTIONIST' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    // 5. PHARMACIST Route Protection
    if ((pathname.startsWith('/pharmacist') || pathname.startsWith('/dashboard/pharmacist')) && role !== 'PHARMACIST' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    // 6. PATIENT Route Protection
    if (
      (pathname.startsWith('/patient') || pathname.startsWith('/dashboard/patient')) &&
      role !== 'PATIENT' &&
      role !== 'ADMIN' &&
      role !== 'RECEPTIONIST'
    ) {
      return NextResponse.redirect(new URL(userSafeDashboard, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'Session expired. Please log in again.');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/nurse/:path*',
    '/receptionist/:path*',
    '/pharmacist/:path*',
    '/patient/:path*',
    '/dashboard/:path*',
  ],
};
