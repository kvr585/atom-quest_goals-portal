import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { reportService } from '@/services/reportService';
import { formatRelative } from '@/utils/format';
import type { Notification } from '@/types';

interface NavbarProps {
  breadcrumbs?: { label: string; href?: string }[];
  sidebarWidth: number;
}

export function Navbar({ breadcrumbs = [], sidebarWidth }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      reportService.getNotifications(user.id).then(setNotifications);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur"
      style={{ left: sidebarWidth }}
    >
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {crumb.href ? (
              <button onClick={() => navigate(crumb.href!)} className="text-muted-foreground hover:text-primary">
                {crumb.label}
              </button>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unread}
              </span>
            )}
          </Button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-card shadow-lg">
              <div className="border-b border-border p-3 font-semibold">Notifications</div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}
                      className={`w-full border-b border-border p-3 text-left text-sm hover:bg-accent ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 rounded-xl border border-border bg-card shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
                onClick={() => {
                  setShowProfile(false);
                  navigate('/profile');
                }}
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

