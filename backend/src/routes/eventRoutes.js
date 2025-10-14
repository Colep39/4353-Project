const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('volunteer'), getEvents);

module.exports = router;