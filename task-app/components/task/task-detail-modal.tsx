'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';
import { useUserStore } from '@/lib/stores/user-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const { tasks, addComment } = useTaskStore();
  const { currentUser } = useUserStore();
  const task = tasks.find((t) => t.id === taskId);

  const [commentText, setCommentText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!task) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment(taskId, {
      taskId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: commentText,
      link: linkUrl || undefined,
      imageUrl: imageUrl || undefined,
    });

    setCommentText('');
    setLinkUrl('');
    setImageUrl('');
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="status" status={task.status}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge variant="priority" priority={task.priority}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {isOverdue && '⚠️ '}
                    Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}

          {/* Blocker */}
          {task.status === 'blocked' && task.blockerReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Blocker</h3>
              <p className="text-red-800">{task.blockerReason}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Assignee:</span>
              <span className="ml-2 font-medium">{task.assigneeName}</span>
            </div>
            <div>
              <span className="text-gray-500">Project:</span>
              <span className="ml-2 font-medium">{task.projectId}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>
              <span className="ml-2">{format(new Date(task.updatedAt), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Comments ({task.comments?.length || 0})
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.userName}</span>
                          <Badge className="text-xs">
                            {comment.userRole}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

                        {comment.link && (
                          <a
                            href={comment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            🔗 {comment.link}
                          </a>
                        )}

                        {comment.imageUrl && (
                          <img
                            src={comment.imageUrl}
                            alt="Attachment"
                            className="mt-2 rounded-lg max-w-sm border border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="font-medium text-gray-900 mb-3">Add Comment</h4>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={3}
              />

              <div className="space-y-2 mb-3">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Add link (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Add image URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
