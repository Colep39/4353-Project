const supabaseNoAuth = require("../supabaseNoAuth")

const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

const sanitizeInput = (str) =>
  str.replace(/['";]/g, "").replace(/<[^>]*>/g, "").trim();

const getManageEvents = async (req, res) => {
  try {
    const { data: events, error } = await supabaseNoAuth
      .from("events")
      .select(`
        *,
        event_skills (
          skill:skills (
            skill_id,
            description
          )
        )
      `)
      .gte("end_date", "NOW()")
      .order("start_date", { ascending: true });

    if (error) throw error;

    const formattedEvents = events.map(event => {
      const skillsMapped = (event.event_skills || [])
        .map(es => es.skill)
        .filter(Boolean);

      return {
        id: event.event_id,
        title: event.event_name,
        urgency: event.event_urgency,
        description: event.event_description,
        image: event.event_image,
        location: event.location || "Unknown location",
        date: {
          start: parseDate(event.start_date),
          end: parseDate(event.end_date)
        },
        skills: skillsMapped,
        skill_ids: skillsMapped.map(s => s.id),
      };
    });

    res.json(formattedEvents);
  } catch (err) {
    console.error("Unexpected error in getManageEvents:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSkills = async (req, res) => {
  try {
    const { data, error } = await supabaseNoAuth.from("skills").select("*");
    if (error) {
      console.error("Error fetching skills:", error);
      return res.status(500).json({ message: "Failed to fetch skills" });
    }

    const formattedSkills = data.map(skill => ({
      id: skill.skill_id, 
      description: skill.description
    }));

    res.json(formattedSkills);
  } catch (err) {
    console.error("Unexpected error in getSkills:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecommendedVolunteers = async (req, res) => {
  try {
    const eventId = req.query.event_id;
    if (!eventId) return res.status(400).json({ message: "event_id is required" });

    const { data: event, error: eventError } = await supabaseNoAuth
      .from("events")
      .select("event_id, location, start_date")
      .eq("event_id", eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) return res.status(404).json({ message: "Event not found" });

    const [eventCity, eventStateCode] = (event.location || "").split(",").map(s => s.trim());
    const eventCityTrimmed = eventCity?.toLowerCase();
    const eventStateTrimmed = eventStateCode?.toLowerCase();
    const eventStartKey = new Date(event.start_date).toISOString().split("T")[0];

    const { data: eventSkills, error: eventSkillsError } = await supabaseNoAuth
      .from("event_skills")
      .select("skill_id")
      .eq("event_id", eventId);

    if (eventSkillsError) throw eventSkillsError;

    const requiredSkillIds = new Set(eventSkills.map(s => s.skill_id));

    const { data: profiles, error: profileError } = await supabaseNoAuth
      .from("user_profile")
      .select(`user_id, full_name, city, states!user_profile_state_id_fkey (state_code), availability`)
      .not("full_name", "is", null)
      .not("city", "is", null)
      .not("state_id", "is", null)
      .not("zipcode", "is", null)
      .not("availability", "is", null)
      .eq("role", "volunteer");

    if (profileError) throw profileError;

    const { data: userSkills, error: userSkillsError } = await supabaseNoAuth
      .from("user_skills")
      .select("user_id, skill_id");
    if (userSkillsError) throw userSkillsError;

    const skillsMap = new Map();
    for (const us of userSkills) {
      if (!skillsMap.has(us.user_id)) skillsMap.set(us.user_id, []);
      skillsMap.get(us.user_id).push(us.skill_id);
    }

    const { data: emails, error: emailError } = await supabaseNoAuth.from("user_emails").select("user_id, email");
    if (emailError) throw emailError;
    const emailMap = new Map(emails.map(u => [u.user_id, u.email]));

    const { data: recommended, error: recommendedError } = await supabaseNoAuth
      .from("recommended_events")
      .select("user_id")
      .eq("event_id", eventId);
    if (recommendedError) throw recommendedError;

    const recommendedSet = new Set((recommended || []).map(r => r.user_id));

    const formatted = (profiles || []).map(v => {
      let points = 0;
      if (v.states?.state_code?.trim().toLowerCase() === eventStateTrimmed) points += 1;
      if (v.city?.trim().toLowerCase() === eventCityTrimmed) points += 1;

      const availableDates = (v.availability || []).map(dateStr => {
        return new Date(dateStr).toISOString().split("T")[0];
      });

      const isAvailable = availableDates.includes(eventStartKey);

      if (!isAvailable) {
        points = 0;
      }

      const volunteerSkills = skillsMap.get(v.user_id) || [];
      const matchingSkillsCount = volunteerSkills.filter(skillId =>
        requiredSkillIds.has(skillId)
      ).length;

      points += matchingSkillsCount;

      return {
        id: v.user_id,
        name: v.full_name ?? "No name",
        email: emailMap.get(v.user_id) ?? "No email",
        location: v.city || "Unknown",
        points,
        isRecommended: recommendedSet.has(v.user_id), 
      };
    });

    const filtered = formatted.filter(v => v.points > 0).sort((a, b) => b.points - a.points).slice(0, 10);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recommended volunteers", details: err.message });
  }
};

const createEvent = async (req, res) => {
  const newEvent = req.body;

  try {
    if (!newEvent.title || !newEvent.description || !newEvent.location || !newEvent.urgency || !newEvent.image || !newEvent.date?.start || !newEvent.date?.end) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data: createdEvent, error: eventError } = await supabaseNoAuth
      .from("events")
      .insert([{
        event_name: sanitizeInput(newEvent.title),
        event_description: sanitizeInput(newEvent.description),
        location: sanitizeInput(newEvent.location),
        event_urgency: newEvent.urgency,
        event_image: sanitizeInput(newEvent.image),
        start_date: new Date(newEvent.date.start).toISOString(),
        end_date: new Date(newEvent.date.end).toISOString(),
      }])
      .select()
      .single();

    if (eventError) throw eventError;

    const eventId = createdEvent.event_id;

    if (Array.isArray(newEvent.skill_ids) && newEvent.skill_ids.length > 0) {
      const skillRows = newEvent.skill_ids.map(skill_id => ({
        event_id: eventId,
        skill_id: Number(skill_id),
      }));

      const { error: skillsError } = await supabaseNoAuth
        .from("event_skills")
        .insert(skillRows);

      if (skillsError) throw skillsError;
    }

    const { data: eventWithSkills, error: fetchError } = await supabaseNoAuth
      .from("events")
      .select(`
        *,
        event_skills (
          skill:skills (
            skill_id,
            description
          )
        )
      `)
      .eq("event_id", eventId)
      .single();

    if (fetchError) throw fetchError;

    const skillsMapped = (eventWithSkills.event_skills || [])
      .map(es => es.skill)
      .filter(Boolean)
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(s => ({ id: s.skill_id, description: s.description }));

    res.status(201).json({
      id: eventWithSkills.event_id,
      title: sanitizeInput(eventWithSkills.event_name),
      description: sanitizeInput(eventWithSkills.event_description),
      image: sanitizeInput(eventWithSkills.event_image),
      urgency: eventWithSkills.event_urgency,
      location: sanitizeInput(eventWithSkills.location),
      date: {
        start: eventWithSkills.start_date,
        end: eventWithSkills.end_date,
      },
      skills: skillsMapped,
    });

  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: err.message || "Error creating event" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id); 
    const updated = req.body;

    console.log("updateEvent request body:", updated);

    const { data: existingEvent, error: existError } = await supabaseNoAuth
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (existError || !existingEvent) {
      console.error("Event not found:", existError);
      return res.status(404).json({ message: "Event not found" });
    }

    const { data: updatedEvent, error: updateError } = await supabaseNoAuth
      .from("events")
      .update({
        event_name: sanitizeInput(updated.title),
        event_description: sanitizeInput(updated.description),
        location: sanitizeInput(updated.location),
        event_urgency: updated.urgency,
        event_image: sanitizeInput(updated.image),
        start_date: updated.date?.start ? updated.date.start : null,
        end_date: updated.date?.end ? updated.date.end : null,
      })
      .eq("event_id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({ message: updateError.message });
    }

    const { error: deleteSkillsError } = await supabaseNoAuth
      .from("event_skills")
      .delete()
      .eq("event_id", eventId);

    if (deleteSkillsError) {
      console.error("Supabase delete skills error:", deleteSkillsError);
      return res.status(500).json({ message: deleteSkillsError.message });
    }

    if (Array.isArray(updated.skill_ids) && updated.skill_ids.length > 0) {
      const skillRows = updated.skill_ids.map(skill_id => ({
        event_id: eventId,
        skill_id: Number(skill_id),
      }));

      const { error: insertSkillsError } = await supabaseNoAuth
        .from("event_skills")
        .insert(skillRows);

      if (insertSkillsError) {
        console.error("Supabase insert skills error:", insertSkillsError);
        return res.status(500).json({ message: insertSkillsError.message });
      }
    }

    const { data: eventWithSkills, error: fetchError } = await supabaseNoAuth
      .from("events")
      .select(`
        *,
        event_skills (
          skill:skills (
            skill_id,
            description
          )
        )
      `)
      .eq("event_id", eventId)
      .single();

    if (fetchError) {
      console.error("Supabase fetch after update error:", fetchError);
      return res.status(500).json({ message: fetchError.message });
    }

    const skillsMapped = (eventWithSkills.event_skills || [])
      .map(es => es.skill)
      .filter(Boolean)
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(s => ({ id: s.skill_id, description: s.description }));

    res.json({
      id: eventWithSkills.event_id,
      title: sanitizeInput(eventWithSkills.event_name),
      description: sanitizeInput(eventWithSkills.event_description),
      image: sanitizeInput(eventWithSkills.event_image),
      urgency: eventWithSkills.event_urgency,
      location: sanitizeInput(eventWithSkills.location),
      date: {
        start: new Date(eventWithSkills.start_date).toISOString(),
        end: new Date(eventWithSkills.end_date).toISOString(),
      },
      skills: skillsMapped,
    });

  } catch (err) {
    console.error("Unexpected error updating event:", err);
    res.status(500).json({ message: err.message || "Error updating event" });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const { error: deleteSkillsError } = await supabaseNoAuth
      .from("event_skills")
      .delete()
      .eq("event_id", id);

    if (deleteSkillsError) throw deleteSkillsError;

    const { data: deletedEvent, error: deleteEventError } = await supabaseNoAuth
      .from("events")
      .delete()
      .eq("event_id", id)
      .select()
      .single();

    if (deleteEventError || !deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      id: deletedEvent.event_id,
      title: deletedEvent.event_name,
      description: deletedEvent.event_description,
      image: deletedEvent.event_image,
      urgency: deletedEvent.event_urgency,
      location: deletedEvent.location,
      date: {
        start: deletedEvent.start_date,
        end: deletedEvent.end_date,
      },
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event" });
  }
};

const uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const supabase = supabaseNoAuth;
    const file = req.file;
    const uniqueName = `${Date.now()}-${file.originalname}`;
    const filePath = `event-images/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("event-images").getPublicUrl(filePath);

    return res.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload image" });
  }
};

const saveRecommendedVolunteers = async (req, res) => {
  try {
    const { event_id, user_ids } = req.body;

    if (!event_id || !Array.isArray(user_ids)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Step 1: Clear any existing recommendations for this event
    const { error: deleteError } = await supabaseNoAuth
      .from("recommended_events")
      .delete()
      .eq("event_id", event_id);

    if (deleteError) {
      console.error("Error clearing old recommendations:", deleteError);
      return res.status(500).json({ message: "Failed to clear old recommendations" });
    }

    if (user_ids.length > 0) {
      const insertRows = user_ids.map((user_id) => ({event_id, user_id,}));

      const { error: insertError } = await supabaseNoAuth
        .from("recommended_events")
        .insert(insertRows);

      if (insertError) {
        console.error("Error inserting recommendations:", insertError);
        return res.status(500).json({ message: "Failed to save recommendations" });
      }
    }

    res.status(200).json({ message: "Recommendations updated successfully" });
  } catch (err) {
    console.error("🔥 Error saving recommended volunteers:", err);
    res.status(500).json({
      message: "Failed to save recommended volunteers",
      details: err.message,
    });
  }
};

module.exports = {
  getManageEvents,
  getRecommendedVolunteers,
  createEvent,
  updateEvent,
  deleteEvent,
  getSkills,
  uploadEventImage,
  saveRecommendedVolunteers,
};
