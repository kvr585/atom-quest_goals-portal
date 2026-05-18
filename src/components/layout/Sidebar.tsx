import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, ClipboardCheck, BarChart3, FileText,
  Users, Settings, Share2, Shield, ChevronLeft, Atom,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

const navByRole: Record<UserRole, { to: string; icon: typeof LayoutDashboard; label: string }[]> = {
  employee: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/goals', icon: Target, label: 'My Goals' },
    { to: '/goals/create', icon: Target, label: 'Create Goals' },
    { to: '/checkins', icon: ClipboardCheck, label: 'Check-ins' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ],
  manager: [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Team Dashboard' },
    { to: '/manager/approvals', icon: Target, label: 'Approvals' },
    { to: '/manager/checkins', icon: ClipboardCheck, label: 'Team Check-ins' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/cycles', icon: Settings, label: 'Cycle Management' },
    { to: '/admin/shared-goals', icon: Share2, label: 'Shared Goals' },
    { to: '/admin/audit', icon: Shield, label: 'Audit Logs' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ],
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const items = user ? navByRole[user.role] : [];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card"
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <Atom className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-bold text-primary">AtomQuest</p>
              <p className="text-xs text-muted-foreground">Goals Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="m-3 flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent"
      >
        <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
      </button>
    </motion.aside>
  );
}
