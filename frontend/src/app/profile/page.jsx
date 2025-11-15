"use client"
import VolunteerProfile from '../components/profile/VolunteerProfile';
import AdminProfile from '../components/profile/AdminProfile';
import { useEffect, useState } from 'react';
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // choose what you want
  variable: "--font-outfit",
});


export default function ProfilePage(){
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    })

    return(
        <>
            <div className={`${outfit.className}`}>
                {role === "admin" ? <AdminProfile /> : <VolunteerProfile />}
            </div>
        </>
    );
}