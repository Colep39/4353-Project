const supabase = require("../supabaseClient");
require("dotenv").config();

// Helper: parse DATE from DB without shifting by timezone
const parseDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

const getEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of today

    // Select events and join event_skills -> skills
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_skills (
          skill_id,
          skills (description)
        )
      `);

    if (error) throw error;

    const normalized = data
      .map((event) => {
        const startDate = parseDate(event.start_date);
        const endDate = parseDate(event.end_date) || startDate;

        // Extract skill descriptions
        const skills =  event.event_skills?.map(es => es.skills).filter(Boolean).sort((a, b) => a.description.localeCompare(b.description)).map(s => ({ id: s.skill_id, description: s.description })) || [];

        return {
          id: event.event_id,
          title: event.event_name,
          description: event.event_description,
          location: event.location,
          urgency: event.event_urgency,
          image: event.event_image,
          date: { start: startDate, end: endDate },
          skills,
        };
      })
      .filter((event) => event.date.start && event.date.start >= today);

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEvents };
