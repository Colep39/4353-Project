import { useState, useMemo } from 'react';
import { format } from "date-fns";

function CardGrid({ events = [], title, showButton = true, buttonLabel = "Join Event", titleAction = null, userName, tooltip = false, onEventClick, onMatchVolunteers, onToggleJoin, joinedEventIds = [], }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Event Date (Closest)');
  const tooltipText = tooltip ? "Click to edit event" : null;

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    if (searchTerm.trim() !== '') {
      result = result.filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
        let primary;

        switch (sortBy) {
          case "Event Date (Closest)":
            primary = new Date(a.date.start) - new Date(b.date.start); 
            break;

          case "Event Date (Furthest)":
            primary = new Date(b.date.start) - new Date(a.date.start); 
            break;

          case "Urgency (Highest)":
            primary = b.urgency - a.urgency;
            break;

          case "Urgency (Lowest)":
            primary = a.urgency - b.urgency;
            break;

          default:
            primary = 0;
        }

        if (primary === 0) {
          const urgencyDiff = b.urgency - a.urgency;
          if (urgencyDiff !== 0) return urgencyDiff;

          return a.title.localeCompare(b.title);
        }

        return primary;
      });

      return result;
    }, [events, searchTerm, sortBy]);

  return (
    <div className="h-full flex flex-col px-8">
      {events.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
        <h1 className="font-sans text-2xl font-semibold">{title || (userName ? `${userName}'s History` : "No events available right now")}</h1>
        <p className="text-sm text-gray-500">{title || (userName ? `${userName}'s History` : "You'll get a notification when new events are recommended for you.")}</p>
      </div>
    ) : (
      <>
        <div className="shrink-0 py-4 pr-2 ml-2 mr-4">
          <div className="flex items-center justify-between text-black">
            <h1 className="font-sans text-2xl font-semibold">{title || (userName ? `${userName}'s History` : "Current Events")}
              {titleAction && <span className="ml-2">{titleAction}</span>}
            </h1>

            <div className="flex items-center gap-4">
              <input type="search" name="eventSearch" id="eventSearch" placeholder="Search" className="px-2 py-1 border border-black rounded" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}/>
              <label className="font-sans text-xl" htmlFor="eventSort">Sort By</label>
              <select className="px-2 py-1.5 border border-black rounded" name="eventSort" id="eventSort" value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}>
                <option>Event Date (Closest)</option>
                <option>Event Date (Furthest)</option>
                <option>Urgency (Highest)</option>
                <option>Urgency (Lowest)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {filteredAndSortedEvents.map((event) => (
          <div key={event.id} className={`mt-2 ml-2 flex bg-white rounded-lg shadow-md overflow-hidden ${tooltip ? "hover:outline hover:outline-black cursor-pointer" : ""}`}
                    {...(tooltipText ? { title: tooltipText } : {})} {...(tooltip ? { onClick: () => onEventClick(event) } : {})}>
            <div className="w-[10%] m-2 h-[150px]">
              <img src={event.image} alt={event.title} className="object-cover h-full w-full"/>
            </div>

            <div className="w-[90%] p-4 flex flex-col justify-between">
              <h2 className="text-xl font-semibold">{event.title}</h2>
                <div className="text-sm text-gray-500 mb-2">
                <span className="mr-2">
                  {event.date.start ? event.date.end && event.date.start.getTime() !== event.date.end.getTime()
                      ? `${format(event.date.start, "MMM dd, yyyy")} - ${format(event.date.end, "MMM dd, yyyy")}`
                      : format(event.date.start, "MMM dd, yyyy") : "No date"}
                </span>
                Urgency: {event.urgency}
                </div>
                <p className="text-gray-700">{event.description}</p>
                {showButton ? (
                  <div className="mt-2">
                    <button className="bg-gray-200 border border-black rounded px-4 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer"
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
          ))}
        </div>
      </>
      )}
    </div>
  );
}

export default CardGrid;
