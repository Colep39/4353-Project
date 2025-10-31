const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage, limits: {fileSize: 10 * 1024 * 1024}});
const { getManageEvents, getRecommendedVolunteers, createEvent, updateEvent, deleteEvent, getSkills, uploadEventImage } = require('../controllers/manageEventController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('admin'), getManageEvents);
router.get('/skills', requireAuth, requireRole('admin'), getSkills);
router.post('/', requireAuth, requireRole('admin'), createEvent);
router.post("/upload", upload.single("image"), requireAuth, requireRole('admin'), uploadEventImage);
router.put('/:id', requireAuth, requireRole('admin'), updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), deleteEvent);

router.get('/recommendedVolunteers', requireAuth, requireRole('admin'), getRecommendedVolunteers);

module.exports = router;