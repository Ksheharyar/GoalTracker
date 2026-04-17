'use client';

import { useMemo } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { useStopwatch } from '@/lib/store/stopwatch-store';
import { formatSeconds, formatDurationLabel } from '@/lib/utils/format';

function StopwatchCard({ goals = [], onSaved }) {
  const {
    status,
    elapsedSeconds,
    selectedGoalId,
    notes,
    saving,
    error,
    setNotes,
    start,
    pause,
    stop,
    save,
  } = useStopwatch();

  const selectedGoal = useMemo(
    () => goals.find((goal) => (goal.id || goal._id) === selectedGoalId),
    [goals, selectedGoalId]
  );

  return (
    <Card className="timer-card p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Stopwatch</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Track focused work</h3>
          <p className="mt-2 text-sm text-slate-400">Start, pause, stop, and save against the selected goal.</p>
        </div>

        <div className="timer-card-inner">
          <div className="timer-box border border-white/[0.08] bg-slate-950/40 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Timer</p>
            <div className="timer-display mt-4">
              <p className="timer-digits font-mono font-semibold text-white tabular-nums">
                {formatSeconds(elapsedSeconds)}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-400">{formatDurationLabel(elapsedSeconds)} logged</p>
            {selectedGoal ? (
              <p className="mt-3 text-sm text-slate-300">
                Tracking <span className="font-semibold text-white">{selectedGoal.title}</span>
              </p>
            ) : null}
          </div>
        </div>

        <Input
          label="Session notes"
          placeholder="What did you focus on?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="rounded-[28px] border border-white/[0.08] bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
          <p className="mt-2 text-sm text-slate-200">
            {status === 'idle' && 'Ready to start'}
            {status === 'running' && 'Stopwatch running'}
            {status === 'paused' && 'Session paused'}
            {status === 'stopped' && 'Ready to save'}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Selected goal target: {selectedGoal ? `${selectedGoal.dailyTargetHours}h/day` : 'choose a goal'}
          </p>
        </div>

        <div className="timer-controls">
          <Button className="w-full" onClick={start} variant="primary" size="lg" disabled={!selectedGoalId}>
            <Play className="h-4 w-4" /> Start
          </Button>
          <Button className="w-full" onClick={pause} variant="secondary" size="lg" disabled={!selectedGoalId || status !== 'running'}>
            <Pause className="h-4 w-4" /> Pause
          </Button>
          <Button className="w-full" onClick={stop} variant="secondary" size="lg" disabled={!selectedGoalId || status === 'idle' || status === 'stopped'}>
            <Square className="h-4 w-4" /> Stop
          </Button>
          <Button className="w-full" onClick={() => save({ onSaved })} variant="primary" size="lg" disabled={saving || !selectedGoalId || status === 'idle' || status === 'running'}>
            Save Session
          </Button>
        </div>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      </div>
    </Card>
  );
}

export default StopwatchCard;