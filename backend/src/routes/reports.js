const express = require("express");
const router = express.Router();
const {
  getVolunteerReport,
  getEventReport,
  exportVolunteerCSV,
  exportEventCSV,
  exportVolunteerPDF,
  exportEventPDF
} = require("../controllers/reportsController");

router.get("/volunteers", getVolunteerReport);
router.get("/events", getEventReport);

router.get("/export/volunteers/csv", exportVolunteerCSV);
router.get("/export/events/csv", exportEventCSV);

router.get("/export/volunteers/pdf", exportVolunteerPDF);
router.get("/export/events/pdf", exportEventPDF);

module.exports = router;
