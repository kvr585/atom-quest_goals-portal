import cyclesData from '@/data/cycles.json';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { Unlock } from 'lucide-react';

export function AdminCycles() {
  return (
    <div className="space-y-6">
      <PageHeader title="Cycle Management" description="Manage performance review cycles" />
      <div className="grid gap-4 md:grid-cols-2">
        {cyclesData.map((cycle) => (
          <Card key={cycle.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{cycle.name}</CardTitle>
              <Badge variant={cycle.status === 'active' ? 'success' : 'secondary'}>{cycle.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success('Goal sheets unlocked')}>
                  <Unlock className="h-4 w-4" /> Unlock Sheets
                </Button>
                {cycle.status === 'closed' && (
                  <Button size="sm" variant="outline" onClick={() => toast.info('Cycle reopened')}>Reopen</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
