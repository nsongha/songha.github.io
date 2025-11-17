import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskComment } from '@/lib/types';
import { mockTasks } from '@/lib/utils/mock-data';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByAssignee: (assigneeId: string) => Task[];
  addComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  requestUpdate: (taskId: string) => void;
  clearUpdateRequest: (taskId: string) => void;
  assignTask: (taskId: string, assigneeId: string, assigneeName: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,

  addTask: (task) => set((state) => ({
    tasks: [
      ...state.tasks,
      {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task,
    ],
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...updates,
            updatedAt: new Date(),
            completedAt: updates.status === 'done' ? new Date() : task.completedAt,
          }
        : task
    ),
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status,
            updatedAt: new Date(),
            completedAt: status === 'done' ? new Date() : undefined,
            // Clear update request only if status actually changed
            updateRequested: task.status === status ? task.updateRequested : false,
          }
        : task
    ),
  })),

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },

  getTasksByAssignee: (assigneeId) => {
    return get().tasks.filter((task) => task.assigneeId === assigneeId);
  },

  addComment: (taskId, comment) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            comments: [
              ...(task.comments || []),
              {
                ...comment,
                id: `comment-${Date.now()}`,
                createdAt: new Date(),
              } as TaskComment,
            ],
          }
        : task
    ),
  })),

  requestUpdate: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? { ...task, updateRequested: true }
        : task
    ),
  })),

  clearUpdateRequest: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? { ...task, updateRequested: false }
        : task
    ),
  })),

  assignTask: (taskId, assigneeId, assigneeName) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assigneeId,
            assigneeName,
            status: 'todo', // Move from pending to todo when assigned
            updatedAt: new Date(),
          }
        : task
    ),
  })),
}));
