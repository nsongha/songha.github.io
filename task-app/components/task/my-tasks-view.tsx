'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { useUserStore } from '@/lib/stores/user-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskDetailModal } from './task-detail-modal';
import { TaskStatus } from '@/lib/types';
import { format } from 'date-fns';

export const MyTasksView: React.FC = () => {
  const { tasks, updateTaskStatus } = useTaskStore();
  const { currentUser } = useUserStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Get only tasks assigned to current user
  const myTasks = tasks.filter((task) => task.assigneeId === currentUser.id);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return myTasks.filter((task) => task.status === status);
  };

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.map((status) => {
          const count = getTasksByStatus(status.value).length;
          return (
            <Card key={status.value} className={status.color}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">{status.label}</p>
                  <p className="text-3xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task List by Status */}
      <div className="space-y-6">
        {statusOptions.map((statusOption) => {
          const statusTasks = getTasksByStatus(statusOption.value);

          if (statusTasks.length === 0) return null;

          return (
            <Card key={statusOption.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {statusOption.label}
                  <Badge variant="status" status={statusOption.value}>
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

                    return (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{task.title}</h4>
                              <Badge variant="priority" priority={task.priority}>
                                {task.priority}
                              </Badge>
                            </div>

                            {task.description && (
                              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            )}

                            {task.status === 'blocked' && task.blockerReason && (
                              <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                                <p className="text-sm text-red-800">
                                  <span className="font-semibold">⚠️ Blocked:</span> {task.blockerReason}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {task.dueDate && (
                                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                  {isOverdue && '⚠️ '}
                                  Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                </span>
                              )}
                              <span>Project: {task.projectId}</span>
                            </div>
                          </div>

                          {/* Status Selector */}
                          <div className="ml-4">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            💬 View Comments
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            📎 Add Link/Image
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {myTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No tasks assigned to you</p>
          </CardContent>
        </Card>
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
