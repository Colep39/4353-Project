"use client";
import { useState } from "react"; 
import PersonCard from '../components/aboutUs/PersonCard';

const memberInfo = [
  {
    id:1,
    description: "Cole is a Senior year Computer Science Student at the University of Houston. While he focuses on Full-Stack Development, he is also studying programming paradigms.",
    image: "/images/aboutUs/cole-photo.webp",
  },
  {
    id:2,
    description: "Jason is a Senior year Computer Science Student at the University of Houston. While he focuses on Full-Stack Development, he is also studying programming paradigms.",
    image: "/images/aboutUs/jason-photo.webp",
  },
  {
    id:3,
    description: "Ramsey is a Junior year Computer Science Student at the University of Houston. He enjoys hiking, gaming, and working on projects in his downtime. He's also open to chat anytime!",
    image: "/images/aboutUs/ramsey-photo.png",
  },
  {
    id: 4,
    description: "Samuel is a Senior year Computer Science Student at the University of Houston. While he focuses on Full-Stack Development, he is also studying programming paradigms.",
    image: "/images/aboutUs/sam-photo.webp",
  },
];

function AboutMe(){
  return(
    <>
        <div className = " grid gap-4 grid-cols-2 mt-15 ">
            <PersonCard members = {memberInfo} />
        </div>
    </>
  );
}

export default AboutMe;
