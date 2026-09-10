import DashboardShell from '@/components/layout/DashboardShell';
import PatientDashboardPage from '@/app/dashboard/patient/page';

export default function PatientPage() {
  return (
    <DashboardShell>
      <PatientDashboardPage />
    </DashboardShell>
  );
}
