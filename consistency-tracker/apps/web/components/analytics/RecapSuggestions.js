/**
 * Generates actionable suggestions based on analytics metrics and scope.
 * Returns an array of 2 suggestion objects for display in the DailyRecap card.
 *
 * @param {Object} analytics - Analytics payload from fetchAnalytics()
 * @param {string} scope - 'overall' or 'goal'
 * @returns {Array} Array of 2 suggestion objects { title, description }
 */
export function generateSuggestions(analytics = {}, scope = 'overall') {
  if (!analytics) {
    return [
      { title: 'Get started', description: 'Track your first session to build insights and momentum.' },
      { title: 'Set goals', description: 'Create focused goals to structure your tracking and measure progress.' },
    ];
  }

  const suggestions = [];
  const consistencyPercentage = analytics.consistencyPercentage || 0;
  const longestStreak = analytics.longestStreak || 0;
  const currentStreak = analytics.currentStreak || 0;
  const progressionSeries = analytics.progressionSeries || [];

  // Rule 1: Consistency gap suggestion
  if (consistencyPercentage < 80 && consistencyPercentage > 0) {
    const gap = 80 - consistencyPercentage;
    suggestions.push({
      title: 'Close the consistency gap',
      description: `You're ${Math.round(gap)}% away from an 80% consistency target. One more focused session this week gets you there.`,
    });
  } else if (consistencyPercentage >= 80) {
    suggestions.push({
      title: 'Maintain your momentum',
      description: `You've hit ${consistencyPercentage}% consistency—that's impressive. Keep the streak alive.`,
    });
  } else if (currentStreak === 0 && progressionSeries.length > 0) {
    suggestions.push({
      title: 'Restart your streak',
      description: 'It\'s been a few days since your last session. Schedule one today to rebuild momentum.',
    });
  } else if (progressionSeries.length === 0) {
    suggestions.push({
      title: 'Start tracking',
      description: 'Begin your first tracking session to unlock insights and build your consistency baseline.',
    });
  }

  // Rule 2: Streak-building suggestion
  if (longestStreak > 0 && longestStreak < 10) {
    suggestions.push({
      title: 'Build a stronger streak',
      description: `Your best is ${longestStreak} days. Aim for 10 consecutive days of tracking to build unbreakable habits.`,
    });
  } else if (longestStreak >= 10 && currentStreak < longestStreak) {
    suggestions.push({
      title: 'Match your personal best',
      description: `You've reached ${longestStreak} days before. Challenge yourself to match or exceed that streak again.`,
    });
  } else if (longestStreak === 0 && progressionSeries.length > 0) {
    suggestions.push({
      title: 'Build your first 3-day streak',
      description: 'Three consecutive days of tracking establishes a pattern. Make today day one.',
    });
  }

  // Ensure we always return exactly 2 suggestions
  while (suggestions.length < 2) {
    suggestions.push({
      title: 'Keep tracking consistently',
      description: 'Regular sessions over time reveal patterns. Consistency is the foundation of improvement.',
    });
  }

  return suggestions.slice(0, 2);
}
