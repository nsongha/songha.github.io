'use client';

import React from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { MetricsCard } from './metrics-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskCard } from '@/components/task/task-card';
import { getOverdueTasks } from '@/lib/utils/mock-data';

export const DashboardOverview: React.FC = () => {
  const { tasks } = useTaskStore();

  // Calculate metrics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const overdueTasks = getOverdueTasks();
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Tasks"
          value={totalTasks}
          subtitle="All active tasks"
          bgColor="bg-blue-50"
          textColor="text-blue-900"
        />
        <MetricsCard
          title="In Progress"
          value={inProgressTasks}
          subtitle="Currently working on"
          bgColor="bg-yellow-50"
          textColor="text-yellow-900"
        />
        <MetricsCard
          title="Completed"
          value={completedTasks}
          subtitle={`${completionRate}% completion rate`}
          bgColor="bg-green-50"
          textColor="text-green-900"
        />
        <MetricsCard
          title="Blocked"
          value={blockedTasks}
          subtitle="Needs attention"
          bgColor="bg-red-50"
          textColor="text-red-900"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blocked Tasks Alert */}
        {blockedTasks > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Blocked Tasks ({blockedTasks})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === 'blocked')
                  .slice(0, 3)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                Overdue Tasks ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Chart (Simple visualization) */}
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bars */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">To Do</span>
                <span className="font-medium">{todoTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all"
                  style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium">{inProgressTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Blocked</span>
                <span className="font-medium">{blockedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(blockedTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
