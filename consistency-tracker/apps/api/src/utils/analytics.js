const { addDays, differenceInCalendarDays, toISODate } = require('./date');

function getContributionIntensity(totalSeconds, targetSeconds) {
  if (!totalSeconds) {
    return 0;
  }

  if (!targetSeconds) {
    return 1;
  }

  if (totalSeconds > targetSeconds) {
    return 3;
  }

  if (totalSeconds === targetSeconds) {
    return 2;
  }

  return 1;
}

function groupTotalsByDate(sessions = []) {
  return sessions.reduce((map, session) => {
    const key = session.sessionDate;
    const nextValue = Number(map.get(key) || 0) + Number(session.durationSeconds || 0);
    map.set(key, nextValue);
    return map;
  }, new Map());
}

function buildRangeSeries(startDate, endDate, totalsByDate = new Map()) {
  const labels = [];
  const values = [];

  let cursor = new Date(startDate);
  const end = new Date(endDate);

  while (cursor <= end) {
    const key = toISODate(cursor);
    labels.push(key);
    values.push(Number(totalsByDate.get(key) || 0));
    cursor = addDays(cursor, 1);
  }

  return { labels, values };
}

function calculateStreak(dateKeys = [], referenceDate = new Date()) {
  const uniqueKeys = [...new Set(dateKeys)].sort((left, right) => right.localeCompare(left));

  if (uniqueKeys.length === 0) {
    return { current: 0, longest: 0 };
  }

  const todayKey = toISODate(referenceDate);
  const yesterdayKey = toISODate(addDays(referenceDate, -1));
  const anchorKey = uniqueKeys.includes(todayKey)
    ? todayKey
    : uniqueKeys.includes(yesterdayKey)
      ? yesterdayKey
      : null;

  let current = 0;
  if (anchorKey) {
    let cursor = anchorKey;
    while (uniqueKeys.includes(cursor)) {
      current += 1;
      cursor = toISODate(addDays(cursor, -1));
    }
  }

  let longest = 1;
  let streak = 1;
  const chronological = [...uniqueKeys].sort();

  for (let index = 1; index < chronological.length; index += 1) {
    const diff = differenceInCalendarDays(chronological[index], chronological[index - 1]);
    if (diff === 1) {
      streak += 1;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }

  longest = Math.max(longest, streak);

  return { current, longest };
}

function calculateConsistency(dateKeys = [], windowSize = 7, referenceDate = new Date()) {
  if (windowSize <= 0) {
    return 0;
  }

  const uniqueKeys = new Set(dateKeys);
  let activeDays = 0;

  for (let offset = windowSize - 1; offset >= 0; offset -= 1) {
    const key = toISODate(addDays(referenceDate, -offset));
    if (uniqueKeys.has(key)) {
      activeDays += 1;
    }
  }

  return Math.round((activeDays / windowSize) * 100);
}

function buildContributionGrid(sessions = [], goal = null, referenceDate = new Date()) {
  if (!goal) {
    return [];
  }

  const totalsByDate = groupTotalsByDate(sessions);
  const goalStartDate = goal.startDate ? new Date(goal.startDate) : new Date(referenceDate);
  const durationDays = Math.max(0, Number(goal.durationDays || 0));
  const targetSeconds = Math.round(Number(goal.dailyTargetHours || 0) * 3600);
  const previewDays = Math.max(0, Number(process.env.DEV_SIMULATED_STREAK_DAYS || 0) || 0);
  const elapsedDays = Math.max(0, differenceInCalendarDays(referenceDate, goalStartDate) + 1);
  const cells = [];

  for (let dayIndex = 0; dayIndex < durationDays; dayIndex += 1) {
    const date = addDays(goalStartDate, dayIndex);
    const dateKey = toISODate(date);
    const actualSeconds = Number(totalsByDate.get(dateKey) || 0);
    const shouldSimulate = previewDays > 0 && dayIndex < previewDays;
    const seconds = shouldSimulate ? Math.max(actualSeconds, targetSeconds) : actualSeconds;

    cells.push({
      dayIndex,
      dayNumber: dayIndex + 1,
      date: dateKey,
      actualSeconds,
      seconds,
      targetSeconds,
      intensity: getContributionIntensity(seconds, targetSeconds),
      isFuture: dayIndex >= elapsedDays,
      isSimulated: shouldSimulate && seconds > actualSeconds,
    });
  }

  return cells;
}

module.exports = {
  groupTotalsByDate,
  buildRangeSeries,
  calculateStreak,
  calculateConsistency,
  buildContributionGrid,
};