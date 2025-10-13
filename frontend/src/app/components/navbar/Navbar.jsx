"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar(){
    const pathname = usePathname(); // so we can highlight the current page
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    useEffect(() => {
      fetch(`${API_URL}/api/notifications/1`).then((res) => res.json()).then((data) => setNotifications(data)).catch((err) => console.error("Error fetching notifications:", err))
    }, []);

    const links = [
        { name: 'Events', href: '/events' },
        { name: 'Event Management', href:'/eventManagement'},
        { name: 'Volunteer History', href:'/volunteerHistory'},
        { name: 'Profile', href:'/profile' },
        { name: 'Login', href:'/login' },
        { name: 'Register', href:'/register' },
        { name: 'About Us', href:'/aboutUs'}
    ];

    const user = {
        id: 1,
        fullName: "Cole Hawke",
        avatar: "/images/avatars/cole.jpg",
    }

return (
    <nav className="bg-white text-black p-4 shadow-md">
      <div className="w-full grid grid-cols-[auto_1fr_auto] items-center px-4 sm:px-8">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/connect_logo.jpg"
              alt="Cougar Connect Logo"
              width={56}
              height={56}
              className="rounded-lg shadow-md object-contain w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
              The Cougar Connect
            </span>
          </Link>
        </div>


        {/* Links */}
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`
                  relative 
                  after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-green-600 after:transition-all after:duration-300 
                  hover:after:w-full
                  transition-colors duration-300
                  ${
                    pathname === link.href
                      ? "text-green-600 font-semibold after:w-full"
                      : ""
                  }
                `}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side (welcome + avatar + bell) */}
        <div className="flex items-center space-x-4 relative">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center"
            >
              <Bell className="w-6 h-6 hover:text-green-600 transition cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute top-[-4px] right-[-4px] bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {notifications.map((note, idx) => (
                      <li key={idx} className="p-3 hover:bg-gray-100 cursor-pointer">
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Welcome + avatar */}
          <span className="text-sm md:text-base whitespace-nowrap">
            Welcome, {user?.fullName || "User"}
          </span>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </div>
      </div>
    </nav>
  );
}