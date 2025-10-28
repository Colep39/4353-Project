"use client";
import { useState, useEffect } from "react";
import CardGrid from "../components/events/CardGrid";
import { fetchWithAuth } from "../authHelper";

function EventsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "volunteer") {
      alert("You do not have access to this page! Please login as a volunteer.");
      window.location.href = "/login";
      return;
    }

    fetchWithAuth(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((e) => ({...e,
          date: {
            start: new Date(e.date.start),
            end: new Date(e.date.end),
          },}));

        setEvents(formatted);

        const joinedIds = formatted.filter((e) => e.isJoined).map((e) => e.id);
        setJoinedEventIds(joinedIds);
      }).catch((err) => console.error("Error fetching events:", err));
  }, [API_URL]);

const handleToggleJoin = async (eventId) => {
  const token = localStorage.getItem("token");
  const isJoined = joinedEventIds.includes(eventId);

  setJoinedEventIds((prev) =>
    isJoined ? prev.filter((id) => id !== eventId) : [...prev, eventId]
  );

  try {
    const endpoint = `${API_URL}/api/events/${isJoined ? `leave?event_id=${eventId}` : "join"}`;
    const res = await fetch(endpoint, {
      method: isJoined ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: isJoined ? undefined : JSON.stringify({ event_id: eventId }),
    });

    if (!res.ok) {
      console.warn("API error:", await res.text());
    }
  } catch (err) {
    console.error("Error toggling join:", err);
  }
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
