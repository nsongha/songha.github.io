'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { AdminDashboardNew } from '@/components/dashboard/admin-dashboard-new';
import { ManagerDashboardNew } from '@/components/dashboard/manager-dashboard-new';
import { useUserStore } from '@/lib/stores/user-store';

export default function DashboardPage() {
  const { currentUser } = useUserStore();

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {currentUser.role === 'admin'
              ? 'Overview of all projects and team performance'
              : 'Manage projects and tasks'}
          </p>
        </div>

        {currentUser.role === 'admin' ? <AdminDashboardNew /> : <ManagerDashboardNew />}
      </div>
    </MainLayout>
  );
}
