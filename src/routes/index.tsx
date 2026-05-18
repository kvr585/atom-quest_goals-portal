import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { GoalsListPage } from '@/pages/goals/GoalsListPage';
import { GoalCreatePage } from '@/pages/goals/GoalCreatePage';
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard';
import { ManagerApprovals } from '@/pages/manager/ManagerApprovals';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminCycles } from '@/pages/admin/AdminCycles';
import { AdminSharedGoals } from '@/pages/admin/AdminSharedGoals';
import { AdminAudit } from '@/pages/admin/AdminAudit';
import { CheckInsPage } from '@/pages/checkins/CheckInsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { useAuth } from '@/context/AuthContext';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Employee */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/goals" element={<GoalsListPage />} />
        <Route path="/goals/create" element={<GoalCreatePage />} />
        <Route path="/checkins" element={<CheckInsPage />} />

        {/* Manager */}
        <Route path="/manager/dashboard" element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/approvals" element={<ProtectedRoute roles={['manager']}><ManagerApprovals /></ProtectedRoute>} />
        <Route path="/manager/checkins" element={<ProtectedRoute roles={['manager']}><CheckInsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/cycles" element={<ProtectedRoute roles={['admin']}><AdminCycles /></ProtectedRoute>} />
        <Route path="/admin/shared-goals" element={<ProtectedRoute roles={['admin']}><AdminSharedGoals /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAudit /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
