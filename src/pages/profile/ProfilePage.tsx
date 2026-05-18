import { useEffect, useState } from 'react';
import { Mail, Building2, UserCircle, BadgeCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import departmentsData from '@/data/departments.json';
import type { User } from '@/types';

export function ProfilePage() {
  const { user } = useAuth();
  const [manager, setManager] = useState<User | null>(null);

  useEffect(() => {
    if (user?.managerId) {
      authService.getUserById(user.managerId).then((m) => setManager(m ?? null));
    }
  }, [user]);

  if (!user) return null;

  const department = departmentsData.find((d) => d.id === user.departmentId)?.name ?? '—';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="My Profile" description="Your account and organization details" />

      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.title}</p>
            <Badge className="mt-2 capitalize">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileRow icon={Mail} label="Email" value={user.email} />
          <ProfileRow icon={BadgeCheck} label="Employee ID" value={user.employeeId} />
          <ProfileRow icon={Building2} label="Department" value={department} />
          {user.role === 'employee' && manager && (
            <ProfileRow icon={UserCircle} label="Reporting Manager" value={manager.name} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
