const supabaseNoAuth = require('../supabaseNoAuth');
require('dotenv').config();
const exportCSV = require("../utils/exportCSV");
const exportPDF = require("../utils/exportPDF");

async function getVolunteerReport(req, res) {
  const { startDate, endDate, search, skill, urgency, minSkills } = req.query;

  let query = supabaseNoAuth
    .from("volunteer_participation")
    .select(`
      volunteer_history_id,
      user_id,
      full_name,
      email,
      event_id,
      event_name,
      event_urgency,
      event_start_date,
      event_end_date,
      user_skills,
      user_skills_len
    `);

  if (startDate) query = query.gte("event_start_date", startDate);
  if (endDate) query = query.lte("event_start_date", endDate);

  if (search)
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`
    );

  if (skill) query = query.contains("user_skills", [skill]);

  if (urgency) query = query.eq("event_urgency", urgency);

  if (minSkills) query = query.gte("user_skills_len", Number(minSkills));

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}


async function getEventReport(req, res) {
  const { startDate, endDate, search, skill, urgency, minSkills } = req.query;

  let query = supabaseNoAuth
    .from("event_assignments_view")
    .select(`
      event_id,
      event_name,
      event_start_date,
      event_end_date,
      event_urgency,
      user_id,
      volunteer_name,
      volunteer_email,
      volunteer_skills,
      volunteer_skills_len,
      event_required_skills
    `);

  if (startDate) query = query.gte("event_start_date", startDate);
  if (endDate) query = query.lte("event_start_date", endDate);

  if (search)
    query = query.ilike("event_name", `%${search}%`);

  if (skill) query = query.contains("volunteer_skills", [skill]);

  if (urgency) query = query.eq("event_urgency", urgency);

  if (minSkills) query = query.gte("volunteer_skills_len", Number(minSkills));

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function exportVolunteerCSV(req, res) {
  const { data, error } = await supabaseNoAuth
    .from("volunteer_participation")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  exportCSV(data, res, "volunteer_report");
}

async function exportEventCSV(req, res) {
  const { data, error } = await supabaseNoAuth
    .from("event_assignments_view")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  exportCSV(data, res, "event_report");
}

async function exportVolunteerPDF(req, res) {
  const { data, error } = await supabaseNoAuth
    .from("volunteer_participation")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  exportPDF(data, res, "Volunteer Report", "volunteer_report");
}

async function exportEventPDF(req, res) {
  const { data, error } = await supabaseNoAuth
    .from("event_assignments_view")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  exportPDF(data, res, "Event Assignments Report", "event_report");
}


module.exports = { getVolunteerReport, getEventReport, exportVolunteerCSV, exportEventCSV, exportVolunteerPDF, exportEventPDF };