import type { Goal } from '@/types';

export const MAX_GOALS = 8;
export const MIN_WEIGHTAGE = 10;

export interface GoalFormItem {
  thrustArea: string;
  title: string;
  description: string;
  uomType: string;
  target: string;
  weightage: number;
  deadline: string;
  goalType: string;
}

export function validateGoalWeightage(goals: GoalFormItem[]): string | null {
  if (goals.length === 0) return 'Add at least one goal';
  if (goals.length > MAX_GOALS) return `Maximum ${MAX_GOALS} goals allowed`;
  const total = goals.reduce((sum, g) => sum + (g.weightage || 0), 0);
  if (total !== 100) return `Total weightage must equal 100% (currently ${total}%)`;
  const low = goals.find((g) => g.weightage < MIN_WEIGHTAGE);
  if (low) return `Each goal must have at least ${MIN_WEIGHTAGE}% weightage`;
  return null;
}

export function getGoalStats(goals: Goal[]) {
  return {
    completed: goals.filter((g) => g.status === 'completed' || g.achievement === 100).length,
    onTrack: goals.filter((g) => g.status === 'on_track' || g.status === 'approved').length,
    delayed: goals.filter((g) => g.status === 'delayed').length,
    shared: goals.filter((g) => g.isShared).length,
    total: goals.length,
  };
}
