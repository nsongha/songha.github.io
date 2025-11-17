import { MainLayout } from '@/components/layout/main-layout';
import { MyTasksView } from '@/components/task/my-tasks-view';

export default function MyTasksPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">View and manage your assigned tasks</p>
        </div>
        <MyTasksView />
      </div>
    </MainLayout>
  );
}
