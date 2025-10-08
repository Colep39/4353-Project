const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');

router.get('/:id', getNotifications);

module.exports = router;
