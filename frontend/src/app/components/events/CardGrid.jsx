import { useState } from 'react';

function CardGrid({ events, title, showButton = true, buttonLabel = "Join Event", titleAction = null, userName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Date Created (Most Recent)');

  return (
    <div className="px-8">
      <div className="flex items-center justify-between text-black py-2 mt-30 pr-2">
        <h1 className="font-sans text-2xl font-semibold">{title || (userName ? `${userName}'s History` : "Current Events")}
            {titleAction && <span>{titleAction}</span>}
        </h1>
        <div className="flex items-center gap-4">
          <input type="search" name="eventSearch" id="eventSearch" placeholder="Search" className="px-2 py-1 border border-black rounded mr-4" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}/>
          <label className="font-sans text-xl" htmlFor="eventSort">Sort By</label>
          <select className="px-2 py-1.75 border border-black rounded mr-4" name="eventSort" id="eventSort" value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}>
            <option>Date Created (Most Recent)</option>
            <option>Date Created (Least Recent)</option>
            <option>Urgency (Highest)</option>
            <option>Urgency (Lowest)</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-6 max-h-[620px] overflow-y-auto pr-2">
        {events.map((event) => (
          <div key={event.id} className="flex bg-white rounded-lg shadow-md overflow-hidden min-h-[180px]">
            <div className="w-[10%] m-2">
              <img src={event.image} alt={event.title} className="object-cover h-full w-full"/>
            </div>
            <div className="w-[90%] p-4 flex flex-col justify-between">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="text-sm text-gray-500 mb-2">{event.date} Urgency: {event.urgency}</div>
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
