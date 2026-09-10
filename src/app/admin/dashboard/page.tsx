import DashboardShell from '@/components/layout/DashboardShell';
import AdminDashboardPage from '@/app/dashboard/admin/page';

export default function AdminPage() {
  return (
    <DashboardShell>
      <AdminDashboardPage />
    </DashboardShell>
  );
}
