let sampleEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: {
      start: new Date(2025, 9, 29),
      end: new Date(2025, 9, 29),
    },
    urgency: 4,
    description: "Help needed to direct traffic for the home game against Sam Houston State University. Needed from 5pm to 9pm for directing traffic in and out.",
    image: "/images/events/traffic-director.jpg",
  },
  {
    id: 2,
    title: "Cleaning SEC",
    date: {
      start: new Date(2025, 10, 11),
      end: new Date(2025, 10, 11),
    },
    urgency: 3,
    description: "Help needed purging the stench of stem majors from the SEC building",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rincon's Birthday Party",
    date: {
      start: new Date(2025, 10, 21),
      end: new Date(2025, 10, 21),
    },
    urgency: 2,
    description: "Help needed setting up a surprise birthday party for the goat Rincon",
    image: "/images/events/carlos-rincon.jpg",
  },
  {
    id: 4,
    title: "Meal Testing",
    date: {
      start: new Date(2025, 10, 31),
      end: new Date(2025, 10, 31),
    },
    urgency: 1,
    description: "Looking for volunteers to risk their lives eating the cafeteria food and giving honest reviews on the quality of the food being made here on campus.",
    image: "/images/events/cafe-food.jpg",
  },
];

let recommendedVolunteers = [
  {
    firstName: "Alice Malice",
    email: "alicemalice@example.com",
    location: "Houston",
  },
  {
    firstName: "Bob Job",
    email: "bobjob@example.com",
    location: "Dallas",
  },
  {
    firstName: "Charlie Harley",
    email: "charlieharley@example.com",
    location: "Austin",
  },
  {
    firstName: "Denise Quenise",
    email: "denisequenise@example.com",
    location: "San Antonio",
  },
];

const getManageEvents = (req, res) => {
    res.json(sampleEvents);
};

const getRecommendedVolunteers = (req, res) => {
    res.json(recommendedVolunteers)
};

const createEvent = (req, res) => {
  const newEvent = req.body;

  if (!newEvent || !newEvent.title || !newEvent.urgency || !newEvent.description || !newEvent.image || !newEvent.date || !newEvent.date.start || !newEvent.date.end) {
    return res.status(400).json({ message: "Invalid event data" });
  }

  const titleRegex = /^[a-zA-Z0-9\s'.,!?-]{3,100}$/;
  if (!titleRegex.test(newEvent.title)) {
    return res.status(400).json({message: "Invalid title format (3–100 chars, letters/numbers/punctuation only)",});
  }

  const urgencyInt = parseInt(newEvent.urgency);
  if (isNaN(urgencyInt) || urgencyInt < 1 || urgencyInt > 4) {
    return res.status(400).json({message: "Urgency must be an integer between 1 and 4",});
  }

  const sanitizeInput = (str) => { return str.replace(/['";]/g, "").replace(/<[^>]*>/g, "") .trim(); };

  const cleanTitle = sanitizeInput(newEvent.title);
  const cleanDescription = sanitizeInput(newEvent.description);
  const cleanImage = sanitizeInput(newEvent.image);

  if (cleanDescription.length > 1000) {
    return res.status(400).json({message: "Description too long (max 1000 characters)",});
  }

  if (cleanImage.length > 100) {
    return res.status(400).json({message: "Image URL too long (max 100 characters)",});
  }

  const startDate = new Date(newEvent.date.start);
  const endDate = new Date(newEvent.date.end);
  const today = new Date();
  const minStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (startDate < minStart) {
    return res.status(400).json({
      message: "Event start date must be at least 3 days from today",
    });
  }

  if (endDate < startDate) {
    return res.status(400).json({
      message: "Event end date cannot be before start date",
    });
  }

  const nextId = sampleEvents.length > 0 ? Math.max(...sampleEvents.map((e) => e.id)) + 1 : 1;

  const created = {id: nextId, title: cleanTitle, urgency: urgencyInt, description: cleanDescription, image: cleanImage, date: {start: startDate.toISOString(), end: endDate.toISOString(),},};

  sampleEvents.push(created);
  res.status(201).json(created);
};


const updateEvent = (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const index = sampleEvents.findIndex(e => e.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (!updated || !updated.title || !updated.urgency || !updated.description || !updated.image || !updated.date || !updated.date.start || !updated.date.end) {
    return res.status(400).json({ message: "Invalid event data" });
  }

  const titleRegex = /^[a-zA-Z0-9\s'.,!?-]{3,100}$/;
  if (!titleRegex.test(updated.title)) {
    return res.status(400).json({message: "Invalid title format (3–100 chars, letters/numbers/punctuation only)",});
  }

  const urgencyInt = parseInt(updated.urgency);
  if (isNaN(urgencyInt) || urgencyInt < 1 || urgencyInt > 4) {
    return res.status(400).json({ message: "Urgency must be an integer between 1 and 4" });
  }

  const sanitizeInput = (str) => {
    return str.replace(/['";]/g, "").replace(/<[^>]*>/g, "") .trim();
  };

  const cleanDescription = sanitizeInput(updated.description);
  const cleanImage = sanitizeInput(updated.image);

  if (cleanDescription.length > 1000) {
    return res.status(400).json({ message: "Description too long (max 1000 characters)" });
  }

  if (cleanImage.length > 100) {
    return res.status(400).json({ message: "Image URL too long (max 100 characters)" });
  }

  const startDate = new Date(updated.date.start);
  const endDate = new Date(updated.date.end);
  const today = new Date();
  const minStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (startDate < minStart) {
    return res.status(400).json({
      message: "Event start date must be at least 3 days from today",
    });
  }

  if (endDate < startDate) {
    return res.status(400).json({
      message: "Event end date cannot be before start date",
    });
  }
  const existingEvent = sampleEvents[index];
  const updatedEvent = {id: existingEvent.id, title: updated.title.trim(), urgency: urgencyInt, description: cleanDescription, image: cleanImage, date: { start: startDate.toISOString(), end: endDate.toISOString(),},
  };

  sampleEvents[index] = updatedEvent;
  res.json(updatedEvent);
};

const deleteEvent = (req, res) => {
    const { id } = req.params;
    const index = sampleEvents.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: "Event not found" });
    }

    const [deletedEvent] = sampleEvents.splice(index, 1);

    res.status(200).json(deletedEvent);
};

module.exports = { getManageEvents, getRecommendedVolunteers, createEvent, updateEvent, deleteEvent };