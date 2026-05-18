export type UserRole = 'employee' | 'manager' | 'admin';

export type GoalStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'locked'
  | 'not_started'
  | 'on_track'
  | 'completed'
  | 'delayed';

export type UoMType = 'numeric' | 'percentage' | 'timeline' | 'zero-based';
export type GoalType = 'individual' | 'shared' | 'stretch';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type CheckInStatus = 'not_started' | 'on_track' | 'completed';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  departmentId: string;
  managerId?: string;
  avatar?: string;
  title: string;
  employeeId: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  employeeCount: number;
}

export interface Goal {
  id: string;
  employeeId: string;
  thrustArea: string;
  title: string;
  description: string;
  uomType: UoMType;
  target: string;
  weightage: number;
  deadline: string;
  goalType: GoalType;
  status: GoalStatus;
  cycleId: string;
  sharedGoalId?: string;
  isShared: boolean;
  achievement?: number;
  managerComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  goalId: string;
  employeeId: string;
  quarter: Quarter;
  planned: string;
  actual: string;
  status: CheckInStatus;
  achievement: number;
  managerFeedback?: string;
  comments?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Cycle {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'draft';
}

export interface SharedGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  uomType: UoMType;
  departmentId: string;
  createdBy: string;
  assignedEmployeeIds: string[];
  cycleId: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}
