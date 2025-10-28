"use client"
import VolunteerProfile from '../components/profile/VolunteerProfile';
import AdminProfile from '../components/profile/AdminProfile';
import { useEffect, useState } from 'react';

export default function ProfilePage(){
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    })

    return(
        <>
            <div>
                {role === "admin" ? <AdminProfile /> : <VolunteerProfile />}
            </div>
        </>
    );
}