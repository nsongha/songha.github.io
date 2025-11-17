'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DonutChart } from './donut-chart';
import { AIAnalysisCard } from './ai-analysis-card';
import { TaskTable } from '@/components/task/task-table';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { mockProjects } from '@/lib/utils/mock-data';
import { getAIAnalysisForProject } from '@/lib/utils/ai-mock-data';
import { Task } from '@/lib/types';

export const AdminViewWithAI: React.FC = () => {
  const { tasks, requestUpdate } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

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
    { label: 'Pending', value: tasks.filter((t) => t.status === 'pending').length, color: '#9ca3af' },
    { label: 'Blocked', value: blockedTasks, color: '#ef4444' },
  ];

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.status === 'done').length,
      inProgress: projectTasks.filter((t) => t.status === 'in_progress').length,
      blocked: projectTasks.filter((t) => t.status === 'blocked').length,
      pending: projectTasks.filter((t) => t.status === 'pending').length,
    };
  };

  const handleRequestUpdate = (projectId: string) => {
    // Request update for all tasks in project
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    projectTasks.forEach((task) => {
      if (task.assigneeId) {
        requestUpdate(task.id);
      }
    });
    alert(`Update request sent to all members in project: ${mockProjects.find(p => p.id === projectId)?.name}`);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <div className="space-y-4">
      {/* Quick Glance */}
      <div className="grid grid-cols-4 gap-3">
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

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-center">
            <DonutChart data={chartData} size={110} />
          </CardContent>
        </Card>
      </div>

      {/* Projects with AI Analysis */}
      <div className="space-y-3">
        {mockProjects.map((project) => {
          const stats = getProjectStats(project.id);
          const aiAnalysis = getAIAnalysisForProject(project.id);
          const isExpanded = expandedProjectId === project.id;

          return (
            <Card key={project.id}>
              <CardContent className="p-4">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                    <p className="text-xs text-gray-500">{project.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRequestUpdate(project.id)}
                    >
                      📩 Request Update
                    </Button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-center p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                  </button>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-center p-2 rounded hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-xs text-blue-600">In Progress</div>
                    <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
                  </button>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-center p-2 rounded hover:bg-green-100 transition-colors"
                  >
                    <div className="text-xs text-green-600">Completed</div>
                    <div className="text-xl font-bold text-green-600">{stats.completed}</div>
                  </button>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-center p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-xs text-gray-600">Pending</div>
                    <div className="text-xl font-bold text-gray-600">{stats.pending}</div>
                  </button>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-center p-2 rounded hover:bg-red-100 transition-colors"
                  >
                    <div className="text-xs text-red-600">Blocked</div>
                    <div className="text-xl font-bold text-red-600">{stats.blocked}</div>
                  </button>
                </div>

                {/* AI Analysis */}
                {isExpanded && aiAnalysis && (
                  <div className="mt-3">
                    <AIAnalysisCard
                      analysis={aiAnalysis}
                      onRequestUpdate={() => handleRequestUpdate(project.id)}
                    />
                  </div>
                )}

                {/* Task Details */}
                {isExpanded && selectedProjectId === project.id && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Project Tasks</h4>
                    <TaskTable
                      tasks={tasks.filter((t) => t.projectId === project.id)}
                      onTaskClick={handleTaskClick}
                      showProject={false}
                      compact
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
