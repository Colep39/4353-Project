"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Loading from "../loading/Loading";
import { createPortal } from "react-dom";
import { fetchWithAuth, getUserIdFromToken } from '../../authHelper';

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/users/1`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user data:", err));
  }, []);

  const openModal = () => setProfileModalOpen(true);
  const closeModal = () => setProfileModalOpen(false);

  const handleEditProfile = (e) => {
    e.preventDefault();
    // put request to update the profile
    closeModal();
  };

  return (
    <>
      {!user ? (
        <div className="flex justify-center items-center mt-20">
          <Loading />
        </div>
      ) : (
        <div
          className="min-h-[calc(100vh-4rem)] flex justify-center bg-cover bg-center bg-no-repeat p-6"
          style={{ backgroundImage: "url('/profile_background.jpg')" }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Profile content card */}
          <div className="relative z-10 bg-white/85 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-3xl w-full my-10 animate-fadeIn self-start">
            {/* Header with photo + name */}
            <div className="flex items-center gap-5 border-b pb-5 mb-5">
              <Image
                src={user.profilePhoto}
                alt={user.name}
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-red-200"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-500">{user.role}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Contact Information
                </h2>
                <p className="text-gray-700">
                  {user.address1} {user.address2 && `, ${user.address2}`}
                </p>
                <p className="text-gray-700">
                  {user.city}, {user.state} {user.zip}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Preferences
                </h2>
                <p className="text-gray-700">
                  {user.preferences || "No preferences set."}
                </p>
              </div>
            </div>

            {/* Skills and Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Skills
                </h2>
                {user.skills.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {user.skills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No skills listed.</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Availability
                </h2>
                {user.availability.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {user.availability.map((slot, idx) => (
                      <li key={idx}>{slot}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No availability set.</p>
                )}
              </div>
            </div>

            {/* Edit button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={openModal}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {profileModalOpen &&
            createPortal(
              <div className="fixed top-[4rem] left-0 right-0 bottom-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto relative">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Edit Profile
                  </h2>

                  <form className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Address 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.address1}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Address 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 2
                      </label>
                      <input
                        type="text"
                        defaultValue={user.address2}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.city}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.state}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* ZIP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.zip}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skills <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.skills.join(", ")}
                        required
                        placeholder="Comma-separated, e.g. Event Setup, Fundraising"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferences <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        defaultValue={user.preferences}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                        rows="3"
                      />
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={user.availability.join(", ")}
                        required
                        placeholder="Comma-separated, e.g. Weekdays after 5pm, Weekends"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo URL
                      </label>
                      <input
                        type="text"
                        defaultValue={user.profilePhoto}
                        placeholder="Optional: Enter a photo URL"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user.role}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
        </div>
      )}
    </>
  );
}
