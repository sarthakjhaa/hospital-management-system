import { Role } from '@prisma/client';

export const ROLE_DASHBOARDS: Record<Role, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  PATIENT: '/patient/dashboard',
};

export function getSafeUserDashboard(role: Role): string {
  return ROLE_DASHBOARDS[role] || '/patient/dashboard';
}

export function canAccessDashboard(role: Role, path: string): boolean {
  if ((path.startsWith('/admin/dashboard') || path.startsWith('/dashboard/admin')) && role !== Role.ADMIN) return false;
  if ((path.startsWith('/doctor/dashboard') || path.startsWith('/dashboard/doctor')) && role !== Role.DOCTOR && role !== Role.ADMIN) return false;
  if ((path.startsWith('/nurse/dashboard') || path.startsWith('/dashboard/nurse')) && role !== Role.NURSE && role !== Role.ADMIN) return false;
  if ((path.startsWith('/receptionist/dashboard') || path.startsWith('/dashboard/receptionist')) && role !== Role.RECEPTIONIST && role !== Role.ADMIN) return false;
  if ((path.startsWith('/pharmacist/dashboard') || path.startsWith('/dashboard/pharmacist')) && role !== Role.PHARMACIST && role !== Role.ADMIN) return false;
  if (
    (path.startsWith('/patient/dashboard') || path.startsWith('/dashboard/patient')) &&
    role !== Role.PATIENT &&
    role !== Role.ADMIN &&
    role !== Role.RECEPTIONIST
  )
    return false;

  return true;
}
