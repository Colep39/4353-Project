const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, updateAdminProfile, isProfileComplete } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');


router.get('/:id', getUserProfile, requireAuth)
router.put('/:id/update', updateProfile, requireAuth)
router.put('/:id/admin/update', updateAdminProfile, requireAuth);
router.get('/:id/isProfileComplete', requireAuth, async (req, res) => {
  const result = await isProfileComplete(req.params.id);
  res.json(result);
});


module.exports = router;