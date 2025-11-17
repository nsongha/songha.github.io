'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { TaskCard } from './task-card';
import { TaskStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const columns: { status: TaskStatus; title: string; bgColor: string }[] = [
  { status: 'todo', title: 'To Do', bgColor: 'bg-gray-50' },
  { status: 'in_progress', title: 'In Progress', bgColor: 'bg-blue-50' },
  { status: 'done', title: 'Done', bgColor: 'bg-green-50' },
  { status: 'blocked', title: 'Blocked', bgColor: 'bg-red-50' },
];

export const KanbanBoard: React.FC = () => {
  const { tasks, updateTaskStatus } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);

        return (
          <div
            key={column.status}
            className={`${column.bgColor} rounded-lg p-4 min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <Badge variant="status" status={column.status}>
                {columnTasks.length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No tasks</p>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="cursor-move"
                  >
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
