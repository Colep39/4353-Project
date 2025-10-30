const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/:id', requireAuth, getNotifications);

module.exports = router;
