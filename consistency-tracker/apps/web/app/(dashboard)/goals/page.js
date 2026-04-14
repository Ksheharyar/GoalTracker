'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import GoalForm from '@/components/goals/GoalForm';
import GoalList from '@/components/goals/GoalList';
import EmptyState from '@/components/shared/EmptyState';
import { fetchGoals } from '@/lib/api/goals';
import { fetchDashboardSummary } from '@/lib/api/dashboard';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [goalsResponse, dashboardResponse] = await Promise.all([
        fetchGoals('status=all'),
        fetchDashboardSummary(),
      ]);

      const activeGoalMap = new Map(
        (dashboardResponse.activeGoals || []).map((goal) => [goal.id || goal._id, goal])
      );

      setGoals(
        (goalsResponse.goals || []).map((goal) => ({
          ...goal,
          ...(activeGoalMap.get(goal.id || goal._id) || {}),
        }))
      );
    } catch (loadError) {
      setError(loadError.message || 'Unable to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Goals</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">Create and manage challenges</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Define a daily target, duration, and start date. Active goals feed the stopwatch, reminders, and streak engine.
          </p>
        </div>
        <Button variant="secondary" onClick={loadGoals} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? <Card className="border-rose-300/20 bg-rose-300/10 p-5 text-rose-100">{error}</Card> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GoalForm onCreated={loadGoals} />

        {loading && goals.length === 0 ? (
          <Card className="p-6 text-sm text-slate-300">Loading goals...</Card>
        ) : goals.length > 0 ? (
          <GoalList goals={goals} onChanged={loadGoals} />
        ) : (
          <EmptyState
            title="No goals yet"
            description="Create your first challenge to activate the stopwatch, dashboard progress cards, and analytics charts."
          />
        )}
      </div>
    </section>
  );
}