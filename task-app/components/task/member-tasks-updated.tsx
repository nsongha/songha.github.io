'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { useUserStore } from '@/lib/stores/user-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskDetailModal } from './task-detail-modal';
import { Task, TaskStatus } from '@/lib/types';
import { format, isToday, isBefore, startOfDay } from 'date-fns';

export const MemberTasksUpdated: React.FC = () => {
  const { tasks, updateTaskStatus } = useTaskStore();
  const { currentUser } = useUserStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Get only ASSIGNED tasks for current user (not pending)
  const myTasks = tasks.filter(
    (task) => task.assigneeId === currentUser.id && task.status !== 'pending'
  );

  // Categorize tasks
  const todayTasks = myTasks.filter(
    (task) =>
      task.status === 'in_progress' // In progress = today's work
  );

  const todoTasks = myTasks.filter(
    (task) => task.status === 'todo'
  );

  const completedTasks = myTasks.filter((task) => task.status === 'done');

  const blockedTasks = myTasks.filter((task) => task.status === 'blocked');

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const renderTasksTable = (tasksList: Task[], section: string) => {
    if (tasksList.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 text-sm">
          No tasks in {section}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Task</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Priority</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Due Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Project</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasksList.map((task) => {
              const isOverdue =
                task.dueDate &&
                isBefore(startOfDay(new Date(task.dueDate)), startOfDay(new Date())) &&
                task.status !== 'done';

              return (
                <tr
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="hover:bg-gray-50 cursor-pointer text-sm relative"
                >
                  <td className="px-3 py-2">
                    <div className="max-w-sm flex items-center gap-2">
                      {/* Red Dot Notification */}
                      {task.updateRequested && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" title="Update requested"></span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, e.target.value as TaskStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${
                        task.status === 'todo'
                          ? 'bg-gray-100 text-gray-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
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
                      <span
                        className={`text-sm ${
                          isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {isOverdue && '⚠️ '}
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-600">{task.projectId}</span>
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
                      {task.aiGenerated && (
                        <span className="text-xs text-purple-600" title="AI Generated">
                          🤖
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-xs text-blue-900 mb-1">Today (In Progress)</div>
            <div className="text-3xl font-bold text-blue-900">{todayTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-900 mb-1">To Do</div>
            <div className="text-3xl font-bold text-gray-900">{todoTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-xs text-green-900 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-900">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-xs text-red-900 mb-1">Blocked</div>
            <div className="text-3xl font-bold text-red-900">{blockedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today Section (In Progress) */}
      {todayTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔥</span> Today (In Progress)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {renderTasksTable(todayTasks, 'today')}
          </CardContent>
        </Card>
      )}

      {/* To Do Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📝</span> To Do
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderTasksTable(todoTasks, 'to do')}
        </CardContent>
      </Card>

      {/* Blocked Section */}
      {blockedTasks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3 bg-red-50">
            <CardTitle className="text-lg flex items-center gap-2 text-red-900">
              <span>🚫</span> Blocked
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {renderTasksTable(blockedTasks, 'blocked')}
          </CardContent>
        </Card>
      )}

      {/* Completed Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>✅</span> Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderTasksTable(completedTasks, 'completed')}
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
