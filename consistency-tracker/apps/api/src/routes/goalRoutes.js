const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
	createGoal,
	listGoals,
	updateGoal,
	archiveGoal,
	unarchiveGoal,
	deleteGoalPermanently,
} = require('../controllers/goalController');

const router = express.Router();

router.use(requireAuth);
router.get('/', listGoals);
router.post('/', createGoal);
router.patch('/:goalId', updateGoal);
router.patch('/:goalId/archive', archiveGoal);
router.patch('/:goalId/unarchive', unarchiveGoal);
router.delete('/:goalId', deleteGoalPermanently);

module.exports = router;