'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DonutChart } from './donut-chart';
import { TaskTable } from '@/components/task/task-table';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { mockProjects } from '@/lib/utils/mock-data';
import { Task } from '@/lib/types';

export const AdminDashboardNew: React.FC = () => {
  const { tasks } = useTaskStore();
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks'>('overview');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'blocked'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Calculate metrics
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter((p) => p.status === 'active').length;

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const needsAttention = blockedTasks + tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  // Chart data
  const chartData = [
    { label: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, color: '#10b981' },
    { label: 'To Do', value: tasks.filter((t) => t.status === 'todo').length, color: '#6b7280' },
    { label: 'Blocked', value: blockedTasks, color: '#ef4444' },
  ];

  // Get filtered tasks
  const getFilteredTasks = () => {
    let filtered = tasks;

    if (selectedProjectId) {
      filtered = filtered.filter((t) => t.projectId === selectedProjectId);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    return filtered;
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
    const blocked = projectTasks.filter((t) => t.status === 'blocked').length;

    return { total, completed, inProgress, blocked };
  };

  const handleRequestUpdate = (projectId: string) => {
    alert(`Update request sent to manager of project: ${projectId}`);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <div className="space-y-4">
      {/* Quick Glance - Compact */}
      <div className="grid grid-cols-4 gap-3">
        {/* Metrics Cards */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-xs text-gray-600 mb-1">Total Projects</div>
            <div className="text-3xl font-bold text-gray-900">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="text-xs text-blue-900 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-blue-900">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="text-xs text-red-900 mb-1">Need Attention</div>
            <div className="text-3xl font-bold text-red-900">{needsAttention}</div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-center">
            <DonutChart data={chartData} size={120} />
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Projects Overview</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedView === 'overview' ? 'primary' : 'ghost'}
                onClick={() => setSelectedView('overview')}
              >
                Overview
              </Button>
              <Button
                size="sm"
                variant={selectedView === 'tasks' ? 'primary' : 'ghost'}
                onClick={() => setSelectedView('tasks')}
              >
                Tasks
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {selectedView === 'overview' ? (
            /* Projects Overview Table */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Project</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedView('tasks');
                          setFilterStatus('all');
                          setSelectedProjectId(null);
                        }}>
                      Total
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          setSelectedView('tasks');
                          setFilterStatus('in_progress');
                        }}>
                      In Progress
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-green-700 cursor-pointer hover:bg-green-50">
                      Completed
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-red-700 cursor-pointer hover:bg-red-50"
                        onClick={() => {
                          setSelectedView('tasks');
                          setFilterStatus('blocked');
                        }}>
                      Blocked
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockProjects.map((project) => {
                    const stats = getProjectStats(project.id);

                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.description}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedView('tasks');
                              setSelectedProjectId(project.id);
                              setFilterStatus('all');
                            }}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {stats.total}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedView('tasks');
                              setSelectedProjectId(project.id);
                              setFilterStatus('in_progress');
                            }}
                            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {stats.inProgress}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold text-green-600">{stats.completed}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedView('tasks');
                              setSelectedProjectId(project.id);
                              setFilterStatus('blocked');
                            }}
                            className="font-semibold text-red-600 hover:text-red-800 transition-colors"
                          >
                            {stats.blocked}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRequestUpdate(project.id)}
                            className="text-xs"
                          >
                            📩 Request Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Tasks Table View */
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">Filter:</span>
                <Button
                  size="sm"
                  variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'in_progress' ? 'primary' : 'ghost'}
                  onClick={() => setFilterStatus('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'blocked' ? 'primary' : 'ghost'}
                  onClick={() => setFilterStatus('blocked')}
                >
                  Blocked
                </Button>
                {selectedProjectId && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-700">
                      Project: <strong>{selectedProjectId}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProjectId(null)}
                    >
                      ✕ Clear
                    </Button>
                  </>
                )}
              </div>

              <TaskTable
                tasks={getFilteredTasks()}
                onTaskClick={handleTaskClick}
                showProject={!selectedProjectId}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};
