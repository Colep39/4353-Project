const supabase = require("../supabaseClient");
require("dotenv").config();

const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

const getEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_skills (
          skill_id,
          skills (description)
        )
      `)
      .gte("start_date", "NOW()");

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
      });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEvents };
