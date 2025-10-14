"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/"
}

export default function Navbar(){
    const pathname = usePathname(); // so we can highlight the current page
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [role, setRole] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const token = localStorage.getItem("token");
        setRole(storedRole);
        setIsLogged(!!token);
    }, []);
    
    useEffect(() => {
      fetch(`${API_URL}/api/notifications/1`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error fetching notifications:", err))
    }, []);

    const links = [
        { name: 'Home', href: '/'},
        { name: 'Events', href: '/events' },
        { name: 'Event Management', href:'/eventManagement'},
        { name: 'Volunteer History', href:'/volunteerHistory'},
        { name: 'Profile', href:'/profile' },
        { name: 'Login', href:'/login' },
        { name: 'Register', href:'/register' },
        { name: 'About Us', href:'/aboutUs'}
    ];

    // this is messy but its too late at night to fix
    const visibleLinks = links.filter((link) =>{
      if (role === "volunteer" && link.href === '/eventManagement'){
        return false;
      }
      if (role === "admin" && (link.href === '/volunteerHistory' || link.href === '/events')){
        return false;
      }
      if (isLogged && (link.href === '/login' || link.href === '/register')){
        return false;
      }
      if (!isLogged && (link.href === '/volunteerHistory' || link.href === '/eventManagement' || link.href === '/events' || link.href === '/profile')){
        return false;
      }
      return true;
    })

    const user = {
        id: 1,
        fullName: "Cole Hawke",
        avatar: "/images/avatars/cole.jpg",
    }

return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="rounded-2xl overflow-hidden shadow-md w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/images/connect_logo2.png"
                  alt="Cougar Connect Logo"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap text-white">
                The Cougar Connect
              </span>
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <div className="flex items-center md:hidden space-x-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center"
            >
              <Bell className="w-6 h-6 hover:text-green-200 transition cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute top-[-4px] right-[-4px] bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-green-200 transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            {/* Links */}
            <ul className="flex flex-wrap justify-center gap-x-4 lg:gap-x-5 xl:gap-x-6">
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative 
                      after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-green-200 after:transition-all after:duration-300 
                      hover:after:w-full transition-colors duration-300
                      ${
                        pathname === link.href
                          ? "text-green-200 font-semibold after:w-full"
                          : ""
                      }
                    `}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
          {isLogged && (<li key={"logout"}>
            <button
              onClick={logout}
              className={`
                relative 
                after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] 
                after:w-0 after:bg-green-200 after:transition-all after:duration-300 
                hover:after:w-full
                transition-colors duration-300
                text-green-200 font-medium
                hover:text-green-100
                cursor-pointer
              `}
            >
              Logout
            </button>
          </li>)}
            </ul>

            {/* Right Side */}
            <div className="flex items-center space-x-4 relative ml-6">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center"
                >
                  <Bell className="w-6 h-6 hover:text-green-200 transition cursor-pointer" />
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
                          <li
                            key={idx}
                            className="p-3 hover:bg-gray-100 cursor-pointer"
                          >
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
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black text-white border-t border-gray-800">
          <ul className="flex flex-col items-center gap-3 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2 text-lg transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-green-200 font-semibold"
                      : "hover:text-green-200"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}