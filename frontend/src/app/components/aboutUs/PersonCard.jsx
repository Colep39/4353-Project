"use client";
import { useState } from "react"; 

function PersonCard({ members = [] }){
  return(
    <>
        {members.map((member) => (
        <div key = {member.id} className = "p-4 mx-4 mb-4 bg-black rounded-lg flex items-center">
            <img src = { member.image } className = "w-30 h-45 mr-5 mb-4" alt="photo"></img>
            <span className="text-white"> { member.description } </span>
        </div> 
        ))}
    </>
  );
}

export default PersonCard;
