const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  signup,
  login,
  logout,
  me,
  requestEmailVerification,
  confirmEmailVerification,
  requestPasswordReset,
  confirmPasswordReset,
} = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/verify-email/request', authLimiter, requestEmailVerification);
router.post('/verify-email/confirm', authLimiter, confirmEmailVerification);
router.post('/password-reset/request', authLimiter, requestPasswordReset);
router.post('/password-reset/confirm', authLimiter, confirmPasswordReset);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;