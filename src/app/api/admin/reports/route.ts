import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role, AppointmentStatus, PaymentStatus, OrderStatus } from '@prisma/client';

function getDateBounds(dateRange?: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date(0);
  let end = new Date();

  if (dateRange === 'today') {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  } else if (dateRange === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    start = new Date(yest.setHours(0, 0, 0, 0));
    end = new Date(yest.setHours(23, 59, 59, 999));
  } else if (dateRange === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date();
  } else if (dateRange === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (dateRange === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (dateRange === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    // Server-side RBAC Guard (PART 20)
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for operational reports' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';
    const dateRange = searchParams.get('dateRange') || 'all';
    const customStart = searchParams.get('startDate') || undefined;
    const customEnd = searchParams.get('endDate') || undefined;
    const departmentId = searchParams.get('departmentId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');

    const { start, end } = getDateBounds(dateRange, customStart, customEnd);
    const hasDateFilter = dateRange !== 'all';

    const dateFilterWhere = hasDateFilter ? { gte: start, lte: end } : undefined;

    if (type === 'patients') {
      const wherePatient: any = {};
      if (hasDateFilter) wherePatient.user = { createdAt: dateFilterWhere };

      const [totalPatients, activePatients, newRegistrations, patientsList] = await Promise.all([
        prisma.patientProfile.count(),
        prisma.patientProfile.count(),
        prisma.patientProfile.count({ where: { user: { createdAt: dateFilterWhere } } }),
        prisma.patientProfile.findMany({
          where: wherePatient,
          include: {
            user: { select: { name: true, email: true, phone: true, createdAt: true } },
            appointments: { select: { id: true } },
            bills: { select: { id: true, grandTotal: true, paymentStatus: true } },
          },
          orderBy: { user: { createdAt: 'desc' } },
        }),
      ]);

      const genderDistribution = {
        MALE: patientsList.filter((p) => p.gender === 'MALE').length,
        FEMALE: patientsList.filter((p) => p.gender === 'FEMALE').length,
        OTHER: patientsList.filter((p) => p.gender === 'OTHER' || !p.gender).length,
      };

      return NextResponse.json({
        report: 'PATIENT',
        summary: { totalPatients, activePatients, newRegistrations, genderDistribution },
        patients: patientsList,
      });
    }

    if (type === 'doctors') {
      const [totalDoctors, doctorsList, departmentsList] = await Promise.all([
        prisma.doctorProfile.count(),
        prisma.doctorProfile.findMany({
          include: {
            user: { select: { name: true, email: true, phone: true } },
            department: true,
            appointments: {
              where: hasDateFilter ? { date: dateFilterWhere } : undefined,
              select: { id: true, status: true },
            },
          },
        }),
        prisma.department.findMany({ include: { doctors: { select: { id: true } } } }),
      ]);

      const deptDistribution = departmentsList.map((d) => ({
        id: d.id,
        name: d.name,
        doctorCount: d.doctors.length,
      }));

      return NextResponse.json({
        report: 'DOCTOR',
        summary: { totalDoctors, departmentCount: departmentsList.length },
        deptDistribution,
        doctors: doctorsList.map((d) => ({
          id: d.id,
          name: d.user.name,
          email: d.user.email,
          phone: d.user.phone,
          specialty: d.specialty,
          department: d.department?.name || 'General',
          consultationFee: d.consultationFee,
          totalAppointments: d.appointments.length,
          completedAppointments: d.appointments.filter((a: any) => a.status === AppointmentStatus.COMPLETED).length,
          cancelledAppointments: d.appointments.filter((a: any) => a.status === AppointmentStatus.CANCELLED).length,
        })),
      });
    }

    if (type === 'appointments') {
      const whereApt: any = {};
      if (hasDateFilter) whereApt.date = dateFilterWhere;
      if (departmentId) whereApt.doctor = { departmentId };
      if (doctorId) whereApt.doctorId = doctorId;
      if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        whereApt.status = status as AppointmentStatus;
      }

      const appointments = await prisma.appointment.findMany({
        where: whereApt,
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } }, department: true } },
        },
        orderBy: { date: 'desc' },
      });

      const counts = {
        total: appointments.length,
        confirmed: appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
        completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
        cancelled: appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
        pending: appointments.filter((a) => a.status === AppointmentStatus.PENDING).length,
      };

      return NextResponse.json({
        report: 'APPOINTMENT',
        counts,
        appointments,
      });
    }

    if (type === 'revenue') {
      const wherePym: any = {};
      if (hasDateFilter) wherePym.createdAt = dateFilterWhere;

      const payments = await prisma.payment.findMany({
        where: wherePym,
        include: {
          bill: {
            include: {
              patient: { include: { user: { select: { name: true } } } },
              appointment: true,
              order: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
      const totalRevenue = successfulPayments.reduce((acc, p) => acc + p.amount, 0);

      const consultationRevenue = successfulPayments
        .filter((p) => p.bill?.appointmentId)
        .reduce((acc, p) => acc + p.amount, 0);

      const pharmacyRevenue = successfulPayments
        .filter((p) => p.bill?.orderId)
        .reduce((acc, p) => acc + p.amount, 0);

      const failedCount = payments.filter((p) => p.status === 'FAILED').length;
      const refundedCount = payments.filter((p) => p.status === 'REFUNDED').length;

      return NextResponse.json({
        report: 'REVENUE',
        summary: {
          totalRevenue,
          consultationRevenue,
          pharmacyRevenue,
          successfulTransactions: successfulPayments.length,
          failedTransactions: failedCount,
          refundedTransactions: refundedCount,
        },
        payments,
      });
    }

    if (type === 'pharmacy') {
      const [medicines, orders] = await Promise.all([
        prisma.medicine.findMany({ orderBy: { name: 'asc' } }),
        prisma.medicineOrder.findMany({
          where: hasDateFilter ? { createdAt: dateFilterWhere } : undefined,
          include: {
            patient: { include: { user: { select: { name: true } } } },
            items: { include: { medicine: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const now = new Date();
      const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const lowStock = medicines.filter((m) => m.stock <= 30);
      const expired = medicines.filter((m) => new Date(m.expiryDate) < now);
      const expiringSoon = medicines.filter((m) => {
        const exp = new Date(m.expiryDate);
        return exp >= now && exp <= in60Days;
      });

      const totalStockUnits = medicines.reduce((acc, m) => acc + m.stock, 0);

      return NextResponse.json({
        report: 'PHARMACY',
        summary: {
          totalMedicines: medicines.length,
          totalStockUnits,
          lowStockCount: lowStock.length,
          expiredCount: expired.length,
          expiringSoonCount: expiringSoon.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === OrderStatus.PENDING).length,
          processingOrders: orders.filter((o) => o.status === OrderStatus.PROCESSING).length,
          completedOrders: orders.filter((o) => o.status === OrderStatus.DISPENSED).length,
          cancelledOrders: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
        },
        medicines,
        orders,
      });
    }

    if (type === 'billing') {
      const whereBill: any = {};
      if (hasDateFilter) whereBill.createdAt = dateFilterWhere;
      if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        whereBill.paymentStatus = status as PaymentStatus;
      }

      const bills = await prisma.bill.findMany({
        where: whereBill,
        include: {
          patient: { include: { user: { select: { name: true } } } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalBilled = bills.reduce((acc, b) => acc + b.grandTotal, 0);
      const totalCollected = bills
        .filter((b) => b.paymentStatus === PaymentStatus.PAID)
        .reduce((acc, b) => acc + b.grandTotal, 0);

      return NextResponse.json({
        report: 'BILLING',
        summary: {
          totalInvoices: bills.length,
          paidInvoices: bills.filter((b) => b.paymentStatus === PaymentStatus.PAID).length,
          unpaidInvoices: bills.filter((b) => b.paymentStatus === PaymentStatus.UNPAID).length,
          refundedInvoices: bills.filter((b) => b.paymentStatus === PaymentStatus.REFUNDED).length,
          totalBilled,
          totalCollected,
        },
        bills,
      });
    }

    // Default Overview / Summary Response
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      totalBills,
      paidBills,
      pendingBills,
      totalRevenue,
      totalOrders,
      completedOrders,
      lowStockCount,
    ] = await Promise.all([
      prisma.patientProfile.count(),
      prisma.doctorProfile.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
      prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
      prisma.bill.count(),
      prisma.bill.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      prisma.bill.count({ where: { paymentStatus: PaymentStatus.UNPAID } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
      prisma.medicineOrder.count(),
      prisma.medicineOrder.count({ where: { status: OrderStatus.DISPENSED } }),
      prisma.medicine.count({ where: { stock: { lte: 30 } } }),
    ]);

    return NextResponse.json({
      report: 'SUMMARY',
      summaryCards: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalBills,
        paidBills,
        pendingBills,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalOrders,
        completedOrders,
        lowStockCount,
      },
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate operational report' }, { status: 500 });
  }
}
