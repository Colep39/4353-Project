"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar(){
    const pathname = usePathname(); // so we can highlight the current page

    const links = [
        { name: 'Home', href: '/' },
        { name: 'Events', href: '/events' },
        { name: 'Volunteer Matching', href:'/volunteerMatching'},
        { name: 'Volunteer History', href:'/volunteerHistory'},
        { name: 'Profile', href:'/profile' },
        { name: 'Login', href:'/login' },
        { name: 'Register', href:'/register' },
    ];

    const user = {
        id: 1,
        fullName: "Cole Mole",
        avatar: "/images/avatars/cole.jpg",
    }

return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="w-full grid grid-cols-[auto_1fr_auto] items-center px-4 sm:px-8">

        <div className="flex items-center space-x-3">
          <Image src="/images/avatars/cougar-connect-logo.jpg" alt="Cougar Connect Logo" width={48} height={48} className="rounded-full shrink-0"/>
          <span className="text-lg font-bold whitespace-nowrap">The Cougar Connect</span>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`hover:text-green-400 transition ${pathname === link.href ? "text-green-400 font-semibold" : ""}`}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center space-x-2">
          <span className="text-sm md:text-base whitespace-nowrap">Welcome, {user?.fullName || "User"}</span>
          {user?.avatar && (<img src={user.avatar} alt={user?.fullName} className="w-8 h-8 rounded-full object-cover"/>)}
        </div>

      </div>
    </nav>
  );
}