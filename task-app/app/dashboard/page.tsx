'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { AdminProjectsOverview } from '@/components/dashboard/admin-projects-overview';
import { useUserStore } from '@/lib/stores/user-store';

export default function DashboardPage() {
  const { currentUser } = useUserStore();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentUser.role === 'admin'
              ? 'Overview of all projects and team performance'
              : 'Overview of all projects and tasks'}
          </p>
        </div>

        {currentUser.role === 'admin' ? <AdminProjectsOverview /> : <DashboardOverview />}
      </div>
    </MainLayout>
  );
}
