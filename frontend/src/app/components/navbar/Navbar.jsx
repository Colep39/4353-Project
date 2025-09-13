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

    return(
        <nav className="bg-gray-900 text-white p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                 <div className="flex items-center space-x-2">
                    <Image
                        src="/images/avatars/cougar-connect-logo.jpg"
                        alt="Cougar Connect Logo"
                        width={60}
                        height={60}
                        className="rounded-full"
                    />
                    <span className="text-xl font-bold">The Cougar Connect</span>
                </div>
                <ul className="flex space-x-6">
                {links.map((link) => (
                    <li key={link.href}>
                    <Link
                        href={link.href}
                        className={`hover:text-green-400 transition ${
                        pathname === link.href ? "text-green-400 font-semibold" : ""
                        }`}
                    >
                        {link.name}
                    </Link>
                    </li>
                ))}
                </ul>
                <div className="flex items-center text-lg font-semibold">
                    <span className="mr-2">Welcome, {user?.fullName || "User"}</span>
                    {user?.avatar && (
                    <img src={user.avatar} alt={user?.fullName} className="ml-2 w-8 h-8 rounded-full object-cover"/>)}
                </div>
            </div>
        </nav>
    );
}