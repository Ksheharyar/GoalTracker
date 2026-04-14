const { z } = require('zod');
const Goal = require('../models/Goal');
const Session = require('../models/Session');
const { toISODate } = require('../utils/date');

const sessionSchema = z
  .object({
    goalId: z.string().min(1),
    sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startedAt: z.coerce.date(),
    stoppedAt: z.coerce.date(),
    durationSeconds: z.coerce.number().int().min(1).optional(),
    notes: z.string().trim().max(400).optional().default(''),
    autosaveKey: z.string().trim().max(120).optional(),
  })
  .refine((data) => data.stoppedAt > data.startedAt, {
    message: 'Stopped time must be after start time',
    path: ['stoppedAt'],
  });

function shapeSession(session) {
  const plainSession = session.toObject ? session.toObject() : session;
  return {
    ...plainSession,
    sessionDate: toISODate(plainSession.sessionDate),
  };
}

async function saveSession(req, res, next) {
  try {
    const data = sessionSchema.parse(req.body);
    const autosaveKey = data.autosaveKey || null;
    const goal = await Goal.findOne({ _id: data.goalId, userId: req.auth.userId });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const calculatedDuration = Math.max(
      1,
      Math.round((data.stoppedAt.getTime() - data.startedAt.getTime()) / 1000)
    );
    const durationSeconds = data.durationSeconds || calculatedDuration;

    if (autosaveKey) {
      const existingSession = await Session.findOne({
        userId: req.auth.userId,
        autosaveKey,
      });

      if (existingSession) {
        return res.status(200).json({ session: shapeSession(existingSession), deduplicated: true });
      }
    }

    const session = await Session.create({
      userId: req.auth.userId,
      goalId: goal._id,
      sessionDate: data.sessionDate,
      startedAt: data.startedAt,
      stoppedAt: data.stoppedAt,
      durationSeconds,
      notes: data.notes,
      autosaveKey,
    });

    res.status(201).json({ session: shapeSession(session) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten(),
      });
    }

    next(error);
  }
}

async function listSessions(req, res, next) {
  try {
    const { goalId, date, from, to } = req.query;
    const filter = { userId: req.auth.userId };

    if (goalId) {
      filter.goalId = goalId;
    }

    if (date) {
      filter.sessionDate = date;
    } else if (from || to) {
      filter.sessionDate = {};
      if (from) {
        filter.sessionDate.$gte = from;
      }
      if (to) {
        filter.sessionDate.$lte = to;
      }
    }

    const sessions = await Session.find(filter)
      .populate('goalId', 'title dailyTargetHours durationDays startDate status')
      .sort({ sessionDate: -1, createdAt: -1 })
      .lean();

    const totalDurationSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0);

    res.json({
      sessions: sessions.map((session) => ({
        ...session,
        sessionDate: toISODate(session.sessionDate),
      })),
      totalDurationSeconds,
      totalMinutes: Math.round(totalDurationSeconds / 60),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  saveSession,
  listSessions,
};