const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config();

async function getVolunteerReport(req, res) {
  const { startDate, endDate, search, skill, minHours } = req.query;

  let query = supabaseNoAuth
    .from("volunteer_participation")
    .select(`volunteer_id, full_name, email, hours, event_name, date, skill`);

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);
  if (search) query = query.ilike("full_name", `%${search}%`);
  if (skill) query = query.eq("skill", skill);
  if (minHours) query = query.gte("hours", minHours);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function getEventReport(req, res) {
  const { startDate, endDate, search } = req.query;

  let query = supabaseNoAuth
    .from("event_assignments_view")
    .select(`event_id, event_name, date, volunteer_name, hours`);

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);
  if (search) query = query.ilike("event_name", `%${search}%`);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function exportVolunteerCSV(req, res) {
  res.json({ message: "CSV export not implemented yet" });
}

async function exportEventCSV(req, res) {
  res.json({ message: "CSV export not implemented yet" });
}

async function exportVolunteerPDF(req, res) {
  res.json({ message: "PDF export not implemented yet" });
}

async function exportEventPDF(req, res) {
  res.json({ message: "PDF export not implemented yet" });
}


module.exports = { getVolunteerReport, getEventReport, exportVolunteerCSV, exportEventCSV, exportVolunteerPDF, exportEventPDF };