"use client";
import Image from 'next/image';

const user = {
  firstName: "Cole",
  lastName: "Mole",
  address1: "1234 Elm St",
  address2: "",
  city: "Antarctica City",
  state: "",
  zip: "99999",
  profilePhoto: "/images/avatars/cole.jpg",
  role: "Administrator",
};

export default function AdminProfile(){
    return(
        <>
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto mt-10">
                    {/* Header with photo + name */}
                    <div className="flex items-center gap-6 border-b pb-6 mb-6">
                      <Image
                        src={user.profilePhoto}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={120}
                        height={120}
                        className="rounded-full object-cover border-4 border-green-200"
                      />
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                          {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-gray-500">{user.role}</p>
                      </div>
                    </div>
            
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-green-600 mb-2">
                          Contact Information
                        </h2>
                        <p className="text-gray-700">
                          {user.address1} {user.address2 && `, ${user.address2}`}
                        </p>
                        <p className="text-gray-700">
                          {user.city}, {user.state} {user.zip}
                        </p>
                      </div>
            
                      
                    </div>
            
                    
            
                    {/* Edit button */}
                    <div className="mt-8 flex justify-end">
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                        Edit Profile
                      </button>
                    </div>
            </div>
        </>
    );
}