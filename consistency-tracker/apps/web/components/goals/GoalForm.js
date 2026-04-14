'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import { createGoal } from '@/lib/api/goals';

const initialState = {
  title: '',
  dailyTargetHours: '2',
  durationDays: '100',
  startDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

function GoalForm({ onCreated, title = 'Create a challenge', description = 'Define a goal and anchor your stopwatch sessions to a clear target.', submitLabel = 'Create goal' }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createGoal({
        title: form.title,
        dailyTargetHours: Number(form.dailyTargetHours),
        durationDays: Number(form.durationDays),
        startDate: form.startDate,
        notes: form.notes,
      });

      setForm(initialState);
      if (onCreated) {
        onCreated(response.goal);
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to create goal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">New goal</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          label="Title"
          placeholder="100 day challenge"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Daily target hours"
            type="number"
            min="0.25"
            max="24"
            step="0.25"
            value={form.dailyTargetHours}
            onChange={(event) => setForm({ ...form, dailyTargetHours: event.target.value })}
            required
          />
          <Input
            label="Duration in days"
            type="number"
            min="1"
            max="3650"
            value={form.durationDays}
            onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
            required
          />
        </div>
        <Input
          label="Start date"
          type="date"
          value={form.startDate}
          onChange={(event) => setForm({ ...form, startDate: event.target.value })}
          required
        />
        <Input
          label="Notes"
          placeholder="Why does this goal matter?"
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Card>
  );
}

export default GoalForm;