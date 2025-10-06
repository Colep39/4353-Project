const express = require('express');
const router = express.Router();
const { getManageEvents, getRecommendedVolunteers, createEvent, updateEvent, deleteEvent } = require('../controllers/manageEventController');

router.get('/', getManageEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.get('/recommendedVolunteers', getRecommendedVolunteers);

module.exports = router;