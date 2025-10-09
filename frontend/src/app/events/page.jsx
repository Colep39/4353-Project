"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';

function EventsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not set!");
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        const text = await res.text();
        const data = JSON.parse(text);
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, [API_URL]);

  const handleToggleJoin = (eventId) => {
    setJoinedEventIds(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
      <CardGrid events={events} showButton onToggleJoin={handleToggleJoin} joinedEventIds={joinedEventIds}/>
    </div>
  );
}

export default EventsPage;
