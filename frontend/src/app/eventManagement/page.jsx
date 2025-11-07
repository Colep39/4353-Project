"use client";
import { useState, useEffect, useMemo } from "react"; 
import CardGrid from '../components/events/CardGrid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, startOfDay, isValid } from "date-fns";
import Select from "react-select";
import { fetchWithAuth } from "../authHelper";
import { createPortal } from "react-dom";

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
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);

      try {
        const [resSkills, resEvents] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/eventManagement/skills`),
          fetchWithAuth(`${API_URL}/api/eventManagement`),
        ]);

        if (!resSkills.ok) throw new Error("Failed to fetch skills");
        if (!resEvents.ok) throw new Error("Failed to fetch events"); 

        const skillsData = await resSkills.json();
        setSkills(Array.isArray(skillsData) ? skillsData.sort((a, b) => a.description.localeCompare(b.description)) : []);

        const eventsData = await resEvents.json(); 
        setEvents(eventsData);

      } catch (err) {
        console.error("Error fetching data:", err.message);
        setEvents([]);
        setRecommendedVolunteers([]);
        setSkills([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

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

  const handleMatchVolunteers = async (event) => {
    setMatchedEvent(event);
    setIsMatchModalOpen(true);

    try {
      const res = await fetchWithAuth(`${API_URL}/api/eventManagement/recommendedVolunteers?event_id=${event.id}`);
      if (!res.ok) throw new Error("Failed to fetch recommended volunteers");
      const data = await res.json();
      setRecommendedVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setRecommendedVolunteers([]);
    }
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
    } else if (!/^[A-Za-z\s'.-]{1,50}, [A-Za-z]{2}$/.test(candidate.location.trim())) {
      errors.location = "Location must be in the format 'City, ST' (e.g., Austin, TX).";
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

  const handleImageUpload = async (file, setEventFn) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetchWithAuth(`${API_URL}/api/eventManagement/upload`, {
      method: "POST",
      body: formData, 
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to upload image: ${errText}`);
    }

    const { url } = await res.json();
    setEventFn(prev => ({ ...prev, image: url }));
  } catch (err) {
    console.error("Error uploading image:", err);
    alert("Failed to upload image");
  }
};

  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} title="Upcoming Events" isLoading={isLoading} buttonLabel="Match Volunteers" tooltip={true} onEventClick={handleEditEvent} onMatchVolunteers={handleMatchVolunteers} titleAction={
            <button className="ml-5 bg-white border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 cursor-pointer" onClick={() => { resetModalState(); setIsModalOpen(true); }}>
              Create Event
            </button>}/>
      </div>

      {isModalOpen &&
        createPortal (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-black w-full max-w-6xl mt-20 mb-20 p-6 max-h-[90vh] relative">
              <button onClick={() => { setIsModalOpen(false); resetModalState(); }} className="absolute top-3 right-3 text-xl font-bold text-gray-600 hover:text-black cursor-pointer">
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-6">{selectedEvent ? "Edit Event" : "Create New Event"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <label htmlFor="eventName" className="font-medium">Event Name <span className="text-red-500">*</span></label>
                    <input type="text" id="eventName" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.title : newEvent.title} onChange={(e) => {
                        const value = e.target.value;
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, title: value }) : setNewEvent({ ...newEvent, title: value });
                        setValidationErrors(prev => ({ ...prev, title: undefined }));
                      }}/>
                    {validationErrors.title && <div className="text-red-600 text-sm mt-1">{validationErrors.title}</div>}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="eventLocation" className="font-medium">Location <span className="text-red-500">*</span></label>
                    <input type="text" id="eventLocation" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.location || '' : newEvent.location} onChange={(e) => {
                        const value = e.target.value;
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, location: value }) : setNewEvent({ ...newEvent, location: value });
                      }} placeholder="Format: City, ST" pattern="^[A-Za-z][A-Za-z\s'.-]{0,49}, [A-Za-z]{2}$" title="Format: City, ST (e.g., Austin, TX)"/>
                    {validationErrors.location && <div className="text-red-600 text-sm mt-1">{validationErrors.location}</div>}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="eventDate" className="font-medium">Event Date <span className="text-red-500">*</span></label>
                    <DatePicker selectsRange startDate={selectedEvent ? selectedEvent.date?.start : newEvent.date?.start} endDate={selectedEvent ? selectedEvent.date?.end : newEvent.date?.end} onChange={(update) => {
                        const [start, end] = update;
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, date: { start, end } }) : setNewEvent({ ...newEvent, date: { start, end } });
                        setValidationErrors(prev => ({ ...prev, date: undefined }));
                      }} isClearable className="border px-3 py-2 rounded w-full" wrapperClassName="w-full" placeholderText={`Select a date range (${minSelectableDate.toLocaleDateString()} onwards)`} minDate={minSelectableDate}/>
                    {validationErrors.date && <div className="text-red-600 text-sm mt-1">{validationErrors.date}</div>}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="eventUrgency" className="font-medium">Urgency <span className="text-red-500">*</span></label>
                    <select id="eventUrgency" className="border px-3 py-2 rounded w-full" value={selectedEvent ? selectedEvent.urgency : newEvent.urgency || 1} onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, urgency: value }) : setNewEvent({ ...newEvent, urgency: value });
                        setValidationErrors(prev => ({ ...prev, urgency: undefined }));
                      }}>
                      <option value={4}>Critical</option>
                      <option value={3}>High</option>
                      <option value={2}>Medium</option>
                      <option value={1}>Low</option>
                    </select>
                    {validationErrors.urgency && <div className="text-red-600 text-sm mt-1">{validationErrors.urgency}</div>}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="eventDescription" className="font-medium">Description <span className="text-red-500">*</span></label>
                    <textarea id="eventDescription" className="border px-3 py-2 rounded w-full resize-none" maxLength={400} value={selectedEvent ? selectedEvent.description : newEvent.description} onChange={(e) => {
                        const value = e.target.value;
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, description: value }) : setNewEvent({ ...newEvent, description: value });
                        setValidationErrors(prev => ({ ...prev, description: undefined }));
                      }}/>
                    {validationErrors.description && <div className="text-red-600 text-sm mt-1">{validationErrors.description}</div>}
                  </div>
                </div> 
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <label htmlFor="eventSkills" className="font-medium">
                      Skills <span className="text-red-500">*</span>
                    </label>
                    <Select isMulti options={skillOptions} onChange={(selectedOptions) => {
                        const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                        selectedEvent ? setSelectedEvent({ ...selectedEvent, skill_ids: ids }) : setNewEvent({ ...newEvent, skill_ids: ids });
                      }} className="w-full border-black border rounded" classNamePrefix="select" placeholder="Select required skills" closeMenuOnSelect={false} isDisabled={skills.length === 0} noOptionsMessage={() => "Loading skills..."}
                      styles={{multiValue: (base) => ({ ...base, maxHeight: '2.5rem', overflowY: 'auto' }), multiValueLabel: (base) => ({ ...base, whiteSpace: 'normal' }), valueContainer: (base) => ({ ...base, maxHeight: '6rem', overflowY: 'auto' })}}/>
                    {validationErrors.skills && <div className="text-red-600 text-sm mt-1">{validationErrors.skills}</div>}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="eventImage" className="font-medium">Event Image <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/*" id="eventImage" className="border px-3 py-2 rounded w-full" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          selectedEvent ? handleImageUpload(file, setSelectedEvent) : handleImageUpload(file, setNewEvent);
                          setValidationErrors(prev => ({ ...prev, image: undefined }));
                        }
                      }}/>
                    {(selectedEvent?.image || newEvent.image) && (
                      <div className="mt-2">
                        <img src={selectedEvent ? selectedEvent.image : newEvent.image} alt="Event preview" className="rounded-lg border w-full h-40 object-cover"/>
                      </div>
                    )}
                    {validationErrors.image && <div className="text-red-600 text-sm mt-1">{validationErrors.image}</div>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 bg-white pt-4">
                {selectedEvent ? (
                  <button onClick={() => { setEventToDelete(selectedEvent); setIsConfirmOpen(true); }} className="bg-red-600 text-white py-2 rounded hover:bg-red-500 px-4">
                    Cancel Event
                  </button>
                ) : <div className="w-24"></div>}
                  <button onClick={handleSave} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500 px-4 cursor-pointer">
                  {selectedEvent ? "Save" : "Add Event"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

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
            <button onClick={() => {setIsMatchModalOpen(false); setMatchedEvent(null); setSelectedVolunteers([]);}} className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-black">
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">Recommended Volunteers for "{matchedEvent.title}"</h2>

            {recommendedVolunteers.length > 0 ? (
              <>
                <table className="w-full border border-black mb-4">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black px-2 py-1">Select</th>
                      <th className="border border-black px-2 py-1">First Name</th>
                      <th className="border border-black px-2 py-1">Email</th>
                      <th className="border border-black px-2 py-1">Location</th>
                      <th className="border border-black px-2 py-1">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendedVolunteers.map((volunteer, index) => (
                      <tr key={index}>
                        <td className="border border-black px-2 py-1 text-center">
                          <input type="checkbox" checked={selectedVolunteers.includes(volunteer)} onChange={(e) => {
                              const updated = [...selectedVolunteers];
                              if (e.target.checked) updated.push(volunteer);
                              else {
                                const idx = updated.indexOf(volunteer);
                                if (idx > -1) updated.splice(idx, 1);
                              }
                              setSelectedVolunteers(updated);
                            }}/>
                        </td>
                        <td className="border border-black px-2 py-1">{volunteer.name}</td>
                        <td className="border border-black px-2 py-1">{volunteer.email}</td>
                        <td className="border border-black px-2 py-1">{volunteer.location}</td>
                        <td className="border border-black px-2 py-1 text-center">
                          {volunteer.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <button onClick={async () => {
                      try {
                        console.log("Selected volunteer objects:", selectedVolunteers);
                        const payload = {
                          event_id: matchedEvent.id,
                          user_ids: selectedVolunteers.map(v => v.id),
                        };

                        const res = await fetchWithAuth(`${API_URL}/api/eventManagement/recommendedVolunteers`, {
                          method: "POST",
                          body: JSON.stringify(payload),
                        });

                        if (!res.ok) {
                          throw new Error("Failed to save volunteer recommendations");
                        }
                      } catch (err) {
                        console.error("Error saving recommendations:", err);
                        alert("Something went wrong while saving recommendations.");
                      } finally {
                        setIsMatchModalOpen(false);
                        setMatchedEvent(null);
                        setSelectedVolunteers([]);
                      }
                    }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600 italic py-8 border border-black rounded bg-gray-50">
                No volunteers to recommend for this event.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EventManagement;