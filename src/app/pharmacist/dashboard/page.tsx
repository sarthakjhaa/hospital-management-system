import DashboardShell from '@/components/layout/DashboardShell';
import PharmacistDashboardPage from '@/app/dashboard/pharmacist/page';

export default function PharmacistPage() {
  return (
    <DashboardShell>
      <PharmacistDashboardPage />
    </DashboardShell>
  );
}
