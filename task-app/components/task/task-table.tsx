'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  showProject?: boolean;
  compact?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onTaskClick,
  showProject = true,
  compact = false,
}) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Task</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">PIC</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Priority</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Due Date</th>
            {showProject && (
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Project</th>
            )}
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={`hover:bg-gray-50 transition-colors ${
                  onTaskClick ? 'cursor-pointer' : ''
                } ${compact ? 'text-sm' : ''}`}
              >
                {/* Task */}
                <td className="px-3 py-2">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>

                {/* PIC */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      {task.assigneeName.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700 truncate max-w-[120px]">
                      {task.assigneeName}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  <Badge variant="status" status={task.status} className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>

                {/* Priority */}
                <td className="px-3 py-2">
                  <Badge variant="priority" priority={task.priority} className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>

                {/* Due Date */}
                <td className="px-3 py-2">
                  {task.dueDate ? (
                    <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                      {isOverdue && '⚠️ '}
                      {format(new Date(task.dueDate), 'MMM dd')}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                {/* Project */}
                {showProject && (
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-600">{task.projectId}</span>
                  </td>
                )}

                {/* Notes */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {task.status === 'blocked' && (
                      <span className="text-xs text-red-600" title={task.blockerReason}>
                        🚫 Blocked
                      </span>
                    )}
                    {task.comments && task.comments.length > 0 && (
                      <span className="text-xs text-gray-500">
                        💬 {task.comments.length}
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
