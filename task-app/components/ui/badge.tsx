import React from 'react';
import { TaskStatus, TaskPriority } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'priority';
  status?: TaskStatus;
  priority?: TaskPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const getStatusStyles = (status?: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStyles = (priority?: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  let styles = baseStyles;
  if (variant === 'status' && status) {
    styles += ` ${getStatusStyles(status)}`;
  } else if (variant === 'priority' && priority) {
    styles += ` ${getPriorityStyles(priority)}`;
  } else {
    styles += ' bg-gray-100 text-gray-800';
  }

  return <span className={`${styles} ${className}`}>{children}</span>;
};
