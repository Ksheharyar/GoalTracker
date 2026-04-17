const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');
const { z } = require('zod');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const {
  cookieDomain,
  cookieSameSite,
  cookieSecure,
  nodeEnv,
  resendApiKey,
  resendFromEmail,
  verifyEmailUrl,
  resetPasswordUrl,
  tokenExpiryMs,
} = require('../config/env');
const { renderTemplate } = require('../utils/emailTemplates');

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
    emailVerified: Boolean(user.emailVerified),
    timezone: user.timezone,
    reminderTime: user.reminderTime,
    createdAt: user.createdAt,
  };
}

function createTokenRecord() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + tokenExpiryMs);

  return { token, tokenHash, expiresAt };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeLinkBase(url) {
  const sanitized = String(url || '').trim().replace(/\/+$/, '');
  return sanitized
    .replace(/\/:token$/i, '')
    .replace(/\/{token}$/i, '')
    .replace(/\/:id$/i, '');
}

function buildVerificationLink(token) {
  return `${normalizeLinkBase(verifyEmailUrl)}/${token}`;
}

function buildResetLink(token) {
  return `${normalizeLinkBase(resetPasswordUrl)}/${token}`;
}

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    if (nodeEnv !== 'production') {
      console.info(`[email:${subject}]`, to, html);
      return;
    }

    throw new Error('RESEND_API_KEY is missing');
  }

  await resend.emails.send({
    from: resendFromEmail,
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(user, verifyLink) {
  const html = renderTemplate('verify-email.html', {
    VERIFY_URL: verifyLink,
    FOOTER: '— GoalTracker Team',
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify your GoalTracker account',
    html,
  });
}

async function sendPasswordResetEmail(user, resetLink) {
  const html = renderTemplate('reset-password.html', {
    RESET_URL: resetLink,
    FOOTER: '— GoalTracker Team',
  });

  await sendEmail({
    to: user.email,
    subject: 'Reset your GoalTracker password',
    html,
  });
}

function sendAuthCookie(res, user) {
  const token = signToken({
    sub: user.id || user._id.toString(),
    email: user.email,
    name: user.name,
    ver: Number(user.authVersion || 0),
  });

  res.cookie('auth_token', token, authCookieOptions);
}

async function signup(req, res, next) {
  try {
    const data = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser && existingUser.emailVerified) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    let user;
    if (existingUser) {
      const { token, tokenHash, expiresAt } = createTokenRecord();
      existingUser.name = data.name;
      existingUser.passwordHash = passwordHash;
      existingUser.emailVerified = false;
      existingUser.emailVerifiedAt = null;
      existingUser.emailVerificationTokenHash = tokenHash;
      existingUser.emailVerificationTokenExpiresAt = expiresAt;
      existingUser.passwordResetTokenHash = null;
      existingUser.passwordResetTokenExpiresAt = null;
      user = await existingUser.save();

      await sendVerificationEmail(user, buildVerificationLink(token));
    } else {
      const { token, tokenHash, expiresAt } = createTokenRecord();
      user = await User.create({
        name: data.name,
        email: data.email,
        passwordHash,
        emailVerified: false,
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: expiresAt,
      });

      await sendVerificationEmail(user, buildVerificationLink(token));
    }

    res.status(existingUser ? 200 : 201).json({
      message: 'Verification email sent. Please verify your email before logging in.',
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

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
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

async function requestEmailVerification(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().trim().email().toLowerCase(),
    });

    const { email } = schema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }

    const { token, tokenHash, expiresAt } = createTokenRecord();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationTokenExpiresAt = expiresAt;
    await user.save();

    await sendVerificationEmail(user, buildVerificationLink(token));

    return res.json({ message: 'If an account exists, a verification email has been sent.' });
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

async function confirmEmailVerification(req, res, next) {
  try {
    const schema = z.object({
      token: z.string().trim().length(64),
    });

    const { token } = schema.parse(req.body);
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or expired.' });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;
    await user.save();

    return res.json({ message: 'Email verified successfully.' });
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

async function requestPasswordReset(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().trim().email().toLowerCase(),
    });

    const { email } = schema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    const { token, tokenHash, expiresAt } = createTokenRecord();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpiresAt = expiresAt;
    await user.save();

    await sendPasswordResetEmail(user, buildResetLink(token));

    return res.json({ message: 'If an account exists, a reset email has been sent.' });
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

async function confirmPasswordReset(req, res, next) {
  try {
    const schema = z
      .object({
        token: z.string().trim().length(64),
        password: z.string().min(8).max(100),
        passwordConfirm: z.string().min(8).max(100),
      })
      .refine((data) => data.password === data.passwordConfirm, {
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
      });

    const { token, password } = schema.parse(req.body);
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    user.authVersion = Number(user.authVersion || 0) + 1;
    await user.save();

    res.clearCookie('auth_token', {
      ...authCookieOptions,
      expires: new Date(0),
    });

    return res.json({ message: 'Password reset successfully. Please log in.' });
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

module.exports = {
  signup,
  login,
  logout,
  me,
  requestEmailVerification,
  confirmEmailVerification,
  requestPasswordReset,
  confirmPasswordReset,
};