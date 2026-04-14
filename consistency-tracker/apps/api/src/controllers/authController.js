const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { cookieDomain, cookieSameSite, cookieSecure } = require('../config/env');

const authCookieOptions = {
  httpOnly: true,
  sameSite: cookieSameSite,
  secure: cookieSecure,
  domain: cookieDomain || undefined,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(100),
});

function shapeUser(user) {
  return {
    id: user.id || user._id?.toString(),
    name: user.name,
    email: user.email,
    timezone: user.timezone,
    reminderTime: user.reminderTime,
    createdAt: user.createdAt,
  };
}

function sendAuthCookie(res, user) {
  const token = signToken({
    sub: user.id || user._id.toString(),
    email: user.email,
    name: user.name,
  });

  res.cookie('auth_token', token, authCookieOptions);
}

async function signup(req, res, next) {
  try {
    const data = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    sendAuthCookie(res, user);

    res.status(201).json({
      user: shapeUser(user),
      message: 'Account created successfully',
    });
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

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthCookie(res, user);

    res.json({
      user: shapeUser(user),
      message: 'Logged in successfully',
    });
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

async function logout(req, res) {
  res.clearCookie('auth_token', {
    ...authCookieOptions,
    expires: new Date(0),
  });

  res.json({ message: 'Logged out successfully' });
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: shapeUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
};