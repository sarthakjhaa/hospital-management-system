import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully', redirectTo: '/login' });
  response.cookies.delete(getSessionCookieName());
  return response;
}
