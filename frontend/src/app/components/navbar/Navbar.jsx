"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
};

export default function Navbar() {
  const pathname = usePathname();
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
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Event Management", href: "/eventManagement" },
    { name: "Volunteer History", href: "/volunteerHistory" },
    { name: "Profile", href: "/profile" },
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
    { name: "About Us", href: "/aboutUs" },
  ];

  const visibleLinks = links.filter((link) => {
    if (role === "volunteer" && link.href === "/eventManagement") return false;
    if (role === "admin" && (link.href === "/volunteerHistory" || link.href === "/events")) return false;
    if (isLogged && (link.href === "/login" || link.href === "/register")) return false;
    if (!isLogged && ["/volunteerHistory", "/eventManagement", "/events", "/profile"].includes(link.href)) return false;
    return true;
  });

  const user = {
    id: 1,
    fullName: "Cole Hawke",
    avatar: "/images/avatars/cole.jpg",
  };

  return (
    <nav className="bg-black text-white shadow-md w-full z-[200] relative">
      <div className="w-full px-[10px]">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left side */}
          <div className="flex items-center gap-4 flex-shrink-0">
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

          {/* Mobile menu controls */}
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

          {/* Desktop links and right side */}
          <div className="hidden md:flex items-center flex-1 ml-12">
            {/* Links section */}
            <ul className="flex flex-wrap gap-x-6 justify-start flex-grow">
              {visibleLinks.map((link) => (
                <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-1 rounded-lg transition-all duration-300 
                    ${pathname === link.href 
                      ? "bg-green-500/40 text-green-100  scale-105" 
                      : "hover:bg-green-400/30 hover:text-green-100 "}`
                  }
                >
                  {link.name}
                </Link>
                </li>
              ))}
            </ul>

            {/* Right side */}
            <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
              {/* Notifications */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center"
                >
                  <Bell className="w-6 h-6 hover:text-green-200 transition cursor-pointer flex-shrink-0" />
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
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                  </div>
                )}
              </div>

              {/* User info */}
              <span className="text-sm md:text-base whitespace-nowrap">
                Welcome, {user?.fullName || "User"}
              </span>

              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer 
                  transform transition-transform duration-300 hover:scale-110"
                />
              )}

              {/* Logout */}
              {isLogged && (
                <button onClick={logout} className="hover:opacity-80 transition flex-shrink-0 cursor-pointer">
                  <img
                    src="/images/logout.svg"
                    alt="Logout"
                    title="Logout"
                    className="w-6 h-6 inline-block flex-shrink-0"
                  />
                </button>
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
                    pathname === link.href ? "text-green-200 font-semibold" : "hover:text-green-200"
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
