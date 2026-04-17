require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function parseBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const cookieSecure = parseBoolean(process.env.COOKIE_SECURE, nodeEnv === 'production');
const cookieSameSite = process.env.COOKIE_SAME_SITE || (nodeEnv === 'production' ? 'none' : 'lax');
const tokenExpiryMs = parseNumber(process.env.TOKEN_EXPIRY_MS, 60 * 60 * 1000);

if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true');
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  allowedOrigins,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv,
  cookieSecure,
  cookieSameSite,
  cookieDomain: process.env.COOKIE_DOMAIN,
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@mail.goaltracker.tech',
  verifyEmailUrl: process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email',
  resetPasswordUrl: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
  tokenExpiryMs,
};