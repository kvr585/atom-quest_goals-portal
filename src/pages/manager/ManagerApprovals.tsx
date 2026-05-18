import { useEffect, useState } from 'react';
import { Check, X, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { goalService } from '@/services/goalService';
import { authService } from '@/services/authService';
import type { Goal } from '@/types';

export function ManagerApprovals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [comment, setComment] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editWeight, setEditWeight] = useState(0);

  const load = async () => {
    if (!user) return;
    const team = await authService.getTeamMembers(user.id);
    const teamIds = team.map((t) => t.id);
    const pending = await goalService.getPendingApprovals(user.id, teamIds);
    setGoals(pending);
  };

  useEffect(() => { load(); }, [user]);

  const handleApprove = async () => {
    if (!selected) return;
    await goalService.approveGoal(selected.id, comment);
    if (editTarget) await goalService.updateGoal(selected.id, { target: editTarget });
    if (editWeight) await goalService.updateGoal(selected.id, { weightage: editWeight });
    toast.success('Goal approved');
    setSelected(null);
    load();
  };

  const handleReject = async () => {
    if (!selected || !comment) { toast.error('Comment required for rejection'); return; }
    await goalService.rejectGoal(selected.id, comment);
    toast.success('Goal rejected');
    setSelected(null);
    load();
  };

  const handleLock = async (id: string) => {
    await goalService.lockGoal(id);
    toast.success('Goal locked');
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Goal Approvals" description="Review and approve team goal submissions" />

      {goals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No pending approvals</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span>Target: {g.target}</span>
                    <span>Weight: {g.weightage}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={g.status} />
                  <Button size="sm" onClick={() => { setSelected(g); setEditTarget(g.target); setEditWeight(g.weightage); }}>
                    <MessageSquare className="h-4 w-4" /> Review
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleLock(g.id)}><Lock className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Review Goal</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="font-medium">{selected.title}</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Edit Target</label>
                  <Input value={editTarget} onChange={(e) => setEditTarget(e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground">Edit Weightage</label>
                  <Input type="number" value={editWeight} onChange={(e) => setEditWeight(Number(e.target.value))} /></div>
              </div>
              <Textarea placeholder="Manager comments..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleApprove}><Check className="h-4 w-4" /> Approve</Button>
                <Button variant="destructive" className="flex-1" onClick={handleReject}><X className="h-4 w-4" /> Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
