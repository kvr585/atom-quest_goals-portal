import goalsData from '@/data/goals.json';
import sharedGoalsData from '@/data/sharedGoals.json';
import checkinsData from '@/data/checkins.json';
import { mockFetch } from './api';
import type { Goal, SharedGoal, CheckIn, GoalStatus } from '@/types';

let goals = [...(goalsData as Goal[])];
const sharedGoals = sharedGoalsData as SharedGoal[];
const checkins = [...(checkinsData as CheckIn[])];

export const goalService = {
  async getGoalsByEmployee(employeeId: string): Promise<Goal[]> {
    return mockFetch(goals.filter((g) => g.employeeId === employeeId));
  },

  async getGoalsByManager(teamIds: string[]): Promise<Goal[]> {
    return mockFetch(goals.filter((g) => teamIds.includes(g.employeeId)));
  },

  async getAllGoals(): Promise<Goal[]> {
    return mockFetch(goals);
  },

  async getPendingApprovals(_managerId: string, teamIds: string[]): Promise<Goal[]> {
    return mockFetch(
      goals.filter((g) => teamIds.includes(g.employeeId) && g.status === 'submitted')
    );
  },

  async createGoals(employeeId: string, newGoals: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Goal[]> {
    const created = newGoals.map((g, i) => ({
      ...g,
      id: `goal-${Date.now()}-${i}`,
      employeeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    goals = [...goals, ...created];
    return mockFetch(created, 500);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Goal not found');
    goals[idx] = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockFetch(goals[idx]);
  },

  async approveGoal(id: string, comments?: string): Promise<Goal> {
    return this.updateGoal(id, { status: 'approved' as GoalStatus, managerComments: comments });
  },

  async rejectGoal(id: string, comments: string): Promise<Goal> {
    return this.updateGoal(id, { status: 'rejected' as GoalStatus, managerComments: comments });
  },

  async lockGoal(id: string): Promise<Goal> {
    return this.updateGoal(id, { status: 'locked' as GoalStatus });
  },

  async getSharedGoals(): Promise<SharedGoal[]> {
    return mockFetch(sharedGoals);
  },

  async getCheckIns(goalId?: string, employeeId?: string): Promise<CheckIn[]> {
    let result = checkins;
    if (goalId) result = result.filter((c) => c.goalId === goalId);
    if (employeeId) result = result.filter((c) => c.employeeId === employeeId);
    return mockFetch(result);
  },

  async getCheckInsForTeam(teamEmployeeIds: string[]): Promise<CheckIn[]> {
    return mockFetch(checkins.filter((c) => teamEmployeeIds.includes(c.employeeId)));
  },

  async getGoalsForTeam(teamEmployeeIds: string[]): Promise<Goal[]> {
    return mockFetch(goals.filter((g) => teamEmployeeIds.includes(g.employeeId)));
  },

  async createCheckIn(newCheckIn: Omit<CheckIn, 'id' | 'updatedAt'>): Promise<CheckIn> {
    const created: CheckIn = {
      ...newCheckIn,
      id: `ci-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    checkins.push(created);
    return mockFetch(created, 500);
  },

  async updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn> {
    const idx = checkins.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Check-in not found');
    checkins[idx] = { ...checkins[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockFetch(checkins[idx]);
  },

  async saveDraft(employeeId: string, draftGoals: Partial<Goal>[]): Promise<void> {
    await mockFetch(null, 300);
    localStorage.setItem(`goal-draft-${employeeId}`, JSON.stringify(draftGoals));
  },

  async loadDraft(employeeId: string): Promise<Partial<Goal>[] | null> {
    const raw = localStorage.getItem(`goal-draft-${employeeId}`);
    return mockFetch(raw ? JSON.parse(raw) : null, 200);
  },
};
