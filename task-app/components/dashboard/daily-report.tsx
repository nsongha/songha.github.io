'use client';

import React from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskCard } from '@/components/task/task-card';
import { format, subDays } from 'date-fns';

export const DailyReport: React.FC = () => {
  const { tasks } = useTaskStore();

  // Get yesterday's date
  const yesterday = subDays(new Date(), 1);
  const today = new Date();

  // Completed yesterday (tasks completed in the last 24 hours)
  const completedYesterday = tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= yesterday && completedDate < today;
  });

  // In progress today
  const inProgressToday = tasks.filter((task) => task.status === 'in_progress');

  // Blockers
  const blockers = tasks.filter((task) => task.status === 'blocked');

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Daily Standup Report</h2>
        <p className="text-blue-100">{format(today, 'EEEE, MMMM dd, yyyy')}</p>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed Yesterday */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <span className="text-xl">✅</span>
              Completed Yesterday
              <span className="ml-auto text-sm bg-green-200 px-2 py-1 rounded-full">
                {completedYesterday.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedYesterday.length === 0 ? (
              <p className="text-sm text-green-700 text-center py-4">
                No tasks completed yesterday
              </p>
            ) : (
              <div className="space-y-2">
                {completedYesterday.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Today */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <span className="text-xl">🔄</span>
              In Progress Today
              <span className="ml-auto text-sm bg-blue-200 px-2 py-1 rounded-full">
                {inProgressToday.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressToday.length === 0 ? (
              <p className="text-sm text-blue-700 text-center py-4">No tasks in progress</p>
            ) : (
              <div className="space-y-2">
                {inProgressToday.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockers */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <span className="text-xl">🚫</span>
              Blockers
              <span className="ml-auto text-sm bg-red-200 px-2 py-1 rounded-full">
                {blockers.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockers.length === 0 ? (
              <p className="text-sm text-green-700 text-center py-4">
                🎉 No blockers! Great job!
              </p>
            ) : (
              <div className="space-y-2">
                {blockers.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ul className="space-y-2">
              <li>
                <strong>{completedYesterday.length}</strong> tasks completed yesterday
              </li>
              <li>
                <strong>{inProgressToday.length}</strong> tasks currently in progress
              </li>
              <li>
                <strong>{blockers.length}</strong> task{blockers.length !== 1 ? 's' : ''} blocked
                {blockers.length > 0 && ' - requires immediate attention'}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
