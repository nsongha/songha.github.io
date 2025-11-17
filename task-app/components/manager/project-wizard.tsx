'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTaskStore } from '@/lib/stores/task-store';
import { mockUsers } from '@/lib/utils/mock-data';
import { generateAISuggestedTasks } from '@/lib/utils/ai-mock-data';
import { AISuggestedTask, TaskPriority } from '@/lib/types';

interface ProjectWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ onClose, onComplete }) => {
  const { addTask } = useTaskStore();
  const [step, setStep] = useState(1);

  // Project info
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectId, setProjectId] = useState('');

  // AI suggested tasks
  const [suggestedTasks, setSuggestedTasks] = useState<AISuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [editedTasks, setEditedTasks] = useState<Map<number, AISuggestedTask>>(new Map());

  // Assignment
  const [assignments, setAssignments] = useState<Map<number, string>>(new Map());

  const handleGenerateTasks = () => {
    const newProjectId = `proj-${Date.now()}`;
    setProjectId(newProjectId);

    const tasks = generateAISuggestedTasks(newProjectId, projectName);
    setSuggestedTasks(tasks);
    setSelectedTasks(new Set(tasks.map((_, idx) => idx)));
    setStep(2);
  };

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const editTask = (index: number, field: keyof AISuggestedTask, value: any) => {
    const task = editedTasks.get(index) || suggestedTasks[index];
    const updated = { ...task, [field]: value };
    setEditedTasks(new Map(editedTasks).set(index, updated));
  };

  const assignTask = (index: number, userId: string) => {
    setAssignments(new Map(assignments).set(index, userId));
  };

  const handleCreateProject = () => {
    // Create all selected tasks
    selectedTasks.forEach((index) => {
      const task = editedTasks.get(index) || suggestedTasks[index];
      const assigneeId = assignments.get(index);
      const assignee = mockUsers.find((u) => u.id === assigneeId);

      addTask({
        title: task.title,
        description: task.description,
        status: assigneeId ? 'todo' : 'pending',
        priority: task.priority,
        assigneeId: assigneeId,
        assigneeName: assignee?.name,
        projectId: projectId,
        aiGenerated: true,
      });
    });

    onComplete();
  };

  const members = mockUsers.filter((u) => u.role === 'member');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === 1 ? 'Step 1: Project Details' : step === 2 ? 'Step 2: Review AI Suggestions' : 'Step 3: Assign Tasks'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., E-commerce Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your project goals and requirements..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">AI Task Suggestions</h3>
                    <p className="text-sm text-blue-800">
                      Our AI will analyze your project and suggest tasks based on best practices and common workflows.
                      You can review, edit, or remove any suggestions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handleGenerateTasks}
                  disabled={!projectName}
                  className="flex-1"
                >
                  Generate AI Suggestions →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review AI Suggestions */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h3 className="font-bold text-lg">AI Generated {suggestedTasks.length} Tasks</h3>
                    <p className="text-sm text-blue-100">Review and customize suggestions below</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {suggestedTasks.map((task, index) => {
                  const isSelected = selectedTasks.has(index);
                  const editedTask = editedTasks.get(index) || task;

                  return (
                    <Card key={index} className={isSelected ? 'border-blue-500' : 'border-gray-200'}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTask(index)}
                            className="mt-1 w-4 h-4"
                          />

                          <div className="flex-1 space-y-3">
                            <div>
                              <input
                                type="text"
                                value={editedTask.title}
                                onChange={(e) => editTask(index, 'title', e.target.value)}
                                className="w-full font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1"
                                disabled={!isSelected}
                              />
                            </div>

                            <textarea
                              value={editedTask.description}
                              onChange={(e) => editTask(index, 'description', e.target.value)}
                              className="w-full text-sm text-gray-600 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1"
                              rows={2}
                              disabled={!isSelected}
                            />

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Priority:</span>
                                <select
                                  value={editedTask.priority}
                                  onChange={(e) => editTask(index, 'priority', e.target.value as TaskPriority)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                                  disabled={!isSelected}
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>

                              {editedTask.estimatedDays && (
                                <span className="text-xs text-gray-600">
                                  Est: {editedTask.estimatedDays} days
                                </span>
                              )}

                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                🤖 AI Generated
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                  Next: Assign Tasks →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Assign Tasks */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Tasks without assignment will be marked as "Pending" and can be assigned later.
                </p>
              </div>

              <div className="space-y-3">
                {Array.from(selectedTasks).map((index) => {
                  const task = editedTasks.get(index) || suggestedTasks[index];
                  const assignedUserId = assignments.get(index);

                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          </div>

                          <div className="ml-4">
                            <select
                              value={assignedUserId || ''}
                              onChange={(e) => assignTask(index, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Unassigned (Pending)</option>
                              {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
                <Button variant="primary" onClick={handleCreateProject} className="flex-1">
                  ✓ Create Project & Tasks
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
