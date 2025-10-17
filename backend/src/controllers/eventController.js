const sampleEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: {
      start: new Date(2025, 9, 29),
      end: new Date(2025, 9, 29),
    },
    urgency: 4,
    description: "Help needed to direct traffic for the home game against Rice University. Needed from 5pm to 9pm for directing traffic in and out.",
    image: "/images/events/traffic-director.jpg",
  },
  {
    id: 2,
    title: "Soul Cleanup",
    date: {
      start: new Date(2025, 10, 1),
      end: new Date(2025, 10, 1),
    },
    urgency: 3,
    description: "Help needed cleaning the souls of the students who failed their OS exam in the Agnes Arnold auditorium because they didnt study semaphores enough",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rebuild PGH",
    date: {
      start: new Date(2025, 10, 13),
      end: new Date(2025, 10, 15),
    },
    urgency: 2,
    description: "PGH is outdated and needs to be rebuilt. Easy task should take 2 days",
    image: "/images/events/rebuild-pgh.jpg",
  },
  {
    id: 4,
    title: "Pop-Up Shop Vendor",
    date: {
      start: new Date(2025, 10, 16),
      end: new Date(2025, 10, 16),
    },
    urgency: 2,
    description: "Looking for vendors to set up tents in the green between PGH and the library, must sell allowed goods such as food, clothing, or jewelry. Must be friendly towards students and report all revenue and provide the campus 25% of total profits",
    image: "/images/events/popup-shop.jpg",
  },
];

const getEvents = (req, res) => {
    res.json(sampleEvents);
};

module.exports = { getEvents };