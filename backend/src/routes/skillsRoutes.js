const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getSkills } = require('../controllers/skillsController');

router.get('/', getSkills);

module.exports = router;