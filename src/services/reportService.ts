import goalsData from '@/data/goals.json';
import usersData from '@/data/users.json';
import departmentsData from '@/data/departments.json';
import auditLogsData from '@/data/auditLogs.json';
import notificationsData from '@/data/notifications.json';
import { mockFetch } from './api';
import type { Goal, User, AuditLog, Notification } from '@/types';

const goals = goalsData as Goal[];
const users = usersData as User[];
const departments = departmentsData as Department[];

type Department = { id: string; name: string };

export const reportService = {
  async getFilteredGoals(filters: {
    department?: string;
    quarter?: string;
    employee?: string;
    manager?: string;
    status?: string;
  }): Promise<Record<string, unknown>[]> {
    let result = [...goals];

    if (filters.employee) {
      result = result.filter((g) => g.employeeId === filters.employee);
    }
    if (filters.status) {
      result = result.filter((g) => g.status === filters.status);
    }
    if (filters.department) {
      const deptUsers = users.filter((u) => u.departmentId === filters.department);
      result = result.filter((g) => deptUsers.some((u) => u.id === g.employeeId));
    }
    if (filters.manager) {
      const team = users.filter((u) => u.managerId === filters.manager);
      result = result.filter((g) => team.some((t) => t.id === g.employeeId));
    }

    const rows = result.map((g) => {
      const emp = users.find((u) => u.id === g.employeeId);
      const dept = departments.find((d) => d.id === emp?.departmentId);
      return {
        GoalID: g.id,
        Employee: emp?.name ?? '',
        Department: dept?.name ?? '',
        Title: g.title,
        Status: g.status,
        Weightage: g.weightage,
        Achievement: g.achievement ?? 0,
        Deadline: g.deadline,
        Type: g.goalType,
      };
    });

    return mockFetch(rows, 500);
  },

  async getAuditLogs(filters?: { search?: string; role?: string }): Promise<AuditLog[]> {
    let logs = [...(auditLogsData as AuditLog[])];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q)
      );
    }
    if (filters?.role) {
      logs = logs.filter((l) => l.role === filters.role);
    }
    return mockFetch(logs);
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    return mockFetch(
      (notificationsData as Notification[]).filter((n) => n.userId === userId)
    );
  },

  async markNotificationRead(_id: string): Promise<void> {
    await mockFetch(null, 200);
  },
};
