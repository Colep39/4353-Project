"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';
import { fetchWithAuth, getUserIdFromToken } from "../authHelper";


function VolunteerHistory() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sampleUser, getUserProfile] = useState([]);

    useEffect(() => {
      const role = localStorage.getItem("role");
      const token = localStorage.getItem("token");

      if (!token || role !== "volunteer"){
        alert("You do not have access this page! Please login as a volunteer.")
        window.location.href = "/login";
        return; // i dont think it will reach this but whatever
      }
      setIsLoading(true);

      fetchWithAuth(`${API_URL}/api/volunteerHistory`, {
      })
        .then((res) => res.json())
        .then((data) => setEvents(data))
        .catch((err) => console.error("Error fetching events:", err))
        .finally(() => { setIsLoading(false); });

      const userId = getUserIdFromToken();
      if (!userId) return;

      fetchWithAuth(`${API_URL}/api/users/${userId}`, {
      })
        .then((res) => res.json())
        .then((data) => getUserProfile(data))
        .catch((err) => console.error("Error fetching user", err))
    }, [API_URL]);


  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} userName={sampleUser.full_name} isLoading={isLoading} showButton={false}/>   
      </div>
    </>
  );
}

export default VolunteerHistory; 