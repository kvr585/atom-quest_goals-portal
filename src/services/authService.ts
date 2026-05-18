import usersData from '@/data/users.json';
import { mockFetch } from './api';
import type { User, UserRole } from '@/types';

const users = usersData as User[];

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    await mockFetch(null, 600);
    if (!user) throw new Error('Invalid email or password');
    return { ...user, password: '' };
  },

  async getDemoUsers(): Promise<Pick<User, 'id' | 'email' | 'name' | 'role' | 'title'>[]> {
    const demos = [
      users.find((u) => u.role === 'employee' && u.email === 'employee@atomquest.com'),
      users.find((u) => u.role === 'manager' && u.email === 'manager@atomquest.com'),
      users.find((u) => u.role === 'admin' && u.email === 'admin@atomquest.com'),
    ].filter(Boolean) as User[];
    return mockFetch(demos.map(({ id, email, name, role, title }) => ({ id, email, name, role, title })));
  },

  async getUserById(id: string): Promise<User | undefined> {
    return mockFetch(users.find((u) => u.id === id));
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return mockFetch(users.filter((u) => u.role === role));
  },

  async getTeamMembers(managerId: string): Promise<User[]> {
    return mockFetch(users.filter((u) => u.managerId === managerId));
  },

  async getAllUsers(): Promise<User[]> {
    return mockFetch(users);
  },
};
