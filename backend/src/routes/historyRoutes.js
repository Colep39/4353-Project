const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/historyController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('volunteer'), getHistory);

module.exports = router;