import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, CheckCircle2, Clock, AlertTriangle, Share2,
  Calendar, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
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
import { formatDate, formatRelative } from '@/utils/format';
import type { Goal } from '@/types';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof dashboardService.getEmployeeKPIs>> | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<{ id: string; title: string; action: string; time: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dashboardService.getEmployeeKPIs(user.id),
      goalService.getGoalsByEmployee(user.id),
      dashboardService.getRecentActivities(user.id),
    ]).then(([k, g, a]) => {
      setKpis(k);
      setGoals(g);
      setActivities(a);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        description="Track your goals and quarterly progress"
        action={<Button asChild><Link to="/goals/create">Create Goals</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Goal Completion" value={`${kpis?.avgAchievement ?? 0}%`} icon={Target} color="bg-blue-500" trend={5} />
        <KPICard title="Completed" value={kpis?.completed ?? 0} icon={CheckCircle2} color="bg-emerald-500" subtitle={`of ${kpis?.total ?? 0} goals`} />
        <KPICard title="On Track" value={kpis?.onTrack ?? 0} icon={Clock} color="bg-amber-500" />
        <KPICard title="Delayed" value={kpis?.delayed ?? 0} icon={AlertTriangle} color="bg-red-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Quarterly Progress</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={kpis?.quarterlyProgress ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Goal Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Shared Goals', value: kpis?.shared ?? 0, icon: Share2, color: 'text-purple-600' },
              { label: 'Pending Approvals', value: kpis?.pendingApprovals ?? 0, icon: Clock, color: 'text-amber-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Goals</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/goals">View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.slice(0, 4).map((g) => (
              <div key={g.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{g.title}</p>
                  <StatusBadge status={g.status} />
                </div>
                <Progress value={g.achievement ?? 0} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">{g.achievement ?? 0}% · Due {formatDate(g.deadline)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 4)
              .map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(g.deadline)}</p>
                  </div>
                  <StatusBadge status={g.status} />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatRelative(a.time)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
