import { Task, Project, User, TaskStatus, TaskPriority, TaskComment } from '@/lib/types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    email: 'manager@company.com',
    name: 'Manager User',
    role: 'manager',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '3',
    email: 'john@company.com',
    name: 'John Doe',
    role: 'member',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '4',
    email: 'jane@company.com',
    name: 'Jane Smith',
    role: 'member',
    createdAt: new Date('2025-01-01'),
  },
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Redesign company website',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Build mobile app for iOS and Android',
    status: 'active',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-20'),
  },
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockup for new homepage',
    status: 'done',
    priority: 'high',
    assigneeId: '3',
    assigneeName: 'John Doe',
    projectId: 'proj-1',
    dueDate: new Date('2025-01-10'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-10'),
    completedAt: new Date('2025-01-10'),
  },
  {
    id: 'task-2',
    title: 'Implement responsive navigation',
    description: 'Build mobile-responsive navigation component',
    status: 'in_progress',
    priority: 'high',
    assigneeId: '3',
    assigneeName: 'John Doe',
    projectId: 'proj-1',
    dueDate: new Date('2025-01-25'),
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-20'),
    comments: [
      {
        id: 'comment-1',
        taskId: 'task-2',
        userId: '2',
        userName: 'Manager User',
        userRole: 'manager',
        content: 'Great progress! Make sure to test on mobile devices before wrapping up.',
        createdAt: new Date('2025-01-20T10:30:00'),
      },
    ],
  },
  {
    id: 'task-3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated deployment',
    status: 'blocked',
    priority: 'medium',
    assigneeId: '4',
    assigneeName: 'Jane Smith',
    projectId: 'proj-1',
    dueDate: new Date('2025-01-22'),
    blockerReason: 'Waiting for DevOps team to provision server',
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-18'),
    comments: [
      {
        id: 'comment-2',
        taskId: 'task-3',
        userId: '2',
        userName: 'Manager User',
        userRole: 'manager',
        content: 'I\'ve escalated this to the DevOps lead. Should get resources by tomorrow.',
        link: 'https://devops.slack.com/archives/C01234567',
        createdAt: new Date('2025-01-18T14:15:00'),
      },
    ],
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description: 'Document all API endpoints',
    status: 'todo',
    priority: 'medium',
    assigneeId: '3',
    assigneeName: 'John Doe',
    projectId: 'proj-2',
    dueDate: new Date('2025-01-30'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'task-5',
    title: 'Design app icon',
    description: 'Create app icons for iOS and Android',
    status: 'in_progress',
    priority: 'low',
    assigneeId: '4',
    assigneeName: 'Jane Smith',
    projectId: 'proj-2',
    dueDate: new Date('2025-01-28'),
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-21'),
    comments: [
      {
        id: 'comment-3',
        taskId: 'task-5',
        userId: '2',
        userName: 'Manager User',
        userRole: 'manager',
        content: 'Looking good! Please follow the brand guidelines from the design system.',
        link: 'https://figma.com/design-system',
        createdAt: new Date('2025-01-21T09:00:00'),
      },
    ],
  },
  {
    id: 'task-6',
    title: 'Fix authentication bug',
    description: 'Users unable to login with SSO',
    status: 'todo',
    priority: 'high',
    assigneeId: '3',
    assigneeName: 'John Doe',
    projectId: 'proj-2',
    dueDate: new Date('2025-01-20'),
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-18'),
  },
  {
    id: 'task-7',
    title: 'Update dependencies',
    description: 'Update all npm packages to latest versions',
    status: 'done',
    priority: 'low',
    assigneeId: '4',
    assigneeName: 'Jane Smith',
    projectId: 'proj-1',
    dueDate: new Date('2025-01-15'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-14'),
    completedAt: new Date('2025-01-14'),
  },
  {
    id: 'task-8',
    title: 'Performance optimization',
    description: 'Optimize page load time',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: '3',
    assigneeName: 'John Doe',
    projectId: 'proj-1',
    dueDate: new Date('2025-01-27'),
    createdAt: new Date('2025-01-17'),
    updatedAt: new Date('2025-01-22'),
    updateRequested: true, // Admin requested update
  },
  // Pending tasks (unassigned)
  {
    id: 'task-9',
    title: 'Security audit',
    description: 'Perform comprehensive security review of new website code and infrastructure',
    status: 'pending',
    priority: 'high',
    projectId: 'proj-1',
    createdAt: new Date('2025-01-22'),
    updatedAt: new Date('2025-01-22'),
    aiGenerated: true,
  },
  {
    id: 'task-10',
    title: 'Cross-browser testing',
    description: 'Test website across Chrome, Firefox, Safari, and Edge',
    status: 'pending',
    priority: 'medium',
    projectId: 'proj-1',
    createdAt: new Date('2025-01-22'),
    updatedAt: new Date('2025-01-22'),
    aiGenerated: true,
  },
  {
    id: 'task-11',
    title: 'SEO optimization',
    description: 'Review meta tags, structured data, sitemap, and page speed optimizations',
    status: 'pending',
    priority: 'medium',
    projectId: 'proj-1',
    createdAt: new Date('2025-01-22'),
    updatedAt: new Date('2025-01-22'),
    aiGenerated: true,
  },
  {
    id: 'task-12',
    title: 'User authentication flow design',
    description: 'Create wireframes and user flows for login, signup, password reset',
    status: 'pending',
    priority: 'high',
    projectId: 'proj-2',
    createdAt: new Date('2025-01-23'),
    updatedAt: new Date('2025-01-23'),
    aiGenerated: true,
  },
];

// Helper function to get current user (for demo)
export const getCurrentUser = (): User => mockUsers[0];

// Helper to get tasks by status
export const getTasksByStatus = (status: TaskStatus): Task[] => {
  return mockTasks.filter(task => task.status === status);
};

// Helper to get overdue tasks
export const getOverdueTasks = (): Task[] => {
  const now = new Date();
  return mockTasks.filter(task =>
    task.status !== 'done' &&
    task.dueDate &&
    new Date(task.dueDate) < now
  );
};
