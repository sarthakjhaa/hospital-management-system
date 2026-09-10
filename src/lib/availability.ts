import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';

export interface AvailableSlotsResult {
  isWorkingDay: boolean;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
  slotDurationMins: number;
  availableSlots: string[];
  bookedSlots: string[];
  message?: string;
}

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Normalize time slot strings to standard 12-hour format "HH:MM AM/PM" (e.g. "09:00 AM", "02:30 PM")
 */
export function normalizeSlot(slot: string): string {
  if (!slot) return '';
  const trimmed = slot.trim().toUpperCase();

  // Match 12-hour format like "9:00 AM" or "09:00 AM" or "2:30 PM"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    const hours = parseInt(ampmMatch[1], 10).toString().padStart(2, '0');
    const mins = ampmMatch[2];
    const period = ampmMatch[3];
    return `${hours}:${mins} ${period}`;
  }

  // Match 24-hour format like "09:00" or "14:30"
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    let hours = parseInt(h24Match[1], 10);
    const mins = h24Match[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    const formattedHours = hours.toString().padStart(2, '0');
    return `${formattedHours}:${mins} ${period}`;
  }

  return trimmed;
}

/**
 * Convert normalized slot to minutes since midnight for past-slot checks
 */
export function getSlotMinutes(slot: string): number {
  const norm = normalizeSlot(slot);
  const match = norm.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3];
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Generate 30-minute time slots in standard 12-hour AM/PM format (e.g. "09:00 AM" to "05:00 PM")
 */
export function generateTimeSlots(startTime = '09:00', endTime = '17:00', stepMins = 30): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + stepMins <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const time24 = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    slots.push(normalizeSlot(time24));
    currentMinutes += stepMins;
  }

  return slots;
}

/**
 * Reusable Doctor Availability & Time Slot Service
 */
export async function getDoctorAvailableSlots(
  doctorId: string,
  targetDate: Date
): Promise<AvailableSlotsResult> {
  const dayIndex = targetDate.getDay();
  const dayOfWeek = DAY_NAMES[dayIndex];

  // 1. Fetch Doctor Working Schedule for the day of week
  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId,
      dayOfWeek,
    },
  });

  // Default OPD schedule if no explicit DoctorSchedule row exists in DB
  const isAvailable = schedule ? schedule.isAvailable : true;
  const startTime = schedule?.startTime || '09:00';
  const endTime = schedule?.endTime || '17:00';

  if (!isAvailable) {
    return {
      isWorkingDay: false,
      dayOfWeek,
      slotDurationMins: 30,
      availableSlots: [],
      bookedSlots: [],
      message: `Doctor has no available OPD schedule on ${dayOfWeek}s.`,
    };
  }

  // 2. Generate standard 12-hour AM/PM time slots
  const rawSlots = generateTimeSlots(startTime, endTime, 30);

  // 3. Fetch existing booked appointments for doctor on target date
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      },
    },
    select: {
      timeSlot: true,
    },
  });

  const bookedSlotsNormalized = existingAppointments.map((a) => normalizeSlot(a.timeSlot));

  // 4. Check if date is today, filter out past time slots
  const now = new Date();
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const availableSlots = rawSlots.filter((slot) => {
    const norm = normalizeSlot(slot);
    if (bookedSlotsNormalized.includes(norm)) return false;

    if (isToday) {
      const slotMins = getSlotMinutes(slot);
      if (slotMins <= currentMinutes) return false; // past slot today
    }

    return true;
  });

  return {
    isWorkingDay: true,
    dayOfWeek,
    startTime,
    endTime,
    slotDurationMins: 30,
    availableSlots,
    bookedSlots: bookedSlotsNormalized,
  };
}
