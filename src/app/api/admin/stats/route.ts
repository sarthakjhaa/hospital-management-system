import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role, AppointmentStatus, PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      patientsCount,
      doctorsCount,
      nursesCount,
      receptionistsCount,
      pharmacistsCount,
      todayAppointmentsCount,
      pendingAppointmentsCount,
      completedAppointmentsCount,
      paidBills,
      unpaidBills,
      medicines,
      recentPatients,
      todayAppointments,
      recentOrders,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.PATIENT } }),
      prisma.user.count({ where: { role: Role.DOCTOR } }),
      prisma.user.count({ where: { role: Role.NURSE } }),
      prisma.user.count({ where: { role: Role.RECEPTIONIST } }),
      prisma.user.count({ where: { role: Role.PHARMACIST } }),

      // Appointments
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),

      // Financials
      prisma.bill.findMany({ where: { paymentStatus: PaymentStatus.PAID }, select: { grandTotal: true } }),
      prisma.bill.findMany({ where: { paymentStatus: PaymentStatus.UNPAID }, select: { grandTotal: true } }),

      // Medicines for stock alerts
      prisma.medicine.findMany({ where: { stock: { lte: 30 } } }),

      // Recent items lists
      prisma.patientProfile.findMany({
        take: 5,
        orderBy: { user: { createdAt: 'desc' } },
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
      prisma.appointment.findMany({
        take: 5,
        where: { date: { gte: todayStart, lte: todayEnd } },
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.medicineOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          bill: { include: { patient: { include: { user: { select: { name: true } } } } } },
        },
      }),
    ]);

    const totalRevenue = paidBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const pendingRevenue = unpaidBills.reduce((sum, b) => sum + b.grandTotal, 0);

    return NextResponse.json({
      counts: {
        patients: patientsCount,
        doctors: doctorsCount,
        nurses: nursesCount,
        receptionists: receptionistsCount,
        pharmacists: pharmacistsCount,
        todayAppointments: todayAppointmentsCount,
        pendingAppointments: pendingAppointmentsCount,
        completedAppointments: completedAppointmentsCount,
        totalRevenue,
        pendingRevenue,
        lowStockMedicines: medicines.length,
      },
      lowStockItems: medicines,
      recentPatients,
      todayAppointments,
      recentOrders,
      recentPayments,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to compute admin dashboard statistics' }, { status: 500 });
  }
}
