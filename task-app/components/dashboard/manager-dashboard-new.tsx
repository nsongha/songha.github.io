'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskTable } from '@/components/task/task-table';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { mockProjects, mockUsers } from '@/lib/utils/mock-data';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

export const ManagerDashboardNew: React.FC = () => {
  const { tasks, addTask } = useTaskStore();
  const [selectedView, setSelectedView] = useState<'tasks' | 'project-detail'>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueDate: '',
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assigneeId) {
      alert('Please fill in required fields');
      return;
    }

    const assignee = mockUsers.find((u) => u.id === newTask.assigneeId);

    addTask({
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      assigneeId: newTask.assigneeId,
      assigneeName: assignee?.name || 'Unknown',
      projectId: selectedProjectId,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
    });
    setShowAddTask(false);
  };

  const handleRequestUpdate = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      alert(`Update request sent to ${task.assigneeName} for task: ${task.title}`);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'tasks' ? 'primary' : 'ghost'}
            onClick={() => setSelectedView('tasks')}
          >
            📋 Tasks & Projects
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'project-detail' ? 'primary' : 'ghost'}
            onClick={() => setSelectedView('project-detail')}
          >
            📊 Project Details
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAddProject(true)}
          >
            + Add Project
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddTask(true)}
          >
            + Add Task
          </Button>
        </div>
      </div>

      {selectedView === 'tasks' ? (
        /* Tasks View */
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Projects & Tasks</CardTitle>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mockProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 py-3 border-y border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
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

            {/* Tasks Table with Request Update */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Task</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">PIC</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Due Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Notes</th>
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
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate text-sm">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-gray-500 truncate">{task.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {task.assigneeName.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">{task.assigneeName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
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
                          <div className="flex items-center gap-2">
                            {task.status === 'blocked' && (
                              <span className="text-xs text-red-600" title={task.blockerReason}>
                                🚫
                              </span>
                            )}
                            {task.comments && task.comments.length > 0 && (
                              <span className="text-xs text-gray-500">
                                💬 {task.comments.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Project Details View */
        <Card>
          <CardHeader>
            <CardTitle>{selectedProject?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <p className="text-sm text-gray-600 mt-1">{selectedProject?.description}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <p className="text-sm text-gray-600 mt-1 capitalize">{selectedProject?.status}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Created</label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedProject?.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedProject?.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Total Tasks</div>
                  <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-900">In Progress</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {projectTasks.filter((t) => t.status === 'in_progress').length}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-900">Completed</div>
                  <div className="text-2xl font-bold text-green-900">
                    {projectTasks.filter((t) => t.status === 'done').length}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-xs text-red-900">Blocked</div>
                  <div className="text-2xl font-bold text-red-900">
                    {projectTasks.filter((t) => t.status === 'blocked').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(projectTasks.map((t) => t.assigneeId))).map((assigneeId) => {
                  const user = mockUsers.find((u) => u.id === assigneeId);
                  const userTasks = projectTasks.filter((t) => t.assigneeId === assigneeId);
                  return (
                    <div key={assigneeId} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-gray-600 ml-2">({userTasks.length} tasks)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                  rows={3}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Assign to *</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                  >
                    <option value="">Select...</option>
                    {mockUsers.filter((u) => u.role === 'member').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowAddTask(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddTask} className="flex-1">
                Add Task
              </Button>
            </div>
          </div>
        </div>
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
