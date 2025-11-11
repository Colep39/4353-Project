"use client"
import VolunteerProfile from '../components/profile/VolunteerProfile';
import AdminProfile from '../components/profile/AdminProfile';
import { useEffect, useState } from 'react';
import { Bungee } from "next/font/google";

const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
});

export default function ProfilePage(){
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    })

    return(
        <>
            <div className={`${bungee.className}`}>
                {role === "admin" ? <AdminProfile /> : <VolunteerProfile />}
            </div>
        </>
    );
}