import { AIProjectAnalysis, AISuggestedTask, TaskPriority } from '@/lib/types';

// Mock AI analyses for projects
export const mockAIAnalyses: AIProjectAnalysis[] = [
  {
    projectId: 'proj-1',
    summary: 'Website Redesign project is progressing well with 62% completion. The team is slightly behind schedule due to CI/CD pipeline blocker. Jane Smith is handling multiple critical tasks.',
    healthScore: 75,
    onTrack: true,
    risks: [
      'CI/CD pipeline blocked - waiting for DevOps resources',
      'Performance optimization task may extend timeline',
    ],
    missingSteps: [
      'Security audit not yet scheduled',
      'Cross-browser testing plan needed',
      'SEO optimization tasks missing',
    ],
    overloadedMembers: [
      {
        userId: '4',
        userName: 'Jane Smith',
        taskCount: 3,
        reason: 'Handling blocked CI/CD task plus ongoing app icon design',
      },
    ],
    recommendations: [
      'Escalate CI/CD blocker to unblock Jane Smith',
      'Add security audit task before deployment',
      'Consider assigning cross-browser testing to another team member',
      'Schedule SEO review meeting with marketing team',
    ],
    generatedAt: new Date(),
  },
  {
    projectId: 'proj-2',
    summary: 'Mobile App Development is in early stages with good momentum. Team has clear priorities but needs more task breakdown for implementation phase.',
    healthScore: 68,
    onTrack: true,
    risks: [
      'API documentation delayed - may impact development',
      'App icon design is low priority but needed for App Store submission',
    ],
    missingSteps: [
      'Backend API development tasks not defined',
      'User authentication flow tasks missing',
      'App Store submission checklist needed',
      'Beta testing plan not created',
    ],
    overloadedMembers: [],
    recommendations: [
      'Break down API documentation into smaller tasks',
      'Add backend development tasks for authentication',
      'Create App Store submission timeline',
      'Schedule beta testing with target users',
      'Consider upgrading app icon design priority for timely submission',
    ],
    generatedAt: new Date(),
  },
];

// AI Task Suggestions based on project context
export const generateAISuggestedTasks = (projectId: string, projectName: string): AISuggestedTask[] => {
  const suggestions: Record<string, AISuggestedTask[]> = {
    'proj-1': [
      {
        title: 'Conduct security audit',
        description: 'Perform comprehensive security review of new website code and infrastructure',
        priority: 'high',
        estimatedDays: 3,
      },
      {
        title: 'Create cross-browser testing plan',
        description: 'Define testing matrix for Chrome, Firefox, Safari, Edge across desktop and mobile',
        priority: 'medium',
        estimatedDays: 1,
      },
      {
        title: 'SEO optimization review',
        description: 'Review meta tags, structured data, sitemap, and page speed optimizations',
        priority: 'medium',
        estimatedDays: 2,
      },
      {
        title: 'Setup monitoring and analytics',
        description: 'Configure Google Analytics, error tracking, and performance monitoring',
        priority: 'low',
        estimatedDays: 1,
      },
    ],
    'proj-2': [
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and user flows for login, signup, password reset',
        priority: 'high',
        estimatedDays: 2,
      },
      {
        title: 'Implement backend API for authentication',
        description: 'Build REST API endpoints for user registration, login, token refresh',
        priority: 'high',
        estimatedDays: 5,
        dependencies: ['Design user authentication flow'],
      },
      {
        title: 'Setup push notifications infrastructure',
        description: 'Configure FCM for Android and APNs for iOS push notifications',
        priority: 'medium',
        estimatedDays: 3,
      },
      {
        title: 'Create beta testing checklist',
        description: 'Define TestFlight setup, beta tester recruitment, and feedback collection process',
        priority: 'medium',
        estimatedDays: 1,
      },
      {
        title: 'App Store submission preparation',
        description: 'Gather screenshots, app description, privacy policy, and submission requirements',
        priority: 'low',
        estimatedDays: 2,
      },
    ],
  };

  return suggestions[projectId] || [
    {
      title: `Define ${projectName} milestones`,
      description: 'Break down project into major milestones with timelines',
      priority: 'high',
      estimatedDays: 1,
    },
    {
      title: `Create ${projectName} technical documentation`,
      description: 'Document architecture, APIs, and development guidelines',
      priority: 'medium',
      estimatedDays: 3,
    },
  ];
};

// Helper to get AI analysis for a project
export const getAIAnalysisForProject = (projectId: string): AIProjectAnalysis | undefined => {
  return mockAIAnalyses.find((analysis) => analysis.projectId === projectId);
};
