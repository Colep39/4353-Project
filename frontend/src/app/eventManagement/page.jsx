"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, startOfDay, isValid } from "date-fns";

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [recommendedVolunteers, setRecommendedVolunteers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({title: '', date: { start: null, end: null }, urgency: '', description: '', image: '',});
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchedEvent, setMatchedEvent] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const minSelectableDate = addDays(new Date(), 3);

  useEffect(() => {
    fetch("http://localhost:5000/api/eventManagement").then((res) => res.json()).then((data) => setEvents(data)).catch((err) => console.error("Error fetching events:", err));
    fetch("http://localhost:5000/api/eventManagement/recommendedVolunteers").then((res) => res.json()).then((data) => setRecommendedVolunteers(data)).catch((err) => console.error("Error fetching events:", err));
  }, []);

  const resetModalState = () => {
    setSelectedEvent(null);
    setNewEvent({ title: '', date: { start: null, end: null }, urgency: '', description: '', image: '' });
    setValidationErrors({});
  };

  const handleCreateEvent = async (eventToAdd) => {
    try {
      const res = await fetch("http://localhost:5000/api/eventManagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToAdd),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const created = await res.json();
      setEvents([...events, created]);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setValidationErrors({});
    setIsModalOpen(true);
  };

const handleMatchVolunteers = (event) => {
  setMatchedEvent(event);
  setIsMatchModalOpen(true);
};

const nameRegex = /^[A-Za-z0-9 @&$\#()\[\]\-_.,'!+?%]+$/;

const validateEvent = (candidate) => {
  const errors = {};

  if (!candidate.title || String(candidate.title).trim() === '') {
    errors.title = "Event name is required.";
  } else if (!nameRegex.test(candidate.title)) {
    errors.title = "Event name contains invalid characters. Allowed: letters, numbers, spaces and common symbols (@ & $ # ( ) - _ . , ' ! + ? %).";
  }

  const start = candidate.date?.start;
  const end = candidate.date?.end;
  if (!start || !isValid(start)) {
    errors.date = "Start date is required.";
  } else if (startOfDay(start) < startOfDay(minSelectableDate)) {
    errors.date = `Start date must be ${minSelectableDate.toLocaleDateString()} or later.`;
  }

  if (!end || !isValid(end)) {
    errors.date = errors.date ? errors.date + " End date is required." : "End date is required.";
  } else if (start && startOfDay(end) < startOfDay(start)) {
    errors.date = errors.date ? errors.date + " End date cannot be before start date." : "End date cannot be before start date.";
  } else if (end && startOfDay(end) < startOfDay(minSelectableDate)) {
    errors.date = errors.date ? errors.date + ` End date must be ${minSelectableDate.toLocaleDateString()} or later.` : `End date must be ${minSelectableDate.toLocaleDateString()} or later.`;
  }

  if (!candidate.urgency || String(candidate.urgency).trim() === '') {
    errors.urgency = "Urgency is required.";
  }

  if (!candidate.description || String(candidate.description).trim() === '') {
    errors.description = "Description is required.";
  }

  if (!candidate.image || String(candidate.image).trim() === '') {
    errors.image = "Image URL or path is required.";
  }

  return errors;
};

const handleSave = () => {
  const candidate = selectedEvent ? selectedEvent : newEvent;
  const errors = validateEvent(candidate);

  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }

  if (selectedEvent) {
  fetch(`http://localhost:5000/api/eventManagement/${selectedEvent.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(selectedEvent),
  }).then((res) => {
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    }).then((updated) => {
      setEvents(events.map(ev => ev.id === updated.id ? updated : ev));
    }).catch((err) => console.error("Error updating event:", err)).finally(() => {resetModalState(); setIsModalOpen(false);});
  } else {
      handleCreateEvent(newEvent);
      resetModalState();
      setIsModalOpen(false);
    }
};

return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} title="Upcoming Events" buttonLabel="Match Volunteers" tooltip={true} onEventClick={handleEditEvent} onMatchVolunteers={handleMatchVolunteers} titleAction={
            <button className="ml-5 bg-gray-200 border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer" onClick={() => { resetModalState(); setIsModalOpen(true); }}>
              Create Event
            </button>}/>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative border border-black">
            <button onClick={() => { setIsModalOpen(false); resetModalState(); }}
              className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black">
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-4">{selectedEvent ? "Edit Event" : "Create New Event"}</h2>

            <div className="flex flex-col space-y-3">
              <div className="flex flex-col">
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
                      setValidationErrors(prev => ({ ...prev, title: undefined }));
                    }}/>
                </div>
                {validationErrors.title && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.title}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventDate" className="w-32">Event Date</label><span className="text-red-500 mr-2">*</span>
                  <DatePicker selectsRange startDate={selectedEvent ? selectedEvent.date?.start : newEvent.date?.start} endDate={selectedEvent ? selectedEvent.date?.end : newEvent.date?.end}
                    onChange={(update) => {
                      const [start, end] = update;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, date: { start, end } });
                      } else {
                        setNewEvent({ ...newEvent, date: { start, end } });
                      }
                      setValidationErrors(prev => ({ ...prev, date: undefined }));
                    }}
                    isClearable className="border px-3 py-2 rounded w-full" wrapperClassName="w-full" placeholderText={`Select a date range (${minSelectableDate.toLocaleDateString()} onwards)`} minDate={minSelectableDate}/>
                </div>
                {validationErrors.date && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.date}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventUrgency" className="w-32">Urgency</label><span className="text-red-500 mr-2">*</span>
                  <select id="eventUrgency" className="border px-3 py-2 rounded w-full"
                    value={selectedEvent ? selectedEvent.urgency : newEvent.urgency}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, urgency: value });
                      } else {
                        setNewEvent({ ...newEvent, urgency: value });
                      }
                      setValidationErrors(prev => ({ ...prev, urgency: undefined }));
                    }}>
                    <option value="" disabled hidden>Select urgency</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                {validationErrors.urgency && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.urgency}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventDescription" className="w-32">Description</label><span className="text-red-500 mr-2">*</span>
                  <textarea id="eventDescription" className="border px-3 py-2 rounded w-full"
                    value={selectedEvent ? selectedEvent.description : newEvent.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, description: value });
                      } else {
                        setNewEvent({ ...newEvent, description: value });
                      }
                      setValidationErrors(prev => ({ ...prev, description: undefined }));
                    }}
                  />
                </div>
                {validationErrors.description && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.description}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventImage" className="w-32">Event Image</label><span className="text-red-500 mr-2">*</span>
                  <input type="text" id="eventImage" placeholder="Image URL or path" className="border px-3 py-2 rounded w-full"
                    value={selectedEvent ? selectedEvent.image : newEvent.image}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, image: value });
                      } else {
                        setNewEvent({ ...newEvent, image: value });
                      }
                      setValidationErrors(prev => ({ ...prev, image: undefined }));
                    }}
                  />
                </div>
                {validationErrors.image && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.image}</div>}
              </div>

              <div className="flex justify-between items-center mt-4">
                {selectedEvent ? (
                  <button onClick={async () => {
                            try {const res = await fetch(`http://localhost:5000/api/eventManagement/${selectedEvent.id}`, {method: "DELETE",});
                              if (!res.ok) throw new Error("Failed to delete event");
                              setEvents(events.filter(ev => ev.id !== selectedEvent.id));
                            } catch (err) {
                              console.error("Error deleting event:", err);
                            } finally {
                              setIsModalOpen(false);
                              resetModalState();
                            }}} className="bg-red-600 text-white py-2 rounded hover:bg-red-500 px-4">
                    Cancel Event
                  </button>
                ) : (
                  <div className="w-24"></div>
                )}

                <div className="flex space-x-2">
                  <button onClick={handleSave} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 px-4">
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

export default EventManagement; 