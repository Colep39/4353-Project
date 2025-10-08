const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');


router.get('/:id', getUserProfile)
router.put('/:id/update', updateProfile)

module.exports = router;