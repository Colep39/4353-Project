"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, startOfDay, isValid } from "date-fns";
import Select from "react-select";
import { useMemo } from "react";
import { fetchWithAuth } from "../authHelper";

function EventManagement() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [events, setEvents] = useState([]);
  const [recommendedVolunteers, setRecommendedVolunteers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({title: '', location: '', date: { start: null, end: null }, urgency: 1, description: '', image: '', skill_ids: []});
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchedEvent, setMatchedEvent] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [skills, setSkills] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const minSelectableDate = addDays(new Date(), 3);

  const skillOptions = useMemo(
    () => skills.map(s => ({ value: Number(s.id), label: s.description })), 
    [skills]
  );

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "admin") {
        alert("You do not have access to this page! Please login as an admin."); // ugly change if u want
        window.location.href = "/login";
        return;
      }

      try {
        const resSkills = await fetchWithAuth(`${API_URL}/api/eventManagement/skills`);
        if (!resSkills.ok) throw new Error("Failed to fetch skills");
        const skillsData = await resSkills.json();
        setSkills(Array.isArray(skillsData) ? skillsData.sort((a, b) => a.description.localeCompare(b.description)) : []);

        const resEvents = await fetchWithAuth(`${API_URL}/api/eventManagement`);
        if (!resEvents.ok) throw new Error("Failed to fetch events");
        const eventsData = await resEvents.json();

        const eventsWithSkills = (eventsData || []).map(event => ({
          ...event,
          skills: Array.isArray(event.skills) ? event.skills : [],
          skill_ids: (event.skill_ids || []).map(id => Number(id)),
          date: {
            start: event.date?.start ? new Date(event.date.start) : null,
            end: event.date?.end ? new Date(event.date.end) : null,
          },
        }));

        setEvents(eventsWithSkills);

        const resVolunteers = await fetchWithAuth(`${API_URL}/api/eventManagement/recommendedVolunteers`);
        if (!resVolunteers.ok) throw new Error("Failed to fetch recommended volunteers");
        const volunteersData = await resVolunteers.json();
        setRecommendedVolunteers(Array.isArray(volunteersData) ? volunteersData : []);

      } catch (err) {
        console.error("Error fetching data:", err.message);
        setEvents([]);
        setRecommendedVolunteers([]);
        setSkills([]);
      }
    };

    fetchData();
  }, []);

  const resetModalState = () => {
    setSelectedEvent(null);
    setNewEvent({ title: '', location: '', date: { start: null, end: null }, urgency: 1, description: '', image: '', skill_ids: [] });
    setValidationErrors({});
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

  const validateEvent = (candidate) => {
    const errors = {};

    if (!candidate.title || candidate.title.trim().length < 3 || candidate.title.trim().length > 100) {
      errors.title = "Title must be 3–100 characters.";
    } else if (!/^[a-zA-Z0-9\s'.,!?-]+$/.test(candidate.title.trim())) {
      errors.title = "Title contains invalid characters.";
    }

    if (!candidate.location || candidate.location.trim() === '') {
      errors.location = "Location is required.";
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

    if (![1, 2, 3, 4].includes(candidate.urgency)) {
      errors.urgency = "Urgency is required.";
    }

    if (!candidate.skill_ids || candidate.skill_ids.length === 0) {
      errors.skills = "At least one skill must be selected.";
    }

    if (!candidate.description || String(candidate.description).trim() === '') {
      errors.description = "Description is required.";
    }

    if (!candidate.image || String(candidate.image).trim() === '') {
      errors.image = "Image URL or path is required.";
    }

    return errors;
  };

  const handleSave = async () => {
    const candidate = selectedEvent ? selectedEvent : newEvent;

    const errors = validateEvent(candidate);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const candidateToSend = {
      ...candidate,
      date: { start: candidate.date.start, end: candidate.date.end },
      skill_ids: candidate.skill_ids || [],
    };

    try {
      if (selectedEvent) {
        const res = await fetchWithAuth(`${API_URL}/api/eventManagement/${selectedEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(candidateToSend),
        });
        if (!res.ok) throw new Error("Failed to update event");

        const updated = await res.json();
        updated.date.start = new Date(updated.date.start);
        updated.date.end = new Date(updated.date.end);
        setEvents(events.map(ev => ev.id === updated.id ? updated : ev));
      } else {
        const res = await fetchWithAuth(`${API_URL}/api/eventManagement`, {
          method: "POST",
          body: JSON.stringify(candidateToSend),
        });
        if (!res.ok) throw new Error("Failed to create event");

        const created = await res.json();
        created.date.start = new Date(created.date.start);
        created.date.end = new Date(created.date.end);
        setEvents([...events, created]);
      }
    } catch (err) {
      console.error("Error saving event:", err);
    } finally {
      resetModalState();
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} title="Upcoming Events" buttonLabel="Match Volunteers" tooltip={true} onEventClick={handleEditEvent} onMatchVolunteers={handleMatchVolunteers} titleAction={
            <button className="ml-5 bg-white border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 cursor-pointer" onClick={() => { resetModalState(); setIsModalOpen(true); }}>
              Create Event
            </button>}/>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative border border-black">
            <button onClick={() => { setIsModalOpen(false); resetModalState(); }}
              className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black cursor-pointer">
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-4">{selectedEvent ? "Edit Event" : "Create New Event"}</h2>

            <div className="flex flex-col space-y-3">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventName" className="w-32">Event Name</label><span className="text-red-500 mr-2">*</span>
                  <input type="text" id="eventName" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.title : newEvent.title} onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, title: value });
                      else setNewEvent({ ...newEvent, title: value });
                      setValidationErrors(prev => ({ ...prev, title: undefined }));
                    }}/>
                </div>
                {validationErrors.title && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.title}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventLocation" className="w-32">Location</label><span className="text-red-500 mr-2">*</span>
                  <input type="text" id="eventLocation" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.location || '' : newEvent.location}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, location: value });
                      else setNewEvent({ ...newEvent, location: value });
                    }}
                    placeholder="Enter event location"/>
                </div>
                {validationErrors.location && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.location}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventDate" className="w-32">Event Date</label><span className="text-red-500 mr-2">*</span>
                  <DatePicker selectsRange startDate={selectedEvent ? selectedEvent.date?.start : newEvent.date?.start} endDate={selectedEvent ? selectedEvent.date?.end : newEvent.date?.end}
                    onChange={(update) => {
                      const [start, end] = update;
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, date: { start, end } });
                      else setNewEvent({ ...newEvent, date: { start, end } });
                      setValidationErrors(prev => ({ ...prev, date: undefined }));
                    }} isClearable className="border px-3 py-2 rounded w-full" wrapperClassName="w-full" placeholderText={`Select a date range (${minSelectableDate.toLocaleDateString()} onwards)`}
                    minDate={minSelectableDate}/>
                </div>
                {validationErrors.date && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.date}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventUrgency" className="w-32">Urgency</label><span className="text-red-500 mr-2">*</span>
                  <select id="eventUrgency" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.urgency : newEvent.urgency || 1} onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, urgency: value });
                      else setNewEvent({ ...newEvent, urgency: value });
                      setValidationErrors(prev => ({ ...prev, urgency: undefined }));
                    }}>
                    <option value={4}>Critical</option>
                    <option value={3}>High</option>
                    <option value={2}>Medium</option>
                    <option value={1}>Low</option>
                  </select>
                </div>
                {validationErrors.urgency && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.urgency}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventSkills" className="w-32">Skills</label><span className="text-red-500 mr-2">*</span>
                  <Select isMulti options={skillOptions} onChange={(selectedOptions) => {
                      const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, skill_ids: ids });
                      else setNewEvent({ ...newEvent, skill_ids: ids });
                    }} className="w-full border-black border rounded" classNamePrefix="select" placeholder="Select required skills" closeMenuOnSelect={false}
                    isDisabled={skills.length === 0} noOptionsMessage={() => "Loading skills..."}/>
                </div>
                {validationErrors.skills && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.skills}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventDescription" className="w-32">Description</label><span className="text-red-500 mr-2">*</span>
                  <textarea id="eventDescription" className="border px-3 py-2 rounded w-full"
                    value={selectedEvent ? selectedEvent.description : newEvent.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, description: value });
                      else setNewEvent({ ...newEvent, description: value });
                      setValidationErrors(prev => ({ ...prev, description: undefined }));
                    }}/>
                </div>
                {validationErrors.description && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.description}</div>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <label htmlFor="eventImage" className="w-32">Event Image</label><span className="text-red-500 mr-2">*</span>
                  <input type="text" id="eventImage" placeholder="Image URL or path" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.image : newEvent.image}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedEvent) setSelectedEvent({ ...selectedEvent, image: value });
                      else setNewEvent({ ...newEvent, image: value });
                      setValidationErrors(prev => ({ ...prev, image: undefined }));
                    }}/>
                </div>
                {validationErrors.image && <div className="text-red-600 text-sm mt-1 pl-36">{validationErrors.image}</div>}
              </div>

              <div className="flex justify-between items-center mt-4">
                {selectedEvent ? (
                  <button onClick={() => {
                      setEventToDelete(selectedEvent);
                      setIsConfirmOpen(true);
                    }} className="bg-red-600 text-white py-2 rounded hover:bg-red-500 px-4">
                    Cancel Event
                  </button>) : <div className="w-24"></div>}
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 px-4 cursor-pointer">
                    {selectedEvent ? "Save" : "Add Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && eventToDelete && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-[60]">
          <div className="bg-white border border-black rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to <span className="font-semibold text-red-600">cancel {eventToDelete.title}</span> event?<br />
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Keep Event</button>
              <button onClick={async () => {
                  try {
                    const res = await fetchWithAuth(
                      `${API_URL}/api/eventManagement/${eventToDelete.id}`,
                      { method: "DELETE" }
                    );
                    if (!res.ok) throw new Error("Failed to delete event");

                    setEvents(events.filter(ev => ev.id !== eventToDelete.id));
                  } catch (err) {
                    console.error("Error deleting event:", err);
                    alert("Something went wrong while deleting the event.");
                  } finally {
                    setIsConfirmOpen(false);
                    setIsModalOpen(false);
                    setEventToDelete(null);
                    resetModalState();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
                Yes, Delete
              </button>
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
                          if (e.target.checked) updated.push(volunteer);
                          else {
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