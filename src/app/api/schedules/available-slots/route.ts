import { NextRequest, NextResponse } from 'next/server';
import { getDoctorAvailableSlots } from '@/lib/availability';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const dateStr = searchParams.get('date');

    if (!doctorId || !dateStr) {
      return NextResponse.json({ error: 'doctorId and date query parameters are required' }, { status: 400 });
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date string provided' }, { status: 400 });
    }

    const slotsResult = await getDoctorAvailableSlots(doctorId, targetDate);
    return NextResponse.json(slotsResult);
  } catch (error) {
    console.error('Fetch available slots error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor available time slots' }, { status: 500 });
  }
}
