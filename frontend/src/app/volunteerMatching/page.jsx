"use client";
import { useState } from "react"; 
import CardGrid from '../components/events/CardGrid';

const sampleVolunteerMatchingEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: "10/29/25",
    urgency: "4",
    description: "Help needed to direct traffic for the home game against Sam Houston State University. Needed from 5pm to 9pm for directing traffic in and out.",
    image: "/images/events/traffic-director.jpg",
  },
  {
    id: 2,
    title: "Cleaning SEC",
    date: "10/11/25",
    urgency: "3",
    description: "Help needed purging the stench of stem majors from the SEC building",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rincons Birthday Party",
    date: "10/21/25",
    urgency: "2",
    description: "Help needed setting up a surprise birthday party for the goat Rincon",
    image: "/images/events/carlos-rincon.jpg",
  },
  {
    id: 4,
    title: "Meal Testing",
    date: "10/31/25",
    urgency: "1",
    description: "Looking for volunteers to risk their lives eating the cafeteria food and giving honest reviews on the quality of the food being made here on campus.",
    image: "/images/events/cafe-food.jpg",
  },
];


function VolunteerMatching() {
  const [events, setEvents] = useState(sampleVolunteerMatchingEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({title: '', date: '', urgency: '', description: '', image: '',});

    const handleCreateEvent = () => {
    const nextId = events.length + 1;
    setEvents([
      ...events,
      {
        id: nextId,
        ...newEvent,
      },
    ]);
    setNewEvent({ title: '', date: '', urgency: '', description: '', image: '' });
    setIsModalOpen(false);
  };

  return (
    <>
      <CardGrid events={events} title="Event Matching" buttonLabel="Match Volunteers" titleAction={
          <button className="ml-5 bg-gray-200 border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer"onClick={() => setIsModalOpen(true)}>
              Create Event
          </button>}
      />

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative border border-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black">
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Create New Event</h2>

            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <label htmlFor="eventName" className="w-32">Event Name</label>
                <input type="text" id="eventName" className="border px-3 py-2 rounded w-full" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}/>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventDate" className="w-32">Event Date</label>
                <input type="text" id="eventDate" placeholder="MM/DD/YY" className="border px-3 py-2 rounded w-full" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}/>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventUrgency" className="w-32">Urgency</label>
                <select id="eventUrgency" className="border px-3 py-2 rounded w-full" value={newEvent.urgency} onChange={(e) => setNewEvent({ ...newEvent, urgency: e.target.value })}>
                  <option>4</option>
                  <option>3</option>
                  <option>2</option>
                  <option>1</option>
                </select>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventDescription" className="w-32">Description</label>
                <textarea id="eventDescription" className="border px-3 py-2 rounded w-full" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}/>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventImage" className="w-32">Event Image</label>
                <input type="text" id="eventImage" placeholder="Image URL" className="border px-3 py-2 rounded w-full" value={newEvent.image} onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}/>
              </div>

              <button onClick={handleCreateEvent} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 self-end px-4">
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VolunteerMatching; 