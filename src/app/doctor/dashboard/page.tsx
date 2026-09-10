import DashboardShell from '@/components/layout/DashboardShell';
import DoctorDashboardPage from '@/app/dashboard/doctor/page';

export default function DoctorPage() {
  return (
    <DashboardShell>
      <DoctorDashboardPage />
    </DashboardShell>
  );
}
