"use client";
import { useState } from "react"; 
import CardGrid from '../components/events/CardGrid';

const sampleUser = {
  id: 1,
  fullName: "Cole Mole",
  avatar: "/images/avatars/cole.jpg",
}

const sampleVolunteerHistory = [
  {
    id: 1,
    title: "Campus Cleanup",
    date: {
      start: new Date(2025, 9, 2),
      end: new Date(2025, 9, 2),
    },
    urgency: "2",
    description: "Cole raked leaves, picked up trash, and mowed the campus yard. Excellent work very responsive, hardworking, and flexible",
    image: "/images/events/campus-cleanup.jpg",
  },
  {
    id: 2,
    title: "Career Fair",
    date: {
      start: new Date(2025, 8, 30),
      end: new Date(2025, 8, 30),
    },
    urgency: "3",
    description: "Cole help directed students on entry. Great communication skills, provided excellent directions to fellow students, and helped answer any questions he was asked.",
    image: "/images/events/career-fair.jpg",
  },
  {
    id: 3,
    title: "Cleaning PGH",
    date: {
      start: new Date(2025, 8, 20),
      end: new Date(2025, 8, 20),
    },
    urgency: "2",
    description: "Cole was instrumental in the pruging of the stem major stench in PGH. Cole was an effective, hardworking, and reliable volunteer.",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 4,
    title: "Sidewalk Rebuilding",
    date: {
      start: new Date(2025, 8, 15),
      end: new Date(2025, 8, 15),
    },
    urgency: "4",
    description: "Cole was a very helpful asset to the construction crew responsible for making the walkways more walkable for incoming freshman.",
    image: "/images/events/sidewalk-repair.jpg",
  },
];

function VolunteerHistory() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="max-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] mt-20">
        <CardGrid events={sampleVolunteerHistory} userName={sampleUser.fullName} showButton={false}/>   
      </div>
    </>
  );
}

export default VolunteerHistory; 