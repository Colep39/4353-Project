"use client";
import { useState, useEffect } from "react"; 
import CardGrid from '../components/events/CardGrid';
import { fetchWithAuth } from "../authHelper";

const sampleUser = {
  id: 1,
  fullName: "Cole Mole",
  avatar: "/images/avatars/cole.jpg",
}


function VolunteerHistory() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [events, setEvents] = useState([]);

    useEffect(() => {
      const role = localStorage.getItem("role");
      const token = localStorage.getItem("token");

      if (!token || role !== "volunteer"){
        alert("You do not have access this page! Please login as a volunteer.")
        window.location.href = "/login";
        return; // i dont think it will reach this but whatever
      }

      fetchWithAuth(`${API_URL}/api/volunteerHistory`, {
      })
        .then((res) => res.json())
        .then((data) => setEvents(data))
        .catch((err) => console.error("Error fetching events:", err));
    }, []);


  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={events} userName={sampleUser.fullName} showButton={false}/>   
      </div>
    </>
  );
}

export default VolunteerHistory; 