import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, Send, Loader2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { goalService } from '@/services/goalService';
import { MAX_GOALS, MIN_WEIGHTAGE, validateGoalWeightage } from '@/utils/goalValidation';
import type { UoMType, GoalType, GoalStatus } from '@/types';

const goalItemSchema = z.object({
  thrustArea: z.string().min(1, 'Thrust area is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  uomType: z.enum(['numeric', 'percentage', 'timeline', 'zero-based']),
  target: z.string().min(1, 'Target is required'),
  weightage: z.number({ error: `Weightage is required (min ${MIN_WEIGHTAGE}%)` }).min(MIN_WEIGHTAGE, `Min ${MIN_WEIGHTAGE}%`).max(100),
  deadline: z.string().min(1, 'Deadline is required'),
  goalType: z.enum(['individual', 'shared', 'stretch']),
});

const formSchema = z.object({ goals: z.array(goalItemSchema).min(1).max(MAX_GOALS) });
type FormData = z.infer<typeof formSchema>;

const defaultGoal = {
  thrustArea: '',
  title: '',
  description: '',
  uomType: 'percentage' as UoMType,
  target: '',
  weightage: MIN_WEIGHTAGE,
  deadline: '',
  goalType: 'individual' as GoalType,
};

function firstFormError(errors: FieldErrors<FormData>): string {
  const goalErrors = errors.goals;
  if (Array.isArray(goalErrors)) {
    for (let i = 0; i < goalErrors.length; i++) {
      const g = goalErrors[i];
      if (g && typeof g === 'object') {
        for (const key of Object.keys(g)) {
          const field = g[key as keyof typeof g];
          if (field && typeof field === 'object' && 'message' in field) {
            return `Goal ${i + 1}: ${String(field.message)}`;
          }
        }
      }
    }
  }
  return 'Please complete all required fields correctly.';
}

export function GoalCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weightError, setWeightError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { goals: [{ ...defaultGoal }] },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'goals' });
  const goals = watch('goals');
  const totalWeight = goals?.reduce((s, g) => s + (Number(g.weightage) || 0), 0) ?? 0;

  useEffect(() => {
    setWeightError(validateGoalWeightage(goals ?? []));
  }, [goals]);

  useEffect(() => {
    if (!user) return;
    goalService.loadDraft(user.id).then((draft) => {
      if (draft?.length) {
        setValue('goals', draft as FormData['goals']);
        toast.info('Draft restored');
      }
    });
  }, [user, setValue]);

  const distributeWeightEvenly = () => {
    const count = fields.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    fields.forEach((_, i) => {
      const w = i === 0 ? base + remainder : base;
      setValue(`goals.${i}.weightage`, w, { shouldValidate: true });
    });
    toast.success('Weightages distributed to 100%');
  };

  const onSaveDraft = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await goalService.saveDraft(user.id, getValues('goals'));
      toast.success('Draft saved');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const err = validateGoalWeightage(data.goals);
    if (err) {
      toast.error(err);
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await goalService.createGoals(
        user.id,
        data.goals.map((g) => ({
          thrustArea: g.thrustArea,
          title: g.title,
          description: g.description,
          uomType: g.uomType as UoMType,
          target: g.target,
          weightage: g.weightage,
          deadline: g.deadline,
          goalType: g.goalType as GoalType,
          employeeId: user.id,
          status: 'submitted' as GoalStatus,
          cycleId: 'cycle-2026',
          isShared: g.goalType === 'shared',
        }))
      );
      localStorage.removeItem(`goal-draft-${user.id}`);
      toast.success('Goals submitted for approval!');
      navigate('/goals');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (formErrors: FieldErrors<FormData>) => {
    toast.error(firstFormError(formErrors));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Create Goals"
        description={`FY 2026 · Max ${MAX_GOALS} goals · Weightage must total 100%`}
        action={
          <Button variant="outline" onClick={onSaveDraft} disabled={submitting}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-sm font-medium">Total Weightage</span>
              <span
                className={`ml-2 text-lg font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {totalWeight}%
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={distributeWeightEvenly}>
              <Scale className="h-4 w-4" /> Distribute 100% evenly
            </Button>
          </div>
          <Progress value={Math.min(totalWeight, 100)} className="h-2" />
          {weightError && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{weightError}</p>
          )}
          {totalWeight !== 100 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Adjust weightages or use &quot;Distribute 100% evenly&quot; before submitting.
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Goal {index + 1}</CardTitle>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Thrust Area</Label>
                <Input {...register(`goals.${index}.thrustArea`)} placeholder="e.g. Technical Excellence" />
                {errors.goals?.[index]?.thrustArea && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.thrustArea?.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Goal Title</Label>
                <Input {...register(`goals.${index}.title`)} />
                {errors.goals?.[index]?.title && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.title?.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea {...register(`goals.${index}.description`)} rows={3} placeholder="At least 10 characters" />
                {errors.goals?.[index]?.description && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.description?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>UoM Type</Label>
                <Controller
                  control={control}
                  name={`goals.${index}.uomType`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['numeric', 'percentage', 'timeline', 'zero-based'].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input {...register(`goals.${index}.target`)} placeholder="e.g. 100%" />
                {errors.goals?.[index]?.target && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.target?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Weightage (%)</Label>
                <Input
                  type="number"
                  {...register(`goals.${index}.weightage`, { valueAsNumber: true })}
                  min={MIN_WEIGHTAGE}
                  max={100}
                />
                {errors.goals?.[index]?.weightage && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.weightage?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" {...register(`goals.${index}.deadline`)} />
                {errors.goals?.[index]?.deadline && (
                  <p className="text-xs text-red-500">{errors.goals[index]?.deadline?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Controller
                  control={control}
                  name={`goals.${index}.goalType`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['individual', 'shared', 'stretch'].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length < MAX_GOALS && (
          <Button type="button" variant="outline" onClick={() => append({ ...defaultGoal })} className="w-full">
            <Plus className="h-4 w-4" /> Add Goal ({fields.length}/{MAX_GOALS})
          </Button>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Submit for Approval
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
