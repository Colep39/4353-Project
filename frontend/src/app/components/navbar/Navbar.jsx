"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar(){
    const pathname = usePathname(); // so we can highlight the current page

    const links = [
        
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
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="w-full grid grid-cols-[auto_1fr_auto] items-center px-4 sm:px-8">

        <div className="flex items-center space-x-3">
          <Link href='/' className="flex items-center space-x-3">
            <Image src="/images/connect_logo.jpg" alt="Cougar Connect Logo" width={48} height={48} className="rounded-full shrink-0"/>
            <span className="text-lg font-bold whitespace-nowrap">The Cougar Connect</span>
          </Link>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} 
                className={`
                relative 
                after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-green-200 after:transition-all after:duration-300 
                hover:after:w-full
                transition-colors duration-300
                ${pathname === link.href ? "text-green-200 font-semibold after:w-full" : ""}
              `}>
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