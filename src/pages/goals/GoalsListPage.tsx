import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { goalService } from '@/services/goalService';
import { formatDate } from '@/utils/format';
import type { Goal } from '@/types';
import { Target } from 'lucide-react';

export function GoalsListPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) goalService.getGoalsByEmployee(user.id).then(setGoals).finally(() => setLoading(false));
  }, [user]);

  const filtered = goals.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.thrustArea.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="My Goals" description="FY 2026 Performance Cycle"
        action={<Button asChild><Link to="/goals/create"><Plus className="h-4 w-4" /> Create Goals</Link></Button>} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search goals..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Target} title="No goals found" description="Create your goals for the current performance cycle"
          actionLabel="Create Goals" onAction={() => window.location.href = '/goals/create'} />
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{g.thrustArea}</p>
                    <p className="font-semibold">{g.title}</p>
                    {g.isShared && <span className="text-xs text-purple-600">Shared Goal</span>}
                  </div>
                  <StatusBadge status={g.status} />
                </div>
                <Progress value={g.achievement ?? 0} className="mt-3" />
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Weight: {g.weightage}%</span>
                  <span>Target: {g.target}</span>
                  <span>Due: {formatDate(g.deadline)}</span>
                  <span>{g.achievement ?? 0}% achieved</span>
                </div>
                {g.managerComments && (
                  <p className="mt-2 rounded bg-amber-50 p-2 text-xs dark:bg-amber-950/30">{g.managerComments}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
