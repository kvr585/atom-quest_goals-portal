import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { goalService } from '@/services/goalService';
import departmentsData from '@/data/departments.json';
import type { SharedGoal } from '@/types';

export function AdminSharedGoals() {
  const [goals, setGoals] = useState<SharedGoal[]>([]);

  useEffect(() => { goalService.getSharedGoals().then(setGoals); }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Shared Goals" description="Departmental KPIs assigned to multiple employees" />
      <div className="space-y-4">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                </div>
                <Badge>{departmentsData.find((d) => d.id === g.departmentId)?.name}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span>Target: <strong>{g.target}</strong></span>
                <span>UoM: {g.uomType}</span>
                <span>{g.assignedEmployeeIds.length} employees assigned</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Employees can edit weightage only. Title and target are read-only.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
