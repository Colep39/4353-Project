const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');

router.get('/', (req, res) => {
  res.json({ message: "User routes placeholder" });
});

router.get('/:id', getUserProfile)
router.put('/:id', updateProfile)

module.exports = router;