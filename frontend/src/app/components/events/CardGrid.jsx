import { useState, useMemo } from 'react';
import { format } from "date-fns";
import Loading from '../loading/Loading';
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // choose what you want
  variable: "--font-outfit",
});


const urgencyIntToString = { 4: "Critical", 3: "High", 2: "Medium", 1: "Low" };

function CardGrid({events = [], isLoading = false, title, showButton = true, buttonLabel = "Join Event", titleAction = null, userName, tooltip = false, onEventClick, onMatchVolunteers, onToggleJoin, joinedEventIds = []}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Event Date (Closest)');
  const tooltipText = tooltip ? "Click to edit event" : null;

  const normalizedEvents = useMemo(() => 
    events.map(event => ({...event,
      date: {
        start: new Date(event.date.start),
        end: event.date.end ? new Date(event.date.end) : null,
      }})), [events]);

  const filteredAndSortedEvents = useMemo(() => {
  let result = [...normalizedEvents];

  if (searchTerm.trim() !== '') {
    result = result.filter(event =>
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  result.sort((a, b) => {
    let primary;

    switch (sortBy) {
      case "Event Date (Closest)":
        primary = a.date.start - b.date.start;
        break;
      case "Event Date (Furthest)":
        primary = b.date.start - a.date.start;
        break;
      case "Urgency (Highest)":
        primary = (b.urgency || 1) - (a.urgency || 1);
        break;
      case "Urgency (Lowest)":
        primary = (a.urgency || 1) - (b.urgency || 1);
        break;
      default:
        primary = 0;
    }

    if (primary === 0) {
      const urgencyDiff = (b.urgency || 1) - (a.urgency || 1);
      if (urgencyDiff !== 0) return urgencyDiff;
      return (a.title || "").localeCompare(b.title || "");
    }

    return primary;
  });

  return result;
}, [normalizedEvents, searchTerm, sortBy]);

const showHeader = !isLoading && normalizedEvents.length > 0

  return (
    <div className={`h-full flex flex-col px-8 ${outfit.className}`}>
      {showHeader && (
        <div className="shrink-0 py-4 pr-2 ml-2 mr-4">
          <div className="flex items-center justify-between text-black">
            <h1 className="text-2xl font-semibold">
              {title || (userName ? `${userName}'s History` : "Current Events")}
              {titleAction && <span className="ml-2">{titleAction}</span>}
            </h1>
            <div className="flex items-center gap-4">
              <input type="search" placeholder="Search" className="px-2 py-1 border border-black rounded" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}/>
              <label className="font-sans text-xl" htmlFor="eventSort">Sort By</label>
              <select className="px-2 py-1.5 border border-black rounded" value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}>
                <option>Event Date (Closest)</option>
                <option>Event Date (Furthest)</option>
                <option>Urgency (Highest)</option>
                <option>Urgency (Lowest)</option>
              </select>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {isLoading ? (<div className="flex justify-center items-center h-full"><Loading /></div>) : normalizedEvents.length === 0 ? (
          <div className="h-full flex flex-col px-8">
            <div className="flex flex-col items-center justify-center flex-1 text-center text-black">
              <h1 className="font-sans text-2xl font-semibold">
                {title ? "No upcoming events" : userName ? `${userName}'s journey is just beginning` : "No events available right now"}
              </h1>
              <p className="text-sm text-gray-500 mb-5">
                {title ? 'Click "Create Event" to start planning one!' : userName ? "Your next adventure is waiting — join an event to see it here!" : "You'll get a notification when new events are recommended for you."}
              </p>
              {titleAction && <span className="ml-2">{titleAction}</span>}
            </div>
          </div>
        ) : (
          filteredAndSortedEvents.map((event) => (
            <div key={event.id} className={`relative min-h-[20vh] mt-2 ml-2 flex bg-white rounded-lg shadow-md overflow-hidden ${tooltip ? "hover:outline hover:outline-black cursor-pointer" : ""}`}
                {...(tooltipText ? { title: tooltipText } : {})} {...(tooltip ? { onClick: () => onEventClick(event) } : {})}>
            
            {event.isRecommended && (
              <div className="absolute top-3 right-3 bg-blue-200 text-gray-800 text-s font-semibold px-3 py-1 rounded-full shadow-md">Recommended Event</div>
            )}
              <div className="w-[10%] m-2">
                <img src={event.image} alt={event.title} className="object-cover h-full w-full rounded"/>
              </div>
              <div className="w-[90%] p-4 flex flex-col justify-between">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-x-4 gap-y-1">
                  {event.location && (
                    <span>
                      <strong>Location:</strong> {event.location}
                    </span>
                  )}
                  {event.date.start && (
                    <span>
                      <strong>Date:</strong>{" "}
                      {event.date.end && event.date.start.getTime() !== event.date.end.getTime()
                        ? `${format(event.date.start, "MMM dd, yyyy")} - ${format(event.date.end, "MMM dd, yyyy")}`
                        : format(event.date.start, "MMM dd, yyyy")}
                    </span>
                  )}
                  <span>
                    <strong>Urgency:</strong> {urgencyIntToString[event.urgency] || "Low"}
                  </span>
                </div>
                {event.skills && event.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {event.skills.map((skill, idx) => {
                      const skillLabel = typeof skill === "string" ? skill : skill.description || "";
                      return (
                        <span
                          key={idx}
                          className="bg-red-100 text-gray-900 text-xs px-2 py-1 rounded-full"
                        >
                          {skillLabel}
                        </span>
                      );
                    })}
                  </div>
                )}
                <p className="text-gray-700">{event.description}</p>
                {showButton ? (
                  <div className="mt-2">
                    <button className="bg-red-100 border border-black rounded px-4 py-1 text-sm font-medium hover:bg-red-300 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleJoin) {
                          onToggleJoin(event.id);
                        } else if (onMatchVolunteers) {
                          onMatchVolunteers(event);
                        }
                      }}>
                      {onToggleJoin ? joinedEventIds.includes(event.id) ? "Leave Event" : "Join Event" : buttonLabel}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 invisible">
                    <button className="px-4 py-1 text-sm font-medium">Hidden</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CardGrid;
