const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const { saveSession, listSessions } = require('../controllers/sessionController');

const router = express.Router();

router.use(requireAuth);
router.get('/', listSessions);
router.post('/', saveSession);

module.exports = router;