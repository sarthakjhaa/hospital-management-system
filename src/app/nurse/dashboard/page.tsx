import DashboardShell from '@/components/layout/DashboardShell';
import NurseDashboardPage from '@/app/dashboard/nurse/page';

export default function NursePage() {
  return (
    <DashboardShell>
      <NurseDashboardPage />
    </DashboardShell>
  );
}
