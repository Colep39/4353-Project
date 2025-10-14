"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';

function EventsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "volunteer"){
      alert("You do not have access this page! Please login as a volunteer.")
      window.location.href = "/login";
      return; // i dont think it will reach this but whatever
    }

    fetch(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}`}
    })
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const handleToggleJoin = (eventId) => {
  setJoinedEventIds((prevIds) =>
    prevIds.includes(eventId)
      ? prevIds.filter(id => id !== eventId)
      : [...prevIds, eventId]
  );
};

  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} showButton={true} onToggleJoin={handleToggleJoin} joinedEventIds={joinedEventIds}/>
      </div>
    </>
  );
}

export default EventsPage;