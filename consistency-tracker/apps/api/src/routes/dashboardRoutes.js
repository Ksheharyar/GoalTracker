const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  getDashboardSummary,
  getContributionGrid,
  getAnalytics,
  getReminder,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(requireAuth);
router.get('/summary', getDashboardSummary);
router.get('/grid', getContributionGrid);
router.get('/analytics', getAnalytics);
router.get('/reminder', getReminder);

module.exports = router;