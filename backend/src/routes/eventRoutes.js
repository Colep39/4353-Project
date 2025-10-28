const express = require('express');
const router = express.Router();
const { getEvents, joinEvent, leaveEvent } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('volunteer'), getEvents);
router.post("/join", requireAuth, requireRole("volunteer"), joinEvent);
router.delete('/leave', requireAuth, requireRole('volunteer'), leaveEvent);

module.exports = router;