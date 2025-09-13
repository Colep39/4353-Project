"use client";
import { useState } from "react"; 
import UserBanner from '../components/layout/UserBanner';
import CardGrid from '../components/events/CardGrid';

const sampleUser = {
  id: 1,
  fullName: "Cole Mole",
  avatar: "/images/avatars/cole.jpg",
}

const sampleVolunteerMatchingEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: "10/29/25 Urgency: 4",
    description: "Help needed to direct traffic for the home game against Sam Houston State University. Needed from 5pm to 9pm for directing traffic in and out.",
    image: "/images/events/traffic-director.jpg",
  },
  {
    id: 2,
    title: "Cleaning SEC",
    date: "10/11/25 Urgency: 3",
    description: "Help needed purging the stench of stem majors from the SEC building",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rincons Birthday Party",
    date: "10/21/25 Urgency: 2",
    description: "Help needed setting up a surprise birthday party for the goat Rincon",
    image: "/images/events/carlos-rincon.jpg",
  },
  {
    id: 4,
    title: "Meal Testing",
    date: "10/31/25 Urgency: 1",
    description: "Looking for volunteers to risk their lives eating the cafeteria food and giving honest reviews on the quality of the food being made here on campus.",
    image: "/images/events/cafe-food.jpg",
  },
];


function VolunteerMatching() {
  const [count, setCount] = useState(0);

  return (
    <>
        <CardGrid events={sampleVolunteerMatchingEvents} title="Event Matching" buttonLabel="Match Volunteers" titleAction={
        <button 
          className="ml-5 bg-gray-200 border border-black rounded px-2 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer" onClick={() => alert("Create Event Clicked")}> Create Event
        </button>}/>
      
    </>
  );
}

export default VolunteerMatching; 