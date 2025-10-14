const express = require('express');
const router = express.Router();
const { getManageEvents, getRecommendedVolunteers, createEvent, updateEvent, deleteEvent } = require('../controllers/manageEventController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('admin'), getManageEvents);
router.post('/', requireAuth, requireRole('admin'), createEvent);
router.put('/:id', requireAuth, requireRole('admin'), updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), deleteEvent);

router.get('/recommendedVolunteers', requireAuth, requireRole('admin'), getRecommendedVolunteers);

module.exports = router;