import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICard } from '@/components/shared/KPICard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import { goalService } from '@/services/goalService';
import type { Goal, User } from '@/types';

export function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof dashboardService.getManagerKPIs>> | null>(null);
  const [pending, setPending] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) return;
    dashboardService.getManagerKPIs(user.id).then(async (k) => {
      setKpis(k);
      const teamIds = k.teamMembers.map((m: User) => m.id);
      const p = await goalService.getPendingApprovals(user.id, teamIds);
      setPending(p);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  const teamChart = kpis?.teamMembers.map((m: User) => ({
    name: m.name.split(' ')[0],
    progress: Math.floor(Math.random() * 40) + 50,
  })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Team Dashboard" description="Overview of your team's goal performance"
        action={<Button asChild><Link to="/manager/approvals">Review Approvals ({kpis?.pendingApprovals})</Link></Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Team Size" value={kpis?.teamSize ?? 0} icon={Users} color="bg-blue-500" />
        <KPICard title="Pending Approvals" value={kpis?.pendingApprovals ?? 0} icon={Clock} color="bg-amber-500" />
        <KPICard title="Avg Completion" value={`${kpis?.avgCompletion ?? 0}%`} icon={TrendingUp} color="bg-emerald-500" trend={3} />
        <KPICard title="At Risk" value={kpis?.atRiskCount ?? 0} icon={AlertTriangle} color="bg-red-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Team Progress</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={teamChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/manager/approvals">View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            ) : (
              pending.slice(0, 4).map((g) => (
                <div key={g.id} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{g.title}</p>
                    <StatusBadge status={g.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">Weight: {g.weightage}%</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpis?.teamMembers.map((m: User) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.title}</p>
                </div>
                <Progress value={Math.floor(Math.random() * 40) + 50} className="w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
