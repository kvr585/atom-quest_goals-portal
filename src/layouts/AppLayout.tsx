import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  goals: 'Goals',
  create: 'Create',
  checkins: 'Check-ins',
  analytics: 'Analytics',
  reports: 'Reports',
  profile: 'Profile',
  manager: 'Manager',
  approvals: 'Approvals',
  admin: 'Admin',
  users: 'Users',
  cycles: 'Cycles',
  'shared-goals': 'Shared Goals',
  audit: 'Audit Logs',
  escalations: 'Escalations',
};

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const sidebarWidth = collapsed ? 72 : 256;

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: breadcrumbMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      href: i < segments.length - 1 ? '/' + segments.slice(0, i + 1).join('/') : undefined,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Navbar breadcrumbs={breadcrumbs} sidebarWidth={sidebarWidth} />
      <main
        className="min-h-screen pt-16 transition-all"
        style={{ marginLeft: sidebarWidth }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
