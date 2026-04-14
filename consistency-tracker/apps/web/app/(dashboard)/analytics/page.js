'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import DailyRecap from '@/components/analytics/DailyRecap';
import { fetchAnalytics } from '@/lib/api/dashboard';
import { fetchGoals } from '@/lib/api/goals';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [scope, setScope] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGoals() {
      try {
        const response = await fetchGoals('status=active');
        const nextGoals = response.goals || [];
        setGoals(nextGoals);
        if (nextGoals.length > 0) {
          setSelectedGoalId((current) => {
            const exists = nextGoals.some((goal) => (goal.id || goal._id) === current);
            return exists ? current : (nextGoals[0].id || nextGoals[0]._id);
          });
        } else {
          setSelectedGoalId('');
        }
      } catch {
        setGoals([]);
      }
    }

    loadGoals();
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchAnalytics({
        scope: scope === 'selected' ? 'goal' : 'overall',
        goalId: scope === 'selected' ? selectedGoalId : undefined,
      });
      setAnalytics(response);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [scope, selectedGoalId]);

  useEffect(() => {
    if (scope === 'selected' && !selectedGoalId) {
      setAnalytics(null);
      return;
    }

    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Analytics</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">Weekly and monthly progress</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Chart.js visualizes your consistency curve, streak strength, and time invested over weekly and monthly windows.
          </p>
        </div>
        <Button variant="secondary" onClick={loadAnalytics} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={scope === 'overall' ? 'primary' : 'secondary'} size="sm" onClick={() => setScope('overall')}>
            Overall
          </Button>
          <Button
            variant={scope === 'selected' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setScope('selected')}
            disabled={!goals.length}
          >
            Selected Goal
          </Button>
          {scope === 'selected' ? (
            <select
              value={selectedGoalId}
              onChange={(event) => setSelectedGoalId(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            >
              {goals.map((goal) => (
                <option key={goal.id || goal._id} value={goal.id || goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </Card>

      {error ? <Card className="border-rose-300/20 bg-rose-300/10 p-5 text-rose-100">{error}</Card> : null}

      {loading && !analytics ? (
        <Card className="p-6 text-sm text-slate-300">Loading analytics...</Card>
      ) : (
        <>
          <DailyRecap analytics={analytics} selectedGoalId={selectedGoalId} scope={scope} />
          <AnalyticsCharts analytics={analytics} />
        </>
      )}
    </section>
  );
}