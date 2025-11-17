require("dotenv").config();
const supabaseNoAuth = require("../supabaseNoAuth")

const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

async function getHistory (req, res) {
  try {
    // Extract user id
    const header = req.headers.authorization || "";
    const token = header.replace(/^Bearer\s+/i, "");
    if (!token) {
        return res.status(401).json({ error: "Missing token"});
    }
    const { data, error } = await supabaseNoAuth.auth.getUser(token);
    if (error || !data?.user) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
    const userId = data.user.id;

    // Extract event ids for volunteer
    const { data: volunteerHistory, error: volunteerError } = await supabaseNoAuth
      .from("volunteer_history")
      .select("event_id")
      .eq("user_id", userId)

    if (volunteerError) throw volunteerError;

    const eventIds = volunteerHistory.map(v => v.event_id).filter(Boolean);
    if (eventIds.length === 0) {
      return res.json([]);
    }

    const { data: events, error: eventsError } = await supabaseNoAuth
      .from("events")
      .select(`
        *,
        event_skills (
          skill_id,
          skills (description)
        )
      `)
      .lt("end_date", new Date().toISOString())
      .in("event_id", eventIds);


    if (eventsError) throw eventsError;

    const normalized = events
      .map((event) => {
        const startDate = parseDate(event.start_date);
        const endDate = parseDate(event.end_date);

        // Extract skill descriptions
        const skills = event.event_skills?.map(es => es.skills).filter(Boolean).sort((a,b) => a.description.localeCompare(b.description)).map(s => ({ id: s.skill_id, description: s.description})) || [];
      
        return {
          id: event.event_id,
          title: event.event_name,
          description: event.event_description,
          urgency: event.event_urgency,
          location: event.location,
          image: event.event_image,
          date: { start: startDate, end: endDate },
          skills, 
        }
    });

    res.json(normalized);
    
  } catch (err) {
    console.error("Error fetching history", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory };