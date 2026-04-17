const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

function extractToken(req) {
  const cookieToken = req.cookies?.auth_token;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const user = await User.findById(payload.sub).select('email name authVersion');

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (Number(payload.ver || 0) !== Number(user.authVersion || 0)) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      authVersion: user.authVersion || 0,
    };
    next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireAuth,
};