'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { autoSaveSession, saveSession } from '@/lib/api/sessions';

const MIN_AUTO_SAVE_SECONDS = 5;

const StopwatchContext = createContext(null);

function StopwatchProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedGoalId, setSelectedGoalIdState] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const runStartedAtRef = useRef(null);
  const statusRef = useRef(status);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const accumulatedSecondsRef = useRef(accumulatedSeconds);
  const startedAtRef = useRef(startedAt);
  const notesRef = useRef(notes);
  const selectedGoalIdRef = useRef(selectedGoalId);
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

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status !== 'running') {
      clearTimer();
      return undefined;
    }

    clearTimer();
    timerRef.current = window.setInterval(() => {
      const startedAtValue = runStartedAtRef.current;
      if (!startedAtValue) {
        return;
      }

      const runningSeconds = Math.floor((Date.now() - startedAtValue) / 1000);
      setElapsedSeconds(accumulatedSecondsRef.current + runningSeconds);
    }, 250);

    return clearTimer;
  }, [accumulatedSeconds, clearTimer, status]);

  const selectedGoalIdValue = selectedGoalId;

  const getSessionSnapshot = useCallback(() => {
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
  }, []);

  const resetSession = useCallback(() => {
    clearTimer();
    runStartedAtRef.current = null;
    setStatus('idle');
    setElapsedSeconds(0);
    setAccumulatedSeconds(0);
    setStartedAt(null);
    setNotes('');
    setSaving(false);
    setError('');
    autoSavedKeyRef.current = '';
  }, [clearTimer]);

  const finalizeAutoSave = useCallback(
    async (trigger) => {
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

      autoSaveInFlightRef.current = true;
      autoSavedKeyRef.current = autosaveKey;

      clearTimer();
      setAccumulatedSeconds(snapshot.totalSeconds);
      setElapsedSeconds(snapshot.totalSeconds);
      setStatus('paused');

      try {
        const response = await autoSaveSession({
          goalId: snapshot.goalId,
          sessionDate: new Date().toISOString().slice(0, 10),
          startedAt: snapshot.startedAt.toISOString(),
          stoppedAt: new Date().toISOString(),
          durationSeconds: snapshot.totalSeconds,
          notes: snapshot.notes,
          autosaveKey,
        });

        autoSavedKeyRef.current = '';
        resetSession();
        return response?.session;
      } catch (_error) {
        autoSavedKeyRef.current = '';
        if (trigger !== 'pagehide') {
          setError('Unable to auto-save session. Please use Save Session manually.');
        }
        return null;
      } finally {
        autoSaveInFlightRef.current = false;
      }
    },
    [clearTimer, getSessionSnapshot, resetSession]
  );

  const start = useCallback(() => {
    if (!selectedGoalIdRef.current) {
      setError('Select a goal before starting the stopwatch.');
      return;
    }

    setError('');

    if (statusRef.current === 'idle' || statusRef.current === 'stopped') {
      setStartedAt(new Date());
      setAccumulatedSeconds(0);
      setElapsedSeconds(0);
    }

    runStartedAtRef.current = Date.now();
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') {
      return;
    }

    const runningSeconds = Math.floor((Date.now() - (runStartedAtRef.current || Date.now())) / 1000);
    const totalSeconds = accumulatedSecondsRef.current + runningSeconds;
    clearTimer();
    runStartedAtRef.current = null;
    setAccumulatedSeconds(totalSeconds);
    setElapsedSeconds(totalSeconds);
    setStatus('paused');
  }, [clearTimer]);

  const stop = useCallback(() => {
    if (statusRef.current === 'running') {
      const runningSeconds = Math.floor((Date.now() - (runStartedAtRef.current || Date.now())) / 1000);
      const totalSeconds = accumulatedSecondsRef.current + runningSeconds;
      setAccumulatedSeconds(totalSeconds);
      setElapsedSeconds(totalSeconds);
    }

    clearTimer();
    runStartedAtRef.current = null;
    setStatus('stopped');
  }, [clearTimer]);

  const save = useCallback(
    async ({ onSaved } = {}) => {
      if (!selectedGoalIdRef.current || !startedAtRef.current || elapsedSecondsRef.current < 1) {
        setError('Run a session before saving it.');
        return;
      }

      setSaving(true);
      setError('');

      try {
        const stoppedAt = new Date();
        const response = await saveSession({
          goalId: selectedGoalIdRef.current,
          sessionDate: new Date().toISOString().slice(0, 10),
          startedAt: startedAtRef.current.toISOString(),
          stoppedAt: stoppedAt.toISOString(),
          durationSeconds: elapsedSecondsRef.current,
          notes: notesRef.current,
          autosaveKey: `${selectedGoalIdRef.current}:${startedAtRef.current.toISOString()}`,
        });

        resetSession();
        if (onSaved) {
          onSaved(response.session);
        }
      } catch (saveError) {
        setError(saveError.message || 'Failed to save the session.');
      } finally {
        setSaving(false);
      }
    },
    [resetSession]
  );

  const setSelectedGoalId = useCallback((goalId) => {
    selectedGoalIdRef.current = goalId;
    setError('');
    setSelectedGoalIdState(goalId);
  }, []);

  const setSessionNotes = useCallback((value) => {
    notesRef.current = value;
    setNotes(value);
  }, []);

  useEffect(() => {
    function handlePageHide(event) {
      if (event.persisted) {
        return;
      }

      void finalizeAutoSave('pagehide');
    }

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [finalizeAutoSave]);

  const value = useMemo(
    () => ({
      status,
      elapsedSeconds,
      accumulatedSeconds,
      startedAt,
      notes,
      selectedGoalId: selectedGoalIdValue,
      saving,
      error,
      setError,
      setSelectedGoalId,
      setNotes: setSessionNotes,
      start,
      pause,
      stop,
      save,
      reset: resetSession,
      finalizeAutoSave,
    }),
    [
      accumulatedSeconds,
      elapsedSeconds,
      error,
      finalizeAutoSave,
      notes,
      resetSession,
      save,
      saving,
      selectedGoalIdValue,
      setSelectedGoalId,
      setSessionNotes,
      start,
      startedAt,
      status,
      pause,
      stop,
    ]
  );

  return <StopwatchContext.Provider value={value}>{children}</StopwatchContext.Provider>;
}

function useStopwatch() {
  const context = useContext(StopwatchContext);

  if (!context) {
    throw new Error('useStopwatch must be used within StopwatchProvider');
  }

  return context;
}

export { StopwatchProvider, useStopwatch };