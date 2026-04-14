const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../../.env' });

const User = require('../src/models/User');
const Goal = require('../src/models/Goal');
const Session = require('../src/models/Session');

const DUMMY_USER = {
  name: 'Demo Power User',
  email: 'demo56@keepon.app',
  password: 'Demo@12345',
  timezone: 'Asia/Karachi',
  reminderTime: '21:00',
};

const NAME_POOL = [
  'Demo Power User',
  'Momentum Builder',
  'Consistency Explorer',
  'Focus Architect',
  'Habit Engineer',
];

const TIMEZONES = ['Asia/Karachi', 'UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Dubai'];

const REMINDER_TIMES = ['07:30', '09:00', '12:30', '18:00', '20:30', '21:00'];

const GOAL_TITLES = [
  'Deep Work Mastery',
  'System Design Sprint',
  'Reading Habit',
  'Fitness Consistency',
  'Frontend Polish Mission',
  'Algorithm Bootcamp',
  'Backend Reliability Push',
  'Interview Prep Cycle',
  'DSA Daily Challenge',
  'Writing and Reflection',
  'Mobile Dev Momentum',
  'Language Learning Track',
];

const GOAL_NOTES = [
  'Daily focus block with intentional planning.',
  'Build consistency before increasing intensity.',
  'Track both effort and quality outcomes.',
  'Short sessions on busy days still count.',
  'Prioritize momentum over perfection.',
  'Use reminders to avoid zero days.',
];

const STATUS_POOL = ['active', 'paused', 'completed', 'archived'];

const NOTE_POOL = [
  'Focused coding block',
  'Docs and planning',
  'Problem solving sprint',
  'Code review and fixes',
  'Project architecture session',
  'Debugging and cleanup',
  'Learning and practice',
  'Feature implementation',
  'Testing and validation',
  'Analytics review',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(items) {
  return items[randomInt(0, items.length - 1)];
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function atUtcDayTime(baseDate, hour, minute) {
  return new Date(Date.UTC(
    baseDate.getUTCFullYear(),
    baseDate.getUTCMonth(),
    baseDate.getUTCDate(),
    hour,
    minute,
    0,
    0
  ));
}

function weightedGoal(goals) {
  const activeGoal = goals.find((goal) => goal.status === 'active');
  if (!activeGoal) {
    return pickOne(goals);
  }

  const roll = Math.random();
  if (roll < 0.62) {
    return activeGoal;
  }

  return pickOne(goals);
}

function uniqueSample(items, count) {
  const pool = [...items];
  const picked = [];

  while (pool.length > 0 && picked.length < count) {
    const index = randomInt(0, pool.length - 1);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

function randomHalfStepHours(min, max) {
  const value = randomInt(min * 2, max * 2) / 2;
  return Number(value.toFixed(1));
}

function randomReminder() {
  return pickOne(REMINDER_TIMES);
}

function randomTimezone() {
  return pickOne(TIMEZONES);
}

function buildGoalTemplates() {
  const count = randomInt(5, 8);
  const titles = uniqueSample(GOAL_TITLES, count);
  const templates = titles.map((title) => ({
    title,
    dailyTargetHours: randomHalfStepHours(0.5, 4),
    durationDays: randomInt(45, 180),
    startOffsetDays: randomInt(20, 220),
    status: pickOne(STATUS_POOL),
    notes: pickOne(GOAL_NOTES),
  }));

  if (!templates.some((goal) => goal.status === 'active')) {
    templates[0].status = 'active';
  }

  return templates;
}

async function seedDummyAccount() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing from environment variables.');
  }

  await mongoose.connect(mongoUri);

  // Full reset as requested: wipe all accounts and related data.
  await Session.deleteMany({});
  await Goal.deleteMany({});
  await User.deleteMany({});

  const randomizedUser = {
    ...DUMMY_USER,
    name: pickOne(NAME_POOL),
    timezone: randomTimezone(),
    reminderTime: randomReminder(),
  };

  const passwordHash = await bcrypt.hash(randomizedUser.password, 12);
  const user = await User.create({
    name: randomizedUser.name,
    email: randomizedUser.email,
    passwordHash,
    timezone: randomizedUser.timezone,
    reminderTime: randomizedUser.reminderTime,
  });

  const now = new Date();
  const goals = [];
  const goalTemplates = buildGoalTemplates();

  for (const template of goalTemplates) {
    const startDate = new Date(now);
    startDate.setUTCDate(startDate.getUTCDate() - template.startOffsetDays);

    const goal = await Goal.create({
      userId: user._id,
      title: template.title,
      dailyTargetHours: template.dailyTargetHours,
      durationDays: template.durationDays,
      startDate,
      status: template.status,
      notes: template.notes,
      archivedAt: template.status === 'archived' ? new Date() : null,
    });

    goals.push(goal);
  }

  const sessionDocs = [];
  const daysToSeed = randomInt(90, 210);

  for (let dayOffset = daysToSeed - 1; dayOffset >= 0; dayOffset -= 1) {
    const dayDate = new Date(now);
    dayDate.setUTCDate(dayDate.getUTCDate() - dayOffset);

    const weekday = dayDate.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const daySkips = isWeekend ? 0.4 : 0.18;
    if (Math.random() < daySkips) {
      continue;
    }

    const sessionCount = isWeekend ? randomInt(1, 3) : randomInt(1, 5);

    let nextStartHour = isWeekend ? randomInt(8, 10) : randomInt(6, 9);

    for (let index = 0; index < sessionCount; index += 1) {
      const goal = weightedGoal(goals);
      const startMinute = randomInt(0, 45);
      const startedAt = atUtcDayTime(dayDate, nextStartHour, startMinute);
      const durationMinutes = randomInt(20, 210);
      const stoppedAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

      sessionDocs.push({
        userId: user._id,
        goalId: goal._id,
        sessionDate: toISODate(dayDate),
        startedAt,
        stoppedAt,
        durationSeconds: durationMinutes * 60,
        notes: `${pickOne(NOTE_POOL)} (${goal.title})`,
        status: 'saved',
        autosaveKey: `seed-${user._id}-${toISODate(dayDate)}-${index}-${Math.random().toString(36).slice(2, 10)}`,
      });

      const breakMinutes = randomInt(15, 90);
      nextStartHour = stoppedAt.getUTCHours() + Math.floor((stoppedAt.getUTCMinutes() + breakMinutes) / 60);
      if (nextStartHour > 21) {
        break;
      }
    }
  }

  if (sessionDocs.length) {
    await Session.insertMany(sessionDocs);
  }

  const totalSeconds = sessionDocs.reduce((sum, session) => sum + session.durationSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  console.log('Database reset and dummy account seeded successfully.');
  console.log(`User: ${randomizedUser.email}`);
  console.log(`Password: ${randomizedUser.password}`);
  console.log(`Name: ${randomizedUser.name}`);
  console.log(`Timezone: ${randomizedUser.timezone}`);
  console.log(`Reminder: ${randomizedUser.reminderTime}`);
  console.log(`Goals created: ${goals.length}`);
  console.log(`Sessions created: ${sessionDocs.length}`);
  console.log(`Total tracked hours across ${daysToSeed} days: ${totalHours}h`);

  await mongoose.disconnect();
}

seedDummyAccount()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Failed to seed dummy account:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
