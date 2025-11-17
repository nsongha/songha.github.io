import { MainLayout } from '@/components/layout/main-layout';
import { KanbanBoard } from '@/components/task/kanban-board';

export default function TasksPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage tasks with drag-and-drop</p>
          </div>
        </div>
        <KanbanBoard />
      </div>
    </MainLayout>
  );
}
