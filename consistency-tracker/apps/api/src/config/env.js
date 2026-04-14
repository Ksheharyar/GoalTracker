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

const nodeEnv = process.env.NODE_ENV || 'development';
const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const cookieSecure = parseBoolean(process.env.COOKIE_SECURE, nodeEnv === 'production');
const cookieSameSite = process.env.COOKIE_SAME_SITE || (nodeEnv === 'production' ? 'none' : 'lax');

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
};