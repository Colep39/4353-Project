const express = require("express");
const router = express.Router();
const { login, register, refresh, role } = require("../controllers/authController");

router.post('/login', login);
router.post('/register', register)
router.post('/refresh', refresh)

router.get('/role', role);

module.exports = router;