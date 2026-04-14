const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, logout, me } = require('../controllers/authController');
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
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;