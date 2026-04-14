'use client';

import { Lightbulb } from 'lucide-react';
import Card from '@/components/shared/Card';
import StatCard from '@/components/shared/StatCard';
import { formatDurationLabel } from '@/lib/utils/format';
import { generateSuggestions } from './RecapSuggestions';

export default function DailyRecap({ analytics = null, selectedGoalId = '', scope = 'overall' }) {
  if (!analytics) {
    return null;
  }

  const totalTrackedSeconds = analytics.totalTrackedSeconds || 0;
  const consistencyPercentage = analytics.consistencyPercentage || 0;
  const longestStreak = analytics.longestStreak || 0;
  const currentStreak = analytics.currentStreak || 0;

  // Build the main headline
  const formattedTime = formatDurationLabel(totalTrackedSeconds);
  const scopeLabel = scope === 'overall' ? 'focused work' : 'on this goal';
  const headline = totalTrackedSeconds > 0
    ? `You tracked ${formattedTime} ${scopeLabel} • ${consistencyPercentage}% consistency`
    : scope === 'overall'
      ? 'Start tracking to see your insights'
      : 'Start tracking this goal to see insights';

  // Generate highlights
  const highlights = [
    {
      label: 'Total tracked',
      value: formattedTime || '0m',
      accent: 'cyan',
    },
    {
      label: 'Current streak',
      value: `${currentStreak} days`,
      accent: 'amber',
    },
    {
      label: 'Consistency',
      value: `${consistencyPercentage}%`,
      accent: 'emerald',
    },
  ];

  // Generate suggestions
  const suggestions = generateSuggestions(analytics, scope);

  return (
    <div className="space-y-6">
      {/* Main recap card with headline */}
      <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-6">
        <p className="font-display text-lg font-semibold text-white/90">{headline}</p>
      </Card>

      {/* Highlights grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <StatCard
            key={highlight.label}
            label={highlight.label}
            value={highlight.value}
            accent={highlight.accent}
          />
        ))}
      </div>

      {/* Suggestions section */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Actionable insights</p>
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions.map((suggestion, idx) => (
            <Card
              key={idx}
              className="flex gap-4 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-cyan-500/0 p-4"
            >
              <div className="mt-1 flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white/90">{suggestion.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">{suggestion.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
