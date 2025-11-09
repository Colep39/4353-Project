const express = require('express');
const router = express.Router();
const { getStates } = require('../controllers/statesController');

router.get('/', getStates)

module.exports = router;