'use client';

import React from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProjects } from '@/lib/utils/mock-data';
import { format } from 'date-fns';

export const AdminProjectsOverview: React.FC = () => {
  const { tasks } = useTaskStore();

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
    const blocked = projectTasks.filter((t) => t.status === 'blocked').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, blocked, completionRate };
  };

  const getLatestManagerComments = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const allComments = projectTasks
      .flatMap((task) =>
        (task.comments || []).map((comment) => ({
          ...comment,
          taskTitle: task.title,
        }))
      )
      .filter((comment) => comment.userRole === 'manager')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allComments.slice(0, 3); // Get latest 3
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-blue-100">Overview of all projects and team performance</p>
        </CardContent>
      </Card>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-blue-900">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-900 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-yellow-900">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-900 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-900">
              {tasks.filter((t) => t.status === 'done').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-900 mb-1">Blocked</p>
            <p className="text-3xl font-bold text-red-900">
              {tasks.filter((t) => t.status === 'blocked').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Projects</h3>

        {mockProjects.map((project) => {
          const stats = getProjectStats(project.id);
          const managerComments = getLatestManagerComments(project.id);

          return (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-gray-600">{project.description}</p>
                    )}
                  </div>
                  <Badge
                    className={
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Project Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Blocked</p>
                    <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Progress</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Latest Manager Comments */}
                {managerComments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>💬</span>
                      Latest Manager Comments
                    </h4>
                    <div className="space-y-3">
                      {managerComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {comment.userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  on {comment.taskTitle}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {format(new Date(comment.createdAt), 'MMM dd')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              {comment.link && (
                                <a
                                  href={comment.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                >
                                  🔗 View link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {managerComments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No manager comments yet
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
