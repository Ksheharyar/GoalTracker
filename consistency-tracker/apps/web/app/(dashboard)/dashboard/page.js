'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Target } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import StatCard from '@/components/shared/StatCard';
import GoalForm from '@/components/goals/GoalForm';
import GoalPickerPanel from '@/components/dashboard/GoalPickerPanel';
import StopwatchCard from '@/components/dashboard/StopwatchCard';
import ContributionGrid from '@/components/dashboard/ContributionGrid';
import ReminderBanner from '@/components/dashboard/ReminderBanner';
import EmptyState from '@/components/shared/EmptyState';
import { fetchContributionGrid, fetchDashboardSummary } from '@/lib/api/dashboard';
import { formatDurationLabel } from '@/lib/utils/format';

function formatSessionTimeRange(startedAt, stoppedAt) {
  const formatter = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formatter.format(new Date(startedAt))} - ${formatter.format(new Date(stoppedAt))}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [cells, setCells] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryResponse, gridResponse] = await Promise.all([
        fetchDashboardSummary(selectedGoalId),
        fetchContributionGrid(selectedGoalId),
      ]);

      setSummary(summaryResponse);
      setCells(gridResponse.cells || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedGoalId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardStats = summary?.summary || {};
  const activeGoals = summary?.activeGoals || [];
  const primaryGoal = activeGoals.find((goal) => (goal.id || goal._id) === selectedGoalId) || summary?.primaryGoal;
  const streak = summary?.streak || {};
  const reminder = summary?.reminder;
  const todaySessions = summary?.todaySessions?.sessions || [];
  const todaySessionsTotalCount = summary?.todaySessions?.totalCount || 0;
  const todaySessionsTotalDuration = summary?.todaySessions?.totalDurationSeconds || 0;
  const hasGoals = activeGoals.length > 0;
  const showOnboarding = !loading && !error && !hasGoals;

  useEffect(() => {
    if (!activeGoals.length) {
      setSelectedGoalId('');
      return;
    }

    const selectedGoalExists = activeGoals.some((goal) => (goal.id || goal._id) === selectedGoalId);
    if (!selectedGoalExists) {
      setSelectedGoalId(activeGoals[0].id || activeGoals[0]._id);
    }
  }, [activeGoals, selectedGoalId]);

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">GoalTracker</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">
            {showOnboarding ? 'Create your first goal' : "Today's goal progress"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            {showOnboarding
              ? 'Set up one goal to unlock your stopwatch, streaks, contribution grid, and analytics reports.'
              : "A live view of today's tracked work, remaining time, streak momentum, and active goals."}
          </p>
        </div>
        <Button variant="secondary" onClick={loadDashboard} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-rose-300/20 bg-rose-300/10 p-6 text-rose-100">{error}</Card>
      ) : null}

      {showOnboarding ? (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
          <GoalForm
            onCreated={loadDashboard}
            title="Create your first goal"
            description="This is the first step in GoalTracker. Once you save one goal, the stopwatch and stats cards will populate automatically."
            submitLabel="Create goal"
          />

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">What happens next</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Your dashboard will come alive</h3>
            <div className="mt-5 space-y-4">
              {[
                'Track daily work with a stopwatch attached to your goal.',
                'See your contribution heatmap fill week by week.',
                'Return tomorrow to find your goals already waiting for you.',
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/[0.08] bg-white/5 px-4 py-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <>
          <ReminderBanner reminder={reminder} onRefresh={loadDashboard} />

          <div className="top-stats-row">
            <StatCard
              label="Tracked today"
              value={formatDurationLabel(dashboardStats.todaySeconds || 0)}
              description={`${dashboardStats.todayMinutes || 0} minutes across all sessions`}
              accent="cyan"
            />
            <StatCard
              label="Remaining time"
              value={primaryGoal ? formatDurationLabel(primaryGoal.remainingSeconds || 0) : '—'}
              description={primaryGoal ? `Target: ${primaryGoal.title}` : 'Create an active goal to begin'}
              accent="amber"
            />
            <StatCard
              label="Current streak"
              value={`${streak.current || 0} days`}
              description={`${streak.longest || 0} day best`}
              accent="emerald"
            />
            <StatCard
              label="Weekly consistency"
              value={`${dashboardStats.weeklyConsistency || 0}%`}
              description={`${dashboardStats.activeGoalCount || 0} active goals`}
              accent="rose"
            />
          </div>

          <div className="dashboard-grid">
            <GoalPickerPanel goals={activeGoals} selectedGoalId={selectedGoalId} onSelectGoal={setSelectedGoalId} />

            <StopwatchCard goals={activeGoals} selectedGoalId={selectedGoalId} onSaved={loadDashboard} />

            <Card className="goal-panel self-start p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Primary goal</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-white">{primaryGoal?.title || 'No goal selected'}</h3>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">
                  <Target className="inline-block h-4 w-4 -translate-y-px" /> Goal focus
                </div>
              </div>

              {primaryGoal ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[28px] border border-white/[0.08] bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Progress</p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300"
                        style={{ width: `${primaryGoal.progressPercentage || 0}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {primaryGoal.progressPercentage || 0}% complete, {formatDurationLabel(primaryGoal.remainingSeconds || 0)} remaining.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[24px] border border-white/[0.08] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Target per day</p>
                      <p className="mt-2 font-display text-2xl font-semibold text-white">{primaryGoal.dailyTargetHours} hrs</p>
                    </div>
                    <div className="rounded-[24px] border border-white/[0.08] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Duration</p>
                      <p className="mt-2 font-display text-2xl font-semibold text-white">{primaryGoal.durationDays} days</p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/[0.08] bg-white/5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Today's sessions</p>
                      <p className="text-xs text-slate-400">
                        {todaySessionsTotalCount} sessions · {formatDurationLabel(todaySessionsTotalDuration)}
                      </p>
                    </div>

                    {todaySessionsTotalCount ? (
                      <div className="today-sessions-scroll mt-4 space-y-3">
                        {todaySessions.map((session) => (
                          <div key={session.id} className="rounded-2xl border border-white/[0.08] bg-slate-950/30 px-4 py-3">
                            <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                              <p>{formatSessionTimeRange(session.startedAt, session.stoppedAt)}</p>
                              <p>{formatDurationLabel(session.durationSeconds)}</p>
                            </div>
                            {session.notes ? (
                              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{session.notes}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-400">No sessions logged for this goal yet today.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Create an active goal"
                    description="Once you create a goal, the stopwatch and progress cards will light up with live data."
                  />
                </div>
              )}
            </Card>
          </div>

          <section className="timeline-section">
            <ContributionGrid cells={cells} startDate={primaryGoal?.startDate} />
          </section>
        </>
      )}
    </section>
  );
}