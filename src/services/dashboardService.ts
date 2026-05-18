import goalsData from '@/data/goals.json';
import usersData from '@/data/users.json';
import departmentsData from '@/data/departments.json';
import { mockFetch } from './api';
import type { Goal, User, Department } from '@/types';

const goals = goalsData as Goal[];
const users = usersData as User[];
const departments = departmentsData as Department[];

export const dashboardService = {
  async getEmployeeKPIs(employeeId: string) {
    const empGoals = goals.filter((g) => g.employeeId === employeeId);
    const completed = empGoals.filter((g) => g.status === 'completed' || (g.achievement ?? 0) >= 100).length;
    const onTrack = empGoals.filter((g) => ['approved', 'on_track', 'locked'].includes(g.status)).length;
    const delayed = empGoals.filter((g) => g.status === 'delayed').length;
    const shared = empGoals.filter((g) => g.isShared).length;
    const avgAchievement =
      empGoals.length > 0
        ? Math.round(empGoals.reduce((s, g) => s + (g.achievement ?? 0), 0) / empGoals.length)
        : 0;
    const pending = empGoals.filter((g) => g.status === 'submitted').length;

    return mockFetch({
      completed,
      onTrack,
      delayed,
      shared,
      total: empGoals.length,
      avgAchievement,
      pendingApprovals: pending,
      quarterlyProgress: [
        { quarter: 'Q1', planned: 25, actual: 22 },
        { quarter: 'Q2', planned: 50, actual: 48 },
        { quarter: 'Q3', planned: 75, actual: 0 },
        { quarter: 'Q4', planned: 100, actual: 0 },
      ],
    });
  },

  async getManagerKPIs(managerId: string) {
    const team = users.filter((u) => u.managerId === managerId);
    const teamGoals = goals.filter((g) => team.some((t) => t.id === g.employeeId));
    const pending = teamGoals.filter((g) => g.status === 'submitted').length;
    const avgCompletion =
      teamGoals.length > 0
        ? Math.round(teamGoals.reduce((s, g) => s + (g.achievement ?? 0), 0) / teamGoals.length)
        : 0;

    return mockFetch({
      teamSize: team.length,
      pendingApprovals: pending,
      avgCompletion,
      onTrackCount: teamGoals.filter((g) => g.status === 'on_track' || g.status === 'approved').length,
      atRiskCount: teamGoals.filter((g) => g.status === 'delayed').length,
      teamMembers: team,
    });
  },

  async getAdminKPIs() {
    const totalEmployees = users.filter((u) => u.role === 'employee').length;
    const submitted = goals.filter((g) => g.status !== 'draft').length;
    const completionRate = goals.length > 0 ? Math.round((submitted / goals.length) * 100) : 0;
    const avgAchievement =
      goals.length > 0
        ? Math.round(goals.reduce((s, g) => s + (g.achievement ?? 0), 0) / goals.length)
        : 0;

    const deptMetrics = departments.map((d) => {
      const deptUsers = users.filter((u) => u.departmentId === d.id && u.role === 'employee');
      const deptGoals = goals.filter((g) => deptUsers.some((u) => u.id === g.employeeId));
      const rate =
        deptGoals.length > 0
          ? Math.round(deptGoals.reduce((s, g) => s + (g.achievement ?? 0), 0) / deptGoals.length)
          : 0;
      return { department: d.name, completion: rate, employees: deptUsers.length };
    });

    return mockFetch({
      totalEmployees,
      totalManagers: users.filter((u) => u.role === 'manager').length,
      completionRate,
      avgAchievement,
      escalations: goals.filter((g) => g.status === 'delayed').length,
      deptMetrics,
    });
  },

  async getAnalyticsData() {
    return mockFetch({
      qoqTrends: [
        { quarter: 'Q1 2025', completion: 72, target: 75 },
        { quarter: 'Q2 2025', completion: 78, target: 80 },
        { quarter: 'Q3 2025', completion: 81, target: 85 },
        { quarter: 'Q4 2025', completion: 85, target: 90 },
        { quarter: 'Q1 2026', completion: 68, target: 75 },
        { quarter: 'Q2 2026', completion: 74, target: 80 },
      ],
      goalDistribution: [
        { name: 'Individual', value: 45 },
        { name: 'Shared', value: 25 },
        { name: 'Stretch', value: 10 },
        { name: 'Draft', value: 20 },
      ],
      departmentComparison: departments.map((d) => {
        const deptUsers = users.filter((u) => u.departmentId === d.id);
        const deptGoals = goals.filter((g) => deptUsers.some((u) => u.id === g.employeeId));
        return {
          name: d.name,
          completion:
            deptGoals.length > 0
              ? Math.round(deptGoals.reduce((s, g) => s + (g.achievement ?? 0), 0) / deptGoals.length)
              : 0,
        };
      }),
      leaderboard: users
        .filter((u) => u.role === 'employee')
        .map((u) => {
          const ug = goals.filter((g) => g.employeeId === u.id);
          const score = ug.length ? Math.round(ug.reduce((s, g) => s + (g.achievement ?? 0), 0) / ug.length) : 0;
          return { name: u.name, department: departments.find((d) => d.id === u.departmentId)?.name ?? '', score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
      managerEffectiveness: users
        .filter((u) => u.role === 'manager')
        .map((m) => {
          const team = users.filter((u) => u.managerId === m.id);
          const tg = goals.filter((g) => team.some((t) => t.id === g.employeeId));
          const rate = tg.length ? Math.round(tg.reduce((s, g) => s + (g.achievement ?? 0), 0) / tg.length) : 0;
          return { name: m.name, teamSize: team.length, effectiveness: rate };
        }),
      heatmap: departments.flatMap((d) =>
        ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => ({
          department: d.name,
          quarter: q,
          value: Math.floor(Math.random() * 40) + 50,
        }))
      ),
    });
  },

  async getRecentActivities(userId: string) {
    const userGoals = goals.filter((g) => g.employeeId === userId);
    return mockFetch(
      userGoals.slice(0, 5).map((g) => ({
        id: g.id,
        title: g.title,
        action: `Updated to ${g.status}`,
        time: g.updatedAt,
      }))
    );
  },
};
