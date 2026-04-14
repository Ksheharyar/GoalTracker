const Goal = require('../models/Goal');
const Session = require('../models/Session');
const {
  toISODate,
  addDays,
  startOfWeek,
  startOfMonth,
} = require('../utils/date');
const {
  groupTotalsByDate,
  buildRangeSeries,
  calculateStreak,
  calculateConsistency,
  buildContributionGrid,
} = require('../utils/analytics');

function shapeGoal(goal, todaySeconds = 0) {
  const targetSeconds = Math.round(goal.dailyTargetHours * 3600);
  const progressPercentage = targetSeconds
    ? Math.min(100, Math.round((todaySeconds / targetSeconds) * 100))
    : 0;

  return {
    id: goal._id.toString(),
    title: goal.title,
    dailyTargetHours: goal.dailyTargetHours,
    durationDays: goal.durationDays,
    startDate: toISODate(goal.startDate),
    endDate: toISODate(addDays(goal.startDate, goal.durationDays - 1)),
    status: goal.status,
    targetSeconds,
    todaySeconds,
    remainingSeconds: Math.max(0, targetSeconds - todaySeconds),
    progressPercentage,
  };
}

function shapeTodaySession(session) {
  return {
    id: session._id.toString(),
    goalId: session.goalId.toString(),
    sessionDate: session.sessionDate,
    startedAt: session.startedAt,
    stoppedAt: session.stoppedAt,
    durationSeconds: Number(session.durationSeconds || 0),
    notes: session.notes || '',
  };
}

async function resolveSelectedGoal({ userId, goalId, activeGoals = null }) {
  if (goalId) {
    const selectedGoal = await Goal.findOne({ _id: goalId, userId, status: 'active' }).lean();
    if (!selectedGoal) {
      return null;
    }
    return selectedGoal;
  }

  if (Array.isArray(activeGoals) && activeGoals.length > 0) {
    return activeGoals[0];
  }

  return Goal.findOne({ userId, status: 'active' }).sort({ createdAt: -1 }).lean();
}

function buildWeekdayBreakdown(series = [], referenceDate = new Date()) {
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totals = [0, 0, 0, 0, 0, 0, 0];

  for (const item of series) {
    const dayIndex = new Date(`${item.date}T00:00:00.000Z`).getUTCDay();
    totals[dayIndex] += Number(item.seconds || 0);
  }

  const daysElapsed = Math.max(1, new Date(referenceDate).getUTCDate());
  const weeksElapsed = Math.max(1, Math.ceil(daysElapsed / 7));

  return {
    labels: weekdayLabels,
    values: totals,
    averagePerDay: totals.map((value) => Math.round(value / weeksElapsed)),
  };
}

function buildMonthlyWeekBars(series = [], referenceDate = new Date()) {
  const monthStart = startOfMonth(referenceDate);
  const bars = [
    { label: 'Week 1', actualSeconds: 0 },
    { label: 'Week 2', actualSeconds: 0 },
    { label: 'Week 3', actualSeconds: 0 },
    { label: 'Week 4', actualSeconds: 0 },
  ];

  for (const item of series) {
    const date = new Date(`${item.date}T00:00:00.000Z`);
    if (date < monthStart) {
      continue;
    }
    const dayOfMonth = date.getUTCDate();
    const bucket = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
    bars[bucket].actualSeconds += Number(item.seconds || 0);
  }

  return bars;
}

function buildProgressionSeries({ startDate, endDate, totalsByDate, targetSeconds }) {
  const data = [];
  const safeTarget = Math.max(0, Number(targetSeconds || 0));
  let cursor = new Date(startDate);
  const end = new Date(endDate);

  while (cursor <= end) {
    const key = toISODate(cursor);
    const actualSeconds = Number(totalsByDate.get(key) || 0);
    const completionPercentage = safeTarget > 0
      ? Math.min(200, Math.round((actualSeconds / safeTarget) * 100))
      : 0;

    data.push({
      date: key,
      actualSeconds,
      targetSeconds: safeTarget,
      completionPercentage,
    });
    cursor = addDays(cursor, 1);
  }

  return data;
}

