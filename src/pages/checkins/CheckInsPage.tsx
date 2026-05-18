import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-simple';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { goalService } from '@/services/goalService';
import { authService } from '@/services/authService';
import type { CheckIn, Goal, Quarter, CheckInStatus, User } from '@/types';
import { toast } from 'sonner';
import { ClipboardCheck, Users } from 'lucide-react';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function CheckInsPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [quarter, setQuarter] = useState<Quarter>('Q2');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [draftCheckinValues, setDraftCheckinValues] = useState<Record<string, { planned: string; actual: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        if (isManager) {
          const team = await authService.getTeamMembers(user.id);
          setTeamMembers(team);
          const teamIds = team.map((m) => m.id);
          if (teamIds.length > 0) {
            setSelectedEmployeeId((prev) => prev || teamIds[0]);
            const [teamGoals, teamCheckins] = await Promise.all([
              goalService.getGoalsForTeam(teamIds),
              goalService.getCheckInsForTeam(teamIds),
            ]);
            setGoals(teamGoals);
            setCheckins(teamCheckins);
          } else {
            setGoals([]);
            setCheckins([]);
          }
        } else {
          const [empGoals, empCheckins] = await Promise.all([
            goalService.getGoalsByEmployee(user.id),
            goalService.getCheckIns(undefined, user.id),
          ]);
          setGoals(empGoals);
          setCheckins(empCheckins);
          setSelectedEmployeeId(user.id);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, isManager]);

  const activeEmployeeId = isManager ? selectedEmployeeId : user?.id ?? '';
  const employeeGoals = goals.filter((g) => g.employeeId === activeEmployeeId);
  const employeeCheckins = checkins.filter((c) => c.employeeId === activeEmployeeId);
  const selectedMember = teamMembers.find((m) => m.id === activeEmployeeId);

  const handleUpdate = async (checkinId: string, updates: Partial<CheckIn>) => {
    await goalService.updateCheckIn(checkinId, updates);
    toast.success('Check-in updated');
    if (isManager && user) {
      const team = await authService.getTeamMembers(user.id);
      const teamIds = team.map((m) => m.id);
      setCheckins(await goalService.getCheckInsForTeam(teamIds));
    } else if (user) {
      setCheckins(await goalService.getCheckIns(undefined, user.id));
    }
  };

  const handleManagerFeedback = async (checkinId: string, feedback: string) => {
    await goalService.updateCheckIn(checkinId, { managerFeedback: feedback });
    toast.success('Feedback saved');
    if (user && isManager) {
      const team = await authService.getTeamMembers(user.id);
      setCheckins(await goalService.getCheckInsForTeam(team.map((m) => m.id)));
    }
  };

  const computeAchievement = (actual: string): number => {
    const parsed = parseFloat(actual.replace('%', '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleCreateCheckIn = async (goalId: string, quarterValue: Quarter) => {
    if (!user) return;
    const values = draftCheckinValues[goalId] ?? { planned: '', actual: '' };
    if (!values.planned.trim() || !values.actual.trim()) {
      toast.error('Please enter planned and actual values.');
      return;
    }

    await goalService.createCheckIn({
      goalId,
      employeeId: user.id,
      quarter: quarterValue,
      planned: values.planned,
      actual: values.actual,
      status: 'on_track',
      achievement: computeAchievement(values.actual),
    });
    toast.success('Check-in saved');
    setDraftCheckinValues((prev) => ({ ...prev, [goalId]: { planned: '', actual: '' } }));
    setCheckins(await goalService.getCheckIns(undefined, user.id));
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading check-ins...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isManager ? 'Team Check-ins' : 'Quarterly Check-ins'}
        description={
          isManager
            ? 'Review quarterly progress and provide feedback for your team'
            : 'Update achievement and track planned vs actual progress'
        }
      />

      {isManager && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <Users className="h-5 w-5 text-primary" />
            <div className="min-w-[220px] flex-1 space-y-1">
              <Label>Team member</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} — {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMember && (
              <p className="text-sm text-muted-foreground">
                Viewing check-ins for <strong>{selectedMember.name}</strong>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {employeeGoals.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No goals to review"
          description={
            isManager
              ? 'This team member has no goals in the current cycle yet.'
              : 'Create and submit your goals before completing quarterly check-ins.'
          }
        />
      ) : (
        <Tabs value={quarter} onValueChange={(v) => setQuarter(v as Quarter)}>
          <TabsList>
            {quarters.map((q) => (
              <TabsTrigger key={q} value={q}>
                {q}
                {employeeCheckins.some((c) => c.quarter === q) && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {quarters.map((q) => (
            <TabsContent key={q} value={q} className="mt-6 space-y-4">
              {employeeGoals.map((goal) => {
                const ci = employeeCheckins.find((c) => c.goalId === goal.id && c.quarter === q);
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                        <span>{goal.title}</span>
                        {ci ? <StatusBadge status={ci.status} /> : null}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{goal.thrustArea}</p>
                    </CardHeader>
                    <CardContent>
                      {ci ? (
                        <CheckInDetail
                          ci={ci}
                          isManager={isManager}
                          onStatusChange={(status) => handleUpdate(ci.id, { status })}
                          onFeedbackSave={(feedback) => handleManagerFeedback(ci.id, feedback)}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No check-in recorded for {q}.{' '}
                          {!isManager && 'Use the form below to add one.'}
                        </p>
                      )}
                      {!ci && !isManager && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div>
                            <Label>Planned</Label>
                            <Input
                              value={draftCheckinValues[goal.id]?.planned ?? ''}
                              onChange={(e) =>
                                setDraftCheckinValues((prev) => ({
                                  ...prev,
                                  [goal.id]: {
                                    ...(prev[goal.id] ?? { planned: '', actual: '' }),
                                    planned: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Planned value"
                            />
                          </div>
                          <div>
                            <Label>Actual</Label>
                            <Input
                              value={draftCheckinValues[goal.id]?.actual ?? ''}
                              onChange={(e) =>
                                setDraftCheckinValues((prev) => ({
                                  ...prev,
                                  [goal.id]: {
                                    ...(prev[goal.id] ?? { planned: '', actual: '' }),
                                    actual: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Actual value"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="self-end"
                            onClick={() => handleCreateCheckIn(goal.id, q)}
                          >
                            Save Check-in
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function CheckInDetail({
  ci,
  isManager,
  onStatusChange,
  onFeedbackSave,
}: {
  ci: CheckIn;
  isManager: boolean;
  onStatusChange: (status: CheckInStatus) => void;
  onFeedbackSave: (feedback: string) => void;
}) {
  const [feedback, setFeedback] = useState(ci.managerFeedback ?? '');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="text-xs">Planned</Label>
          <p className="font-medium">{ci.planned}</p>
        </div>
        <div>
          <Label className="text-xs">Actual</Label>
          <p className="font-medium">{ci.actual}</p>
        </div>
        <div>
          <Label className="text-xs">Achievement</Label>
          <p className="font-medium">{ci.achievement}%</p>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          {isManager ? (
            <Select value={ci.status} onValueChange={(v) => onStatusChange(v as CheckInStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge status={ci.status} />
          )}
        </div>
      </div>

      {ci.comments && (
        <p className="text-sm text-muted-foreground">
          <strong>Employee notes:</strong> {ci.comments}
        </p>
      )}

      {isManager ? (
        <div className="space-y-2">
          <Label>Manager feedback</Label>
          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} />
          <Button size="sm" variant="outline" onClick={() => onFeedbackSave(feedback)}>
            Save feedback
          </Button>
        </div>
      ) : (
        ci.managerFeedback && (
          <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/30">
            <strong>Manager Feedback:</strong> {ci.managerFeedback}
          </div>
        )
      )}
    </div>
  );
}
