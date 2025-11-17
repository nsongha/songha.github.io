'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { MemberTasksUpdated } from '@/components/task/member-tasks-updated';

export default function MyTasksPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 text-sm mt-0.5">View and manage your assigned tasks</p>
        </div>
        <MemberTasksUpdated />
      </div>
    </MainLayout>
  );
}
