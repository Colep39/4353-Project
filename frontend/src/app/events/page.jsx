"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    fetch("https://volunteer-server-rxev.onrender.com/api/events").then((res) => res.json()).then((data) => setEvents(data)).catch((err) => console.error("Error fetching events:", err));
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