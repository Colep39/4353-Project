"use client";
import { useState } from "react"; 
import UserBanner from '../components/layout/UserBanner';
import CardGrid from '../components/events/CardGrid';

const sampleUser = {
  id: 1,
  fullName: "Cole Mole",
  avatar: "/images/avatars/cole.jpg",
}

const sampleEvents = [
  {
    id: 1,
    title: "Traffic Director",
    date: "9/29/25 Urgency: 4",
    description: "Help needed to direct traffic for the home game against Rice University. Needed from 5pm to 9pm for directing traffic in and out.",
    image: "/images/events/traffic-director.jpg",
  },
  {
    id: 2,
    title: "Soul Cleanup",
    date: "10/1/25 Urgency: 3",
    description: "Help needed cleaning the souls of the students who failed their OS exam in the agnes arnold auditorium because they didnt study semaphores enough",
    image: "/images/events/soul-cleanup.jpg",
  },
  {
    id: 3,
    title: "Rebuild PGH",
    date: "10/13/25-10/15/25 Urgency: 2",
    description: "PGH is outdated and needs to be rebuilt. Easy task should take 2 days",
    image: "/images/events/rebuild-pgh.jpg",
  },
  {
    id: 4,
    title: "Pop-Up Shop Vendor",
    date: "10/16/25 Urgency: 2",
    description: "Looking for vendors to setup tents in the green between PGH and the library, must sell allowed goods such as food, clothing, or jewelry. Must be friendly towards students and report all revenue and provide the campus 25% of total profits",
    image: "/images/events/popup-shop.jpg",
  },
];



function EventsPage() {
  const [count, setCount] = useState(0);

  return (
    <>
        <div className="bg-green-200 min-h-screen">
          <CardGrid events={sampleEvents} />
        </div>
       
    </>
  );
}

export default EventsPage;