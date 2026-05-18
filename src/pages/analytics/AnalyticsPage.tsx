import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardService } from '@/services/dashboardService';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export function AnalyticsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof dashboardService.getAnalyticsData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAnalyticsData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Organization performance insights and trends" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>QoQ Performance Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.qoqTrends ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completion" stroke="#2563eb" name="Completion %" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="Target %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Goal Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data?.goalDistribution ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {(data?.goalDistribution ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Department Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.departmentComparison ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Manager Effectiveness</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.managerEffectiveness ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="effectiveness" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Team Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(data?.leaderboard ?? []).map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.department}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.score}%</p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${entry.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Completion Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-1">
            <div />
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <div key={q} className="p-2 text-center text-xs font-medium">{q}</div>
            ))}
            {(data?.heatmap ?? []).reduce((acc: { dept: string; vals: { q: string; v: number }[] }[], item) => {
              const existing = acc.find((a) => a.dept === item.department);
              if (existing) existing.vals.push({ q: item.quarter, v: item.value });
              else acc.push({ dept: item.department, vals: [{ q: item.quarter, v: item.value }] });
              return acc;
            }, []).map((row) => (
              <React.Fragment key={row.dept}>
                <div className="p-2 text-xs font-medium">{row.dept.split(' ')[0]}</div>
                {row.vals.map((v) => (
                  <div
                    key={v.q}
                    className="flex items-center justify-center rounded p-2 text-xs font-medium text-white"
                    style={{ backgroundColor: `rgba(37, 99, 235, ${v.v / 100})` }}
                  >
                    {v.v}%
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
