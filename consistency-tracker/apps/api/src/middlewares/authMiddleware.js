const { verifyToken } = require('../utils/jwt');

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

function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = verifyToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = {
  requireAuth,
};