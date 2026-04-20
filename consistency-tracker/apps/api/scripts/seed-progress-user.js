const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const User = require('../src/models/User');
const Goal = require('../src/models/Goal');
const Session = require('../src/models/Session');

const DEMO_USER = {
  name: 'Areeb Khan',
  email: 'progress.demo@goaltracker.tech',
  password: 'Demo@12345',
  timezone: 'Asia/Karachi',
  reminderTime: '20:30',
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function atUtcTime(baseDate, hour, minute) {
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

function uniqueOffsets(maxOffset, count) {
  const bag = Array.from({ length: maxOffset + 1 }, (_, index) => index);
  const picked = [];

  while (bag.length > 0 && picked.length < count) {
    const index = randomInt(0, bag.length - 1);
    picked.push(bag[index]);
    bag.splice(index, 1);
  }

  return picked.sort((a, b) => a - b);
}

async function seedProgressUser() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing from environment variables.');
  }

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
  let user = await User.findOne({ email: DEMO_USER.email });

  if (!user) {
    user = await User.create({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash,
      timezone: DEMO_USER.timezone,
      reminderTime: DEMO_USER.reminderTime,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else {
    user.name = DEMO_USER.name;
    user.passwordHash = passwordHash;
    user.timezone = DEMO_USER.timezone;
    user.reminderTime = DEMO_USER.reminderTime;
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    await Session.deleteMany({ userId: user._id });
    await Goal.deleteMany({ userId: user._id });
  }

  const now = new Date();
  const daysCompleted = 50;
  const challengeStart = new Date(now);
  challengeStart.setUTCDate(challengeStart.getUTCDate() - (daysCompleted - 1));

  const challengeGoal = await Goal.create({
    userId: user._id,
    title: '100 Days of Consistency Challenge',
    dailyTargetHours: 2.5,
    durationDays: 100,
    startDate: challengeStart,
    status: 'active',
    notes: `Day ${daysCompleted} reached. Building momentum toward day 100.`,
  });

  const completedGoals = await Goal.insertMany([
    {
      userId: user._id,
      title: 'Frontend Performance Optimization Sprint',
      dailyTargetHours: 2,
      durationDays: 30,
      startDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 4, 1)),
      status: 'completed',
      notes: 'Reduced load times and improved Lighthouse score across core pages.',
    },
    {
      userId: user._id,
      title: 'System Design Interview Prep',
      dailyTargetHours: 1.5,
      durationDays: 45,
      startDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 10)),
      status: 'completed',
      notes: 'Completed mock interviews and architecture notes.',
    },
    {
      userId: user._id,
      title: 'Daily Reading Habit',
      dailyTargetHours: 1,
      durationDays: 60,
      startDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 8, 5)),
      status: 'completed',
      notes: 'Finished 3 books and maintained reading streak over two months.',
    },
    {
      userId: user._id,
      title: 'Backend Reliability Hardening',
      dailyTargetHours: 2,
      durationDays: 40,
      startDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 3)),
      status: 'completed',
      notes: 'Improved error handling, auth flow stability, and production observability.',
    },
  ]);

  const sessions = [];

  // Seed challenge sessions on 50 distinct days out of the last 100 days.
  const challengeOffsets = uniqueOffsets(99, daysCompleted);
  for (const dayOffset of challengeOffsets) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - dayOffset);

    const firstStart = atUtcTime(day, randomInt(5, 8), randomInt(0, 30));
    const firstDuration = randomInt(45, 110);
    sessions.push({
      userId: user._id,
      goalId: challengeGoal._id,
      sessionDate: toISODate(day),
      startedAt: firstStart,
      stoppedAt: new Date(firstStart.getTime() + firstDuration * 60 * 1000),
      durationSeconds: firstDuration * 60,
      status: 'saved',
      notes: `Challenge day ${daysCompleted - challengeOffsets.indexOf(dayOffset)} effort block`,
      autosaveKey: `seed-challenge-${user._id}-${toISODate(day)}-1`,
    });

    if (Math.random() > 0.35) {
      const secondStart = atUtcTime(day, randomInt(18, 21), randomInt(0, 30));
      const secondDuration = randomInt(25, 70);
      sessions.push({
        userId: user._id,
        goalId: challengeGoal._id,
        sessionDate: toISODate(day),
        startedAt: secondStart,
        stoppedAt: new Date(secondStart.getTime() + secondDuration * 60 * 1000),
        durationSeconds: secondDuration * 60,
        status: 'saved',
        notes: 'Evening reinforcement session',
        autosaveKey: `seed-challenge-${user._id}-${toISODate(day)}-2`,
      });
    }
  }

  // Add historical completed-goal sessions for realistic analytics history.
  for (const goal of completedGoals) {
    const goalStart = new Date(goal.startDate);
    const days = Math.min(goal.durationDays, 70);

    for (let i = 0; i < days; i += 1) {
      if (Math.random() < 0.3) {
        continue;
      }

      const day = new Date(goalStart);
      day.setUTCDate(goalStart.getUTCDate() + i);
      if (day > now) {
        break;
      }

      const start = atUtcTime(day, randomInt(6, 20), randomInt(0, 45));
      const duration = randomInt(30, 120);
      sessions.push({
        userId: user._id,
        goalId: goal._id,
        sessionDate: toISODate(day),
        startedAt: start,
        stoppedAt: new Date(start.getTime() + duration * 60 * 1000),
        durationSeconds: duration * 60,
        status: 'saved',
        notes: `Progress block for ${goal.title}`,
        autosaveKey: `seed-${goal._id}-${toISODate(day)}-${i}`,
      });
    }
  }

  if (sessions.length) {
    await Session.insertMany(sessions);
  }

  const challengeDayCount = new Set(
    sessions
      .filter((session) => String(session.goalId) === String(challengeGoal._id))
      .map((session) => session.sessionDate)
  ).size;

  console.log('Progress demo user seeded successfully.');
  console.log(`Email: ${DEMO_USER.email}`);
  console.log(`Password: ${DEMO_USER.password}`);
  console.log(`Goals: ${1 + completedGoals.length} (1 active challenge + ${completedGoals.length} completed)`);
  console.log(`Challenge progress: ${challengeDayCount}/100 days`);
  console.log(`Total sessions inserted: ${sessions.length}`);

  await mongoose.disconnect();
}

seedProgressUser()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Failed to seed progress user:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
