require("dotenv").config();
const supabaseNoAuth = require("../supabaseNoAuth")

const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseNoAuth
      .from("events")
      .select(`
        *,
        event_skills (
          skill_id,
          skills (description)
        )
      `)
      .gte("start_date", new Date().toISOString())

    if (error) throw error;

    const { data: volunteerData, error: volunteerError } = await supabaseNoAuth
      .from("volunteer_history")
      .select("event_id")
      .eq("user_id", userId);

    if (volunteerError) throw volunteerError;

    const joinedEventIds = new Set(volunteerData.map(v => v.event_id));

    const normalized = data
      .map((event) => {
        const startDate = parseDate(event.start_date);
        const endDate = parseDate(event.end_date) || startDate;

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
          isJoined: joinedEventIds.has(event.event_id),
        };
      });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
};

const joinEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: "Missing event_id" });
    }

    const { data: existing, error: checkError } = await supabaseNoAuth
      .from("volunteer_history")
      .select("volunteer_history_id")
      .eq("user_id", userId)
      .eq("event_id", event_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return res.status(409).json({ message: "Already joined this event" });
    }

    const { data, error } = await supabaseNoAuth
      .from("volunteer_history")
      .insert([{ user_id: userId, event_id }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Joined event successfully", data });
  } catch (err) {
    console.error("Error joining event:", err);
    res.status(500).json({ error: err.message });
  }
};

const leaveEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const event_id = req.body?.event_id || req.query?.event_id; 

    if (!event_id) {
      return res.status(400).json({ error: "Missing event_id" });
    }

    const { error } = await supabaseNoAuth
      .from("volunteer_history")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", event_id);

    if (error) throw error;

    res.status(200).json({ message: "Left event successfully" });
  } catch (err) {
    console.error("Error leaving event:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEvents, joinEvent, leaveEvent };
