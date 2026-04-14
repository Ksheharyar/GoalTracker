'use client';

import Link from 'next/link';
import Card from '@/components/shared/Card';

function GoalPickerPanel({ goals = [], selectedGoalId = '', onSelectGoal }) {
  return (
    <Card className="sidebar p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Goal sidebar</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Choose your focus</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Pick the active challenge that the timer should track today.</p>
        </div>

        <div className="space-y-3">
          {goals.map((goal) => {
            const goalId = goal.id || goal._id;
            const isSelected = goalId === selectedGoalId;

            return (
              <button
                key={goalId}
                type="button"
                onClick={() => onSelectGoal(goalId)}
                className={`w-full min-h-[176px] rounded-[24px] border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(104,225,253,0.22)]'
                    : 'border-white/[0.08] bg-slate-950/30 hover:border-cyan-300/20 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 min-h-[3.5rem] font-display text-lg font-semibold text-white">
                        {goal.title}
                      </p>
                      <p className="mt-1 min-h-[3rem] text-sm text-slate-400">
                        {goal.dailyTargetHours} hrs/day • {goal.durationDays} days
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                        isSelected ? 'bg-cyan-300/20 text-cyan-100' : 'bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Pick'}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300"
                      style={{ width: `${goal.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {goals.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-cyan-300/20 bg-slate-950/30 p-5">
            <p className="font-display text-lg font-semibold text-white">No goals yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Create a goal first, then it will appear here as the active focus.</p>
            <div className="mt-4">
              <Link
                href="/goals"
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.12]"
              >
                Open goals
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/goals"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.12]"
          >
            Manage goals
          </Link>
        )}
      </div>
    </Card>
  );
}

export default GoalPickerPanel;
