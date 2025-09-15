import { useState } from 'react';

function CardGrid({ events, title, showButton = true, buttonLabel = "Join Event", titleAction = null, userName, tooltip = false, onEventClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Date Created (Most Recent)');
  const tooltipText = tooltip ? "Click to edit event" : null;

  return (
    <div className="h-full flex flex-col px-8">
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
              <option>Date Created (Most Recent)</option>
              <option>Date Created (Least Recent)</option>
              <option>Urgency (Highest)</option>
              <option>Urgency (Lowest)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {events.map((event) => (
        <div key={event.id} className={`mt-2 ml-2 flex bg-white rounded-lg shadow-md overflow-hidden ${tooltip ? "hover:outline hover:outline-black cursor-pointer" : ""}`}
                  {...(tooltipText ? { title: tooltipText } : {})} {...(tooltip ? { onClick: () => onEventClick(event) } : {})}>
            <div className="w-[10%] m-2 h-[150px]">
              <img src={event.image} alt={event.title} className="object-cover h-full w-full"/>
            </div>

            <div className="w-[90%] p-4 flex flex-col justify-between">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="text-sm text-gray-500 mb-2">
                {event.date} Urgency: {event.urgency}
              </div>
              <p className="text-gray-700">{event.description}</p>
              {showButton ? (
                <div className="mt-2">
                  <button className="bg-gray-200 border border-black rounded px-4 py-1 text-sm font-medium hover:bg-gray-300 cursor-pointer">
                    {buttonLabel}
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
    </div>
  );
}

export default CardGrid;
