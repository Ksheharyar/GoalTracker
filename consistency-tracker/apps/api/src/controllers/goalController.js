const { z } = require('zod');
const Goal = require('../models/Goal');
const Session = require('../models/Session');
const { toISODate, addDays } = require('../utils/date');

const goalSchema = z.object({
  title: z.string().trim().min(3).max(120),
  dailyTargetHours: z.coerce.number().positive().max(24),
  durationDays: z.coerce.number().int().min(1).max(3650),
  startDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional().default(''),
});

const goalStatusSchema = z.enum(['active', 'paused', 'completed', 'archived']);

const goalUpdateSchema = goalSchema
  .partial()
  .extend({
    status: goalStatusSchema.optional(),
  });

function shapeGoal(goal) {
  const plainGoal = goal.toObject ? goal.toObject() : goal;
  const endDate = addDays(plainGoal.startDate, plainGoal.durationDays - 1);

  return {
    ...plainGoal,
    startDate: toISODate(plainGoal.startDate),
    endDate: toISODate(endDate),
    dailyTargetMinutes: Math.round(plainGoal.dailyTargetHours * 60),
  };
}

async function createGoal(req, res, next) {
  try {
    const data = goalSchema.parse(req.body);
    const goal = await Goal.create({
      userId: req.auth.userId,
      title: data.title,
      dailyTargetHours: data.dailyTargetHours,
      durationDays: data.durationDays,
      startDate: data.startDate,
      notes: data.notes,
    });

    res.status(201).json({ goal: shapeGoal(goal) });
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

async function listGoals(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { userId: req.auth.userId };

    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = { $ne: 'archived' };
    }

    const goals = await Goal.find(filter).sort({ startDate: -1, createdAt: -1 }).lean();

    res.json({ goals: goals.map(shapeGoal) });
  } catch (error) {
    next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const data = goalUpdateSchema.parse(req.body);
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.goalId, userId: req.auth.userId },
      {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.dailyTargetHours !== undefined ? { dailyTargetHours: data.dailyTargetHours } : {}),
        ...(data.durationDays !== undefined ? { durationDays: data.durationDays } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.status === 'archived' ? { archivedAt: new Date() } : {}),
        ...(data.status && data.status !== 'archived' ? { archivedAt: null } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ goal: shapeGoal(goal) });
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

async function archiveGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.goalId, userId: req.auth.userId },
      { status: 'archived', archivedAt: new Date() },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ goal: shapeGoal(goal), message: 'Goal archived' });
  } catch (error) {
    next(error);
  }
}

async function unarchiveGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.goalId, userId: req.auth.userId },
      { status: 'paused', archivedAt: null },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ goal: shapeGoal(goal), message: 'Goal unarchived and moved to paused' });
  } catch (error) {
    next(error);
  }
}

async function deleteGoalPermanently(req, res, next) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.goalId, userId: req.auth.userId }).lean();

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Session.deleteMany({ userId: req.auth.userId, goalId: goal._id });

    res.json({ message: 'Goal and associated sessions deleted permanently' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGoal,
  listGoals,
  updateGoal,
  archiveGoal,
  unarchiveGoal,
  deleteGoalPermanently,
};