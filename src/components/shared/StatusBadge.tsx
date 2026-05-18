import { Badge } from '@/components/ui/badge';
import type { GoalStatus, CheckInStatus } from '@/types';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  submitted: { variant: 'warning', label: 'Submitted' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'destructive', label: 'Rejected' },
  locked: { variant: 'default', label: 'Locked' },
  not_started: { variant: 'secondary', label: 'Not Started' },
  on_track: { variant: 'success', label: 'On Track' },
  completed: { variant: 'success', label: 'Completed' },
  delayed: { variant: 'destructive', label: 'Delayed' },
};

interface StatusBadgeProps {
  status: GoalStatus | CheckInStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { variant: 'outline' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
