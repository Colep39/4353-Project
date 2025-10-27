"use client";
import { useState } from "react"; 
import PersonCard from '../components/aboutUs/PersonCard';

const memberInfo = [
  {
    id:1,
    description: "Cole is a Senior Computer Science Student focusing in Full-Stack Development and Data Science. His favorite programming language is Python and in his free time enjoys basketball and peak fiction. Operating Systems tutor and Lead TA for Undergraduate Computer Science at UH. ",
    image: "/images/aboutUs/cole-photo.webp",
  },
  {
    id:2,
    description: "Jason is a Senior year Computer Science Student at the University of Houston. Professionally he intends the pursue a career in full stack development with aspirations to become a software engineer. Outside of academics he enjoys riding dirtbikes, hiking, and traveling.",
    image: "/images/aboutUs/jason-photo.webp",
  },
  {
    id:3,
    description: "Ramsey is a Junior year Computer Science Student at the University of Houston. He enjoys hiking, gaming, and working on projects in his downtime. As an active and ethusiastic officer for CougarCS, he's also open to chat anytime! Lost to Dio in uno that one time.",
    image: "/images/aboutUs/ramsey-photo.png",
  },
  {
    id: 4,
    description: "Samuel is a Senior year Computer Science Student at the University of Houston. While he focuses on Full-Stack Development, he is also studying program paradigms and machine learning. He enjoys playing video games and avoiding his friends outside of school. Took a picture with Rincon once.",
    image: "/images/aboutUs/sam-photo.webp",
  },
];

function AboutMe(){
  return(
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Meet the Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're a passionate group of Computer Science students dedicated to
            building innovative software and solving real-world problems.
          </p>
        </div>

        {/* Member Cards */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 place-items-center cursor-pointer">
          <PersonCard members={memberInfo} />
        </div>
      </div>
    </>
  );
}

export default AboutMe;
