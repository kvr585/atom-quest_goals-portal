import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Atom, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const roleRedirects: Record<UserRole, string> = {
  employee: '/dashboard',
  manager: '/manager/dashboard',
  admin: '/admin/dashboard',
};

const demoAccounts = [
  { role: 'employee' as UserRole, label: 'Employee', email: 'employee@atomquest.com' },
  { role: 'manager' as UserRole, label: 'Manager', email: 'manager@atomquest.com' },
  { role: 'admin' as UserRole, label: 'Admin', email: 'admin@atomquest.com' },
];

export function LoginPage() {
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      const stored = localStorage.getItem('atomquest-user');
      const user = stored ? JSON.parse(stored) : null;
      navigate(roleRedirects[user?.role as UserRole] ?? '/dashboard');
      toast.success('Welcome back!');
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleDemo = async (role: UserRole) => {
    try {
      await demoLogin(role);
      navigate(roleRedirects[role]);
      toast.success(`Logged in as ${role}`);
    } catch {
      setError('Demo login failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Atom className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-primary">AtomQuest Goals Portal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@atomquest.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Demo Quick Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(({ role, label }) => (
                <Button key={role} variant="outline" size="sm" onClick={() => handleDemo(role)} disabled={isLoading}>
                  {label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Password: demo123</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
