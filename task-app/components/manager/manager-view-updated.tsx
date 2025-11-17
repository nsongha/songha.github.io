'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { ProjectWizard } from './project-wizard';
import { mockProjects, mockUsers } from '@/lib/utils/mock-data';
import { Task } from '@/lib/types';

export const ManagerViewUpdated: React.FC = () => {
  const { tasks, assignTask, requestUpdate } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [showWizard, setShowWizard] = useState(false);
  const [showPendingTasks, setShowPendingTasks] = useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId);
  const members = mockUsers.filter((u) => u.role === 'member');

  const handleAssignTask = (taskId: string, userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      assignTask(taskId, userId, user.name);
    }
  };

  const handleRequestUpdate = (taskId: string) => {
    requestUpdate(taskId);
    const task = tasks.find((t) => t.id === taskId);
    alert(`Update request sent to ${task?.assigneeName} for task: ${task?.title}`);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mockProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {pendingTasks.length > 0 && (
            <Button
              size="sm"
              variant={showPendingTasks ? 'primary' : 'secondary'}
              onClick={() => setShowPendingTasks(!showPendingTasks)}
            >
              📋 Pending Tasks ({pendingTasks.length})
            </Button>
          )}
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowWizard(true)}
        >
          <span className="mr-2">✨</span>
          New Project with AI
        </Button>
      </div>

      {showPendingTasks ? (
        /* Pending Tasks View */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pending Tasks (Unassigned)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Task</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Project</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Assign To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="max-w-md">
                          <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                            {task.title}
                            {task.aiGenerated && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                🤖 AI
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-xs text-gray-500 truncate">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-600">{task.projectId}</span>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select member...</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Project Tasks View */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{selectedProject?.name}</CardTitle>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-3 py-3 border-y border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-gray-600">
                  {projectTasks.filter((t) => t.status === 'pending').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-blue-600">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {projectTasks.filter((t) => t.status === 'in_progress').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-600">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {projectTasks.filter((t) => t.status === 'done').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-red-600">Blocked</div>
                <div className="text-2xl font-bold text-red-600">
                  {projectTasks.filter((t) => t.status === 'blocked').length}
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Task</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">PIC</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Due Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projectTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

                    return (
                      <tr
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">
                          <div className="max-w-xs flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate text-sm">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-gray-500 truncate">{task.description}</div>
                              )}
                            </div>
                            {task.aiGenerated && (
                              <span className="text-purple-600 text-xs flex-shrink-0">🤖</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {task.assigneeName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {task.assigneeName.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-700">{task.assigneeName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'pending'
                                ? 'bg-gray-100 text-gray-600'
                                : task.status === 'todo'
                                ? 'bg-gray-100 text-gray-800'
                                : task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : task.status === 'done'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {task.status === 'pending' ? 'Pending' : task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {task.dueDate ? (
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                              {isOverdue && '⚠️ '}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {task.assigneeId && task.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestUpdate(task.id);
                              }}
                              className="text-xs"
                            >
                              📩
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Wizard Modal */}
      {showWizard && (
        <ProjectWizard
          onClose={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            setShowPendingTasks(true);
          }}
        />
      )}

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
