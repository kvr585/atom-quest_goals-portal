import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_EMAILS: Record<UserRole, string> = {
  employee: 'employee@atomquest.com',
  manager: 'manager@atomquest.com',
  admin: 'admin@atomquest.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('atomquest-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      localStorage.setItem('atomquest-user', JSON.stringify(u));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async (role: UserRole) => {
    await login(DEMO_EMAILS[role], 'demo123');
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('atomquest-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
