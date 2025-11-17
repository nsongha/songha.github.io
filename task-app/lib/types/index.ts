// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  createdAt: Date;
}

// Task types
export type TaskStatus = 'pending' | 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'manager' | 'member';
  content: string;
  link?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // Optional - unassigned tasks are pending
  assigneeName?: string;
  projectId: string;
  dueDate?: Date;
  blockerReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  comments?: TaskComment[];
  updateRequested?: boolean; // Admin requested update
  aiGenerated?: boolean; // Task was AI-suggested
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard metrics types
export interface DashboardMetrics {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  taskCount: number;
  completedCount: number;
}

// Report types
export interface DailyReport {
  date: Date;
  completedYesterday: Task[];
  inProgressToday: Task[];
  blockers: Task[];
  user: User;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalCompleted: number;
  totalPlanned: number;
  completionRate: number;
  blockers: Task[];
  velocity: number;
}

// AI Analysis types
export interface AIProjectAnalysis {
  projectId: string;
  summary: string;
  healthScore: number; // 0-100
  onTrack: boolean;
  risks: string[];
  missingSteps: string[];
  overloadedMembers: {
    userId: string;
    userName: string;
    taskCount: number;
    reason: string;
  }[];
  recommendations: string[];
  generatedAt: Date;
}

export interface AISuggestedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedDays?: number;
  dependencies?: string[];
}
