"use client";
import { useState } from "react"; 

function PersonCard({ members = [] }){
  return(
    <>
        {members.map((member) => (
        <div
          key={member.id}
          className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center border border-gray-100 hover:scale-[1.02]"
        >
          {/* Image Section */}
          <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-between flex-grow p-5">
            {member.name && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 transition-colors duration-300">
                {member.name}
              </h2>
            )}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {member.description}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

export default PersonCard;
