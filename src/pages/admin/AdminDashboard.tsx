import { useEffect, useState } from 'react';
import { Users, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { KPICard } from '@/components/shared/KPICard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardService } from '@/services/dashboardService';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof dashboardService.getAdminKPIs>> | null>(null);

  useEffect(() => {
    dashboardService.getAdminKPIs().then(setKpis).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-8">
      <PageHeader title="Organization Dashboard" description="Enterprise-wide performance metrics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Employees" value={kpis?.totalEmployees ?? 0} icon={Users} color="bg-blue-500" />
        <KPICard title="Completion Rate" value={`${kpis?.completionRate ?? 0}%`} icon={Target} color="bg-emerald-500" trend={8} />
        <KPICard title="Avg Achievement" value={`${kpis?.avgAchievement ?? 0}%`} icon={TrendingUp} color="bg-purple-500" />
        <KPICard title="Escalations" value={kpis?.escalations ?? 0} icon={AlertCircle} color="bg-red-500" />
      </div>

      <Card>
        <CardHeader><CardTitle>Department Completion Heatmap</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis?.deptMetrics ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                {(kpis?.deptMetrics ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        {(kpis?.deptMetrics ?? []).map((d, i) => (
          <Card key={d.department}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: COLORS[i % COLORS.length], opacity: 0.5 + (d.completion / 200) }}>
                {d.completion}%
              </div>
              <p className="text-sm font-medium">{d.department}</p>
              <p className="text-xs text-muted-foreground">{d.employees} employees</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
