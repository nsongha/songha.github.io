'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card onClick={onClick} className="mb-3 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {/* Title */}
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
        )}

        {/* Blocker reason */}
        {task.status === 'blocked' && task.blockerReason && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800">
              <span className="font-semibold">⚠️ Blocked:</span> {task.blockerReason}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="priority" priority={task.priority}>
            {task.priority}
          </Badge>

          {task.dueDate && (
            <span
              className={`text-xs ${
                isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {isOverdue && '⚠️ '}
              Due: {format(new Date(task.dueDate), 'MMM dd')}
            </span>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
            {task.assigneeName.charAt(0)}
          </div>
          <span className="text-xs text-gray-600">{task.assigneeName}</span>
        </div>
      </div>
    </Card>
  );
};