async function getDashboardSummary(req, res, next) {
  try {
    const today = req.query.date ? toISODate(req.query.date) : toISODate(new Date());
    const { goalId } = req.query;
    const userId = req.auth.userId;

    const [activeGoals, todaySessions, recentSessions] = await Promise.all([
      Goal.find({ userId, status: 'active' }).sort({ createdAt: -1 }).lean(),
      Session.find({ userId, sessionDate: today }).sort({ createdAt: -1 }).lean(),
      Session.find({ userId }).select('sessionDate durationSeconds goalId').lean(),
    ]);

    const todaySecondsByGoal = todaySessions.reduce((map, session) => {
      const goalKey = session.goalId.toString();
      const nextValue = Number(map.get(goalKey) || 0) + Number(session.durationSeconds || 0);
      map.set(goalKey, nextValue);
      return map;
    }, new Map());
    const overallTodaySeconds = todaySessions.reduce((total, session) => total + session.durationSeconds, 0);
    const goalCards = activeGoals.map((goal) => shapeGoal(goal, Number(todaySecondsByGoal.get(goal._id.toString()) || 0)));
    const selectedGoal = await resolveSelectedGoal({ userId, goalId, activeGoals });
    if (goalId && !selectedGoal) {
      return res.status(404).json({ message: 'Selected goal not found or not active' });
    }

    const primaryGoal = selectedGoal
      ? goalCards.find((goal) => goal.id === selectedGoal._id.toString()) || null
      : goalCards[0] || null;
    const primaryGoalTodaySessions = primaryGoal
      ? todaySessions
          .filter((session) => session.goalId.toString() === primaryGoal.id)
          .map(shapeTodaySession)
      : [];
    const primaryGoalTodaySeconds = primaryGoalTodaySessions.reduce(
      (total, session) => total + session.durationSeconds,
      0
    );
    const dateKeys = recentSessions.map((session) => session.sessionDate);
    const streak = calculateStreak(dateKeys, new Date());
    const weeklyConsistency = calculateConsistency(dateKeys, 7, new Date());
    const totalActiveSeconds = recentSessions.reduce((total, session) => total + session.durationSeconds, 0);

    res.json({
      today,
      selectedGoalId: primaryGoal?.id || '',
      summary: {
        todaySeconds: overallTodaySeconds,
        todayHours: Number((overallTodaySeconds / 3600).toFixed(2)),
        todayMinutes: Math.round(overallTodaySeconds / 60),
        streak: streak.current,
        weeklyConsistency,
        activeGoalCount: activeGoals.length,
      },
      primaryGoal,
      activeGoals: goalCards,
      reminder: primaryGoal
        ? {
            shouldRemind: primaryGoal.remainingSeconds > 0,
            message: primaryGoal.remainingSeconds > 0
              ? `You still need ${Math.ceil(primaryGoal.remainingSeconds / 60)} minutes to hit today's target for ${primaryGoal.title}.`
              : `You're ahead of today's target for ${primaryGoal.title}.`,
          }
        : {
            shouldRemind: false,
            message: 'Create a goal to start tracking your consistency.',
          },
      streak: {
        current: streak.current,
        longest: streak.longest,
      },
      todaySessions: {
        totalCount: primaryGoalTodaySessions.length,
        totalDurationSeconds: primaryGoalTodaySeconds,
        sessions: primaryGoalTodaySessions,
      },
      totals: {
        todaySeconds: overallTodaySeconds,
        totalTrackedSeconds: totalActiveSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getContributionGrid(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.query;
    const primaryGoal = await resolveSelectedGoal({ userId, goalId });

    if (goalId && !primaryGoal) {
      return res.status(404).json({ message: 'Selected goal not found or not active' });
    }

    if (!primaryGoal) {
      return res.json({
        selectedGoalId: '',
        cells: [],
        streak: { current: 0, longest: 0 },
        consistency: 0,
      });
    }

    const goalStartDate = toISODate(primaryGoal.startDate);
    const goalEndDate = toISODate(addDays(primaryGoal.startDate, primaryGoal.durationDays - 1));
    const sessions = await Session.find({
      userId,
      goalId: primaryGoal._id,
      sessionDate: {
        $gte: goalStartDate,
        $lte: goalEndDate,
      },
    }).lean();

    const cells = buildContributionGrid(sessions, primaryGoal, new Date());
    const dateKeys = sessions.map((session) => session.sessionDate);
    const streak = calculateStreak(dateKeys, new Date());
    const consistency = calculateConsistency(dateKeys, 7, new Date());

    res.json({
      selectedGoalId: primaryGoal._id.toString(),
      cells,
      streak,
      consistency,
    });
  } catch (error) {
    next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { goalId, scope = 'overall' } = req.query;
    const referenceDate = new Date();
    const scopeMode = scope === 'goal' ? 'goal' : 'overall';

    let selectedGoal = null;
    let progressionStart = addDays(referenceDate, -89);
    let progressionTargetSeconds = 0;

    if (scopeMode === 'goal') {
      selectedGoal = await resolveSelectedGoal({ userId, goalId });
      if (goalId && !selectedGoal) {
        return res.status(404).json({ message: 'Selected goal not found or not active' });
      }
      if (!selectedGoal) {
        return res.json({
          scope: scopeMode,
          selectedGoalId: '',
          weeklySeries: { labels: [], values: [] },
          monthlySeries: { labels: [], values: [] },
          weekdayBreakdown: { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], values: [] },
          monthlyWeekBars: [],
          progressionSeries: [],
          consistencyPercentage: 0,
          longestStreak: 0,
          currentStreak: 0,
          totalTrackedSeconds: 0,
        });
      }

      progressionStart = startOfMonth(selectedGoal.startDate);
      progressionTargetSeconds = Math.round(selectedGoal.dailyTargetHours * 3600);
    } else {
      const earliestGoal = await Goal.findOne({ userId }).select('startDate').sort({ startDate: 1 }).lean();
      if (earliestGoal?.startDate) {
        progressionStart = startOfMonth(earliestGoal.startDate);
      }
    }

    if (new Date(progressionStart) > referenceDate) {
      progressionStart = startOfMonth(referenceDate);
    }

    const lowerBound = toISODate(progressionStart);

    const sessionFilter = {
      userId,
      sessionDate: { $gte: lowerBound },
      ...(selectedGoal ? { goalId: selectedGoal._id } : {}),
    };

    const sessions = await Session.find(sessionFilter).lean();

    const totalsByDate = groupTotalsByDate(sessions);
    const weeklySeries = buildRangeSeries(startOfWeek(referenceDate), referenceDate, totalsByDate);
    const monthlySeries = buildRangeSeries(startOfMonth(referenceDate), referenceDate, totalsByDate);
    const dateKeys = sessions.map((session) => session.sessionDate);
    const streak = calculateStreak(dateKeys, referenceDate);

    const ninetyDaySeries = buildRangeSeries(addDays(referenceDate, -89), referenceDate, totalsByDate);
    const dailySeries = ninetyDaySeries.labels.map((label, index) => ({
      date: label,
      seconds: Number(ninetyDaySeries.values[index] || 0),
    }));
    const weekdayBreakdown = buildWeekdayBreakdown(dailySeries, referenceDate);
    const monthSeries = monthlySeries.labels.map((label, index) => ({
      date: label,
      seconds: Number(monthlySeries.values[index] || 0),
    }));
    const monthlyWeekBars = buildMonthlyWeekBars(monthSeries, referenceDate);

    if (scopeMode === 'overall') {
      const totalTrackedSeconds = sessions.reduce((total, session) => total + Number(session.durationSeconds || 0), 0);
      const activeDays = new Set(
        sessions
          .filter((session) => Number(session.durationSeconds || 0) > 0)
          .map((session) => session.sessionDate)
      ).size;
      progressionTargetSeconds = activeDays > 0 ? Math.round(totalTrackedSeconds / activeDays) : 0;
    }

    const progressionSeries = buildProgressionSeries({
      startDate: progressionStart,
      endDate: referenceDate,
      totalsByDate,
      targetSeconds: progressionTargetSeconds,
    });

    const targetSeconds = selectedGoal ? Math.round(selectedGoal.dailyTargetHours * 3600) : 0;
    const monthlyWeekBarsWithTarget = monthlyWeekBars.map((item) => ({
      ...item,
      targetSeconds: targetSeconds > 0 ? targetSeconds * 7 : 0,
    }));

    res.json({
      scope: scopeMode,
      selectedGoalId: selectedGoal ? selectedGoal._id.toString() : '',
      weeklySeries,
      monthlySeries,
      weekdayBreakdown,
      monthlyWeekBars: monthlyWeekBarsWithTarget,
      progressionMode: scopeMode === 'goal' ? 'percentage' : 'seconds',
      progressionSeries,
      consistencyPercentage: calculateConsistency(dateKeys, 30, referenceDate),
      longestStreak: streak.longest,
      currentStreak: streak.current,
      totalTrackedSeconds: sessions.reduce((total, session) => total + session.durationSeconds, 0),
    });
  } catch (error) {
    next(error);
  }
}

async function getReminder(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.query;
    const today = toISODate(new Date());
    const primaryGoal = await resolveSelectedGoal({ userId, goalId });

    if (goalId && !primaryGoal) {
      return res.status(404).json({ message: 'Selected goal not found or not active' });
    }

    if (!primaryGoal) {
      return res.json({ shouldRemind: false, message: 'Create a goal to enable reminders.' });
    }

    const sessions = await Session.find({ userId, goalId: primaryGoal._id, sessionDate: today }).lean();
    const trackedSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0);
    const targetSeconds = Math.round(primaryGoal.dailyTargetHours * 3600);

    res.json({
      shouldRemind: trackedSeconds < targetSeconds,
      message: trackedSeconds < targetSeconds
        ? `You still need ${Math.ceil((targetSeconds - trackedSeconds) / 60)} minutes for ${primaryGoal.title} today.`
        : `Today's target for ${primaryGoal.title} is complete.`,
      remainingSeconds: Math.max(0, targetSeconds - trackedSeconds),
      trackedSeconds,
      targetSeconds,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
  getContributionGrid,
  getAnalytics,
  getReminder,
};