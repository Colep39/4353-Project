let sampleEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: {
      start: new Date(2025, 9, 29),
      end: new Date(2025, 9, 29),
    },
    urgency: "Critical",
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
    urgency: "High",
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
    urgency: "Medium",
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
    urgency: "Low",
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
  if (!newEvent || !newEvent.title) {
    return res.status(400).json({ message: "Invalid event data" });
  }

  const nextId = sampleEvents.length > 0 ? Math.max(...sampleEvents.map(e => e.id)) + 1 : 1;
  const created = { id: nextId, ...newEvent };
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

  sampleEvents[index] = { ...sampleEvents[index], ...updated };
  res.json(sampleEvents[index]);
};

const deleteEvent = (req, res) => {
    const { id } = req.params;
    const index = sampleEvents.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: "Event not found" });
    }

    const deleted = sampleEvents.splice(index, 1);
    res.json(deleted[0]);
};

module.exports = { getManageEvents, getRecommendedVolunteers, createEvent, updateEvent, deleteEvent };