"use client";
import { useState } from "react"; 
import CardGrid from '../components/events/CardGrid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const sampleVolunteerMatchingEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: {
      start: new Date(2025, 9, 29),
      end: new Date(2025, 9, 29),
    },
    urgency: "4",
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
    urgency: "3",
    description: "Help needed purging the stench of stem majors from the SEC building",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rincons Birthday Party",
    date: {
      start: new Date(2025, 10, 21),
      end: new Date(2025, 10, 21),
    },
    urgency: "2",
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
    urgency: "1",
    description: "Looking for volunteers to risk their lives eating the cafeteria food and giving honest reviews on the quality of the food being made here on campus.",
    image: "/images/events/cafe-food.jpg",
  },
];

const recommendedVolunteers = [
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

function VolunteerMatching() {
  const [events, setEvents] = useState(sampleVolunteerMatchingEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({title: '', date: { start: null, end: null }, urgency: '', description: '', image: '',});
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchedEvent, setMatchedEvent] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);

  const handleCreateEvent = () => {
    const nextId = events.length + 1;
    setEvents([
      ...events,
      {
        id: nextId,
        ...newEvent,
      },
    ]);
    setNewEvent({ title: '', date: { start: null, end: null }, urgency: '', description: '', image: '' });
    setIsModalOpen(false);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

const handleMatchVolunteers = (event) => {
  setMatchedEvent(event);
  setIsMatchModalOpen(true);
};

  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} title="Event Matching" buttonLabel="Match Volunteers" tooltip={true} onEventClick={handleEditEvent} onMatchVolunteers={handleMatchVolunteers} titleAction={
            <button className="ml-5 bg-gray-200 border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer"onClick={() => setIsModalOpen(true)}>
                Create Event
            </button>}/>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative border border-black">
            <button onClick={() => {setIsModalOpen(false); setSelectedEvent(null); setNewEvent({ title: '', date: { start: null, end: null }, urgency: '', description: '', image: '' });}} 
                    className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black">
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-4">{selectedEvent ? "Edit Event" : "Create New Event"}</h2>

            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <label htmlFor="eventName" className="w-32">Event Name</label><span className="text-red-500 mr-2">*</span>
                <input type="text" id="eventName" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.title : newEvent.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedEvent) {
                      setSelectedEvent({ ...selectedEvent, title: value });
                    } else {
                      setNewEvent({ ...newEvent, title: value });
                    }
                  }}
                />
              </div>

              <div className="flex items-center">
                <label htmlFor="eventDate" className="w-25">Event Date</label><span className="text-red-500 mr-2">*</span>
                <DatePicker selectsRange startDate={selectedEvent ? selectedEvent.date?.start : newEvent.date?.start} endDate={selectedEvent ? selectedEvent.date?.end : newEvent.date?.end}
                    onChange={(update) => {
                      const [start, end] = update;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, date: { start, end },});
                      } else {
                        setNewEvent({...newEvent, date: { start, end },});
                      }
                    }}
                    isClearable className="border px-15 py-2 rounded w-full" placeholderText="Click to choose date(s)"/>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventUrgency" className="w-32">Urgency</label><span className="text-red-500 mr-2">*</span>
                <select id="eventUrgency" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.urgency : newEvent.urgency}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedEvent) {
                      setSelectedEvent({ ...selectedEvent, urgency: value });
                    } else {
                      setNewEvent({ ...newEvent, urgency: value });
                    }
                  }}
                >
                  <option>4</option>
                  <option>3</option>
                  <option>2</option>
                  <option>1</option>
                </select>
              </div>

              <div className="flex items-center">
                <label htmlFor="eventDescription" className="w-32">Description</label><span className="text-red-500 mr-2">*</span>
                <textarea id="eventDescription" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.description : newEvent.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedEvent) {
                      setSelectedEvent({ ...selectedEvent, description: value });
                    } else {
                      setNewEvent({ ...newEvent, description: value });
                    }
                  }}
                />
              </div>

              <div className="flex items-center">
                <label htmlFor="eventImage" className="w-32">Event Image</label><span className="text-red-500 mr-2">*</span>
                <input type="text" id="eventImage" placeholder="Image URL or path" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.image : newEvent.image}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedEvent) {
                      setSelectedEvent({ ...selectedEvent, image: value });
                    } else {
                      setNewEvent({ ...newEvent, image: value });
                    }
                  }}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                {selectedEvent ? (
                  <button onClick={() => {setEvents(events.filter(ev => ev.id !== selectedEvent.id)); setIsModalOpen(false);
                      setSelectedEvent(null); setNewEvent({ title: '', date: { start: null, end: null }, urgency: '', description: '', image: '' });
                    }} className="bg-red-600 text-white py-2 rounded hover:bg-red-500 px-4">
                    Cancel Event
                  </button>
                ) : (
                  <div className="w-24"></div>
                )}

                <div className="flex space-x-2">
                  <button onClick={() => {
                      if (selectedEvent) {
                        setEvents(events.map(ev => ev.id === selectedEvent.id ? selectedEvent : ev));
                        setSelectedEvent(null);
                      } else {
                        handleCreateEvent();
                      }
                      setIsModalOpen(false);
                      setNewEvent({ title: '', date: '', urgency: '', description: '', image: '' });
                    }} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 px-4">
                    {selectedEvent ? "Save" : "Add Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMatchModalOpen && matchedEvent && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative border border-black">
            <button onClick={() => {setIsMatchModalOpen(false); setMatchedEvent(null); setSelectedVolunteers([]);}}
                    className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black">
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">Recommended Volunteers for "{matchedEvent.title}"</h2>

            <table className="w-full border border-black mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black px-2 py-1">Select</th>
                  <th className="border border-black px-2 py-1">First Name</th>
                  <th className="border border-black px-2 py-1">Email</th>
                  <th className="border border-black px-2 py-1">Location</th>
                </tr>
              </thead>
              <tbody>
                {recommendedVolunteers.map((volunteer, index) => (
                  <tr key={index}>
                    <td className="border border-black px-2 py-1 text-center">
                      <input type="checkbox" checked={selectedVolunteers.includes(volunteer)}
                        onChange={(e) => {
                          const updated = [...selectedVolunteers];
                          if (e.target.checked) {
                            updated.push(volunteer);
                          } else {
                            const idx = updated.indexOf(volunteer);
                            if (idx > -1) updated.splice(idx, 1);
                          }
                          setSelectedVolunteers(updated);
                        }}/>
                    </td>
                    <td className="border border-black px-2 py-1">{volunteer.firstName}</td>
                    <td className="border border-black px-2 py-1">{volunteer.email}</td>
                    <td className="border border-black px-2 py-1">{volunteer.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  console.log("Saved volunteers for event:", matchedEvent.title);
                  console.log("Selected Volunteers:", selectedVolunteers);
                  setIsMatchModalOpen(false);
                  setMatchedEvent(null);
                  setSelectedVolunteers([]);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VolunteerMatching; 