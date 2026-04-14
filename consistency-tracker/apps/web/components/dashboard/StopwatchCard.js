'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { autoSaveSession, saveSession } from '@/lib/api/sessions';
import { formatSeconds, formatDurationLabel } from '@/lib/utils/format';

const MIN_AUTO_SAVE_SECONDS = 5;

function StopwatchCard({ goals = [], selectedGoalId = '', onSaved }) {
  const [status, setStatus] = useState('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);
  const runStartedAtRef = useRef(null);
  const statusRef = useRef(status);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const accumulatedSecondsRef = useRef(accumulatedSeconds);
  const startedAtRef = useRef(startedAt);
  const notesRef = useRef(notes);
  const selectedGoalIdRef = useRef(selectedGoalId);
  const onSavedRef = useRef(onSaved);
  const autoSaveInFlightRef = useRef(false);
  const autoSavedKeyRef = useRef('');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    accumulatedSecondsRef.current = accumulatedSeconds;
  }, [accumulatedSeconds]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    selectedGoalIdRef.current = selectedGoalId;
  }, [selectedGoalId]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (status !== 'running') {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      const runningSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
      setElapsedSeconds(accumulatedSeconds + runningSeconds);
    }, 250);

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [status, accumulatedSeconds]);

  const selectedGoal = useMemo(
    () => goals.find((goal) => (goal.id || goal._id) === selectedGoalId),
    [goals, selectedGoalId]
  );

  function start() {
    if (!selectedGoalId) {
      setError('Select a goal before starting the stopwatch.');
      return;
    }

    setError('');
    if (status === 'idle' || status === 'stopped') {
      setStartedAt(new Date());
      setAccumulatedSeconds(0);
      setElapsedSeconds(0);
    }

    runStartedAtRef.current = Date.now();
    setStatus('running');
  }

  function pause() {
    if (status !== 'running') {
      return;
    }

    window.clearInterval(timerRef.current);
    const runningSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
    const totalSeconds = accumulatedSeconds + runningSeconds;
    setAccumulatedSeconds(totalSeconds);
    setElapsedSeconds(totalSeconds);
    setStatus('paused');
  }

  function stop() {
    if (status === 'running') {
      const runningSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
      const totalSeconds = accumulatedSeconds + runningSeconds;
      setAccumulatedSeconds(totalSeconds);
      setElapsedSeconds(totalSeconds);
    }

    window.clearInterval(timerRef.current);
    setStatus('stopped');
  }

  async function save() {
    if (!selectedGoalId || !startedAt || elapsedSeconds < 1) {
      setError('Run a session before saving it.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const stoppedAt = new Date();
      const response = await saveSession({
        goalId: selectedGoalId,
        sessionDate: new Date().toISOString().slice(0, 10),
        startedAt: startedAt.toISOString(),
        stoppedAt: stoppedAt.toISOString(),
        durationSeconds: elapsedSeconds,
        notes,
        autosaveKey: `${selectedGoalId}:${startedAt.toISOString()}`,
      });

      autoSavedKeyRef.current = '';
      setStatus('idle');
      setElapsedSeconds(0);
      setAccumulatedSeconds(0);
      setStartedAt(null);
      setNotes('');
      if (onSaved) {
        onSaved(response.session);
      }
    } catch (saveError) {
      setError(saveError.message || 'Failed to save the session.');
    } finally {
      setSaving(false);
    }
  }

  function getSessionSnapshot() {
    const currentStatus = statusRef.current;
    const currentStartedAt = startedAtRef.current;
    const currentGoalId = selectedGoalIdRef.current;

    if (!currentStartedAt || !currentGoalId || currentStatus === 'idle') {
      return null;
    }

    let totalSeconds = elapsedSecondsRef.current;
    if (currentStatus === 'running' && runStartedAtRef.current) {
      const runningSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
      totalSeconds = accumulatedSecondsRef.current + runningSeconds;
    }

    return {
      status: currentStatus,
      startedAt: currentStartedAt,
      goalId: currentGoalId,
      notes: notesRef.current,
      totalSeconds: Math.max(0, Math.floor(totalSeconds)),
    };
  }

  async function autoFinalizeSession(trigger) {
    if (autoSaveInFlightRef.current) {
      return;
    }

    const snapshot = getSessionSnapshot();
    if (!snapshot || snapshot.totalSeconds < MIN_AUTO_SAVE_SECONDS) {
      return;
    }

    const autosaveKey = `${snapshot.goalId}:${snapshot.startedAt.toISOString()}`;
    if (autoSavedKeyRef.current === autosaveKey) {
      return;
    }

    const stoppedAt = new Date();
    const payload = {
      goalId: snapshot.goalId,
      sessionDate: new Date().toISOString().slice(0, 10),
      startedAt: snapshot.startedAt.toISOString(),
      stoppedAt: stoppedAt.toISOString(),
      durationSeconds: snapshot.totalSeconds,
      notes: snapshot.notes,
      autosaveKey,
    };

    autoSaveInFlightRef.current = true;
    autoSavedKeyRef.current = autosaveKey;

    window.clearInterval(timerRef.current);
    setAccumulatedSeconds(snapshot.totalSeconds);
    setElapsedSeconds(snapshot.totalSeconds);
    setStatus('paused');

    try {
      const response = await autoSaveSession(payload);
      setStatus('idle');
      setElapsedSeconds(0);
      setAccumulatedSeconds(0);
      setStartedAt(null);
      setNotes('');
      autoSavedKeyRef.current = '';

      if (onSavedRef.current) {
        onSavedRef.current(response?.session);
      }
    } catch (_autoSaveError) {
      if (trigger !== 'pagehide') {
        setError('Unable to auto-save session. Please use Save Session manually.');
      }
      autoSavedKeyRef.current = '';
    } finally {
      autoSaveInFlightRef.current = false;
    }
  }

  useEffect(() => {
    function handlePageHide(event) {
      // Ignore bfcache transitions so tab/app switches do not end the session.
      if (event.persisted) {
        return;
      }

      autoFinalizeSession('pagehide');
    }

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

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
          <Button className="w-full" onClick={save} variant="primary" size="lg" disabled={saving || !selectedGoalId || status === 'idle' || status === 'running'}>
            Save Session
          </Button>
        </div>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      </div>
    </Card>
  );
}

export default StopwatchCard;