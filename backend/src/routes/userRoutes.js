const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "User routes placeholder" });
});

module.exports = router;