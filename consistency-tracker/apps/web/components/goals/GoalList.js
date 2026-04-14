import { Archive, CalendarClock, Flame, Play, RotateCcw, Trash2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { activateGoal, archiveGoal, deleteGoal, unarchiveGoal } from '@/lib/api/goals';
import { formatPercent } from '@/lib/utils/format';

function GoalList({ goals = [], onChanged }) {
  async function handleActivate(goalId) {
    await activateGoal(goalId);
    if (onChanged) {
      onChanged(goalId);
    }
  }

  async function handleArchive(goalId) {
    await archiveGoal(goalId);
    if (onChanged) {
      onChanged(goalId);
    }
  }

  async function handleUnarchive(goalId) {
    await unarchiveGoal(goalId);
    if (onChanged) {
      onChanged(goalId);
    }
  }

  async function handleDelete(goalId, title) {
    const accepted = window.confirm(`Delete "${title}" permanently? This also deletes all sessions for this goal.`);
    if (!accepted) {
      return;
    }

    await deleteGoal(goalId);
    if (onChanged) {
      onChanged(goalId);
    }
  }

  if (goals.length === 0) {
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm text-slate-300">No goals yet. Create your first challenge to start tracking consistency.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id || goal._id} className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-2xl font-semibold text-white">{goal.title}</h3>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {goal.status || 'active'}
                </span>
              </div>
              <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
                  <CalendarClock className="mb-2 h-4 w-4 text-cyan-200" />
                  {goal.durationDays} days
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
                  <Flame className="mb-2 h-4 w-4 text-amber-200" />
                  {goal.dailyTargetHours} hrs/day
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
                  <CalendarClock className="mb-2 h-4 w-4 text-emerald-200" />
                  Starts {goal.startDate}
                </div>
              </div>
              <div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300"
                    style={{ width: `${goal.progressPercentage || 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {formatPercent(goal.progressPercentage || 0)} of today's target
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {goal.status === 'paused' ? (
                <Button variant="secondary" size="sm" onClick={() => handleActivate(goal.id || goal._id)}>
                  <Play className="h-4 w-4" /> Activate
                </Button>
              ) : goal.status === 'archived' ? (
                <Button variant="secondary" size="sm" onClick={() => handleUnarchive(goal.id || goal._id)}>
                  <RotateCcw className="h-4 w-4" /> Unarchive
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => handleArchive(goal.id || goal._id)}>
                  <Archive className="h-4 w-4" /> Archive
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(goal.id || goal._id, goal.title)}
                className="border border-rose-300/25 text-rose-200 hover:bg-rose-300/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default GoalList;