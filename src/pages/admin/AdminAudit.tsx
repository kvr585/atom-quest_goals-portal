import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { reportService } from '@/services/reportService';
import { formatDate } from '@/utils/format';
import type { AuditLog } from '@/types';

export function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');

  useEffect(() => {
    reportService.getAuditLogs({ search, role: role === 'all' ? undefined : role }).then(setLogs);
  }, [search, role]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system changes and actions" />
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative space-y-0 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
        {logs.map((log) => (
          <Card key={log.id} className="relative mb-4 ml-4">
            <div className="absolute -left-7 top-4 h-3 w-3 rounded-full border-2 border-primary bg-card" />
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.userName}</span>
                  <Badge variant="secondary" className="capitalize">{log.role}</Badge>
                  <Badge>{log.action}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(log.timestamp, 'MMM d, yyyy HH:mm')}</span>
              </div>
              <p className="mt-1 text-sm">{log.entityType} · {log.entityId}</p>
              {log.field && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.field}: {log.oldValue ?? '—'} → {log.newValue ?? '—'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
