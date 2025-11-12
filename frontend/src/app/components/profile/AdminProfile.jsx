"use client";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Loading from "../loading/Loading";
import { createPortal } from "react-dom";
import { fetchWithAuth, getUserIdFromToken } from '../../authHelper';
import toast from "react-hot-toast";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    preferences: "",
    profilePhoto: "",
    role: "",
  });

  const isInvalid =
    !form.name.trim() ||
    form.name.length > 50;
    

  const fetchProfile = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const res = await fetchWithAuth(`${API_URL}/api/users/${userId}`);
    if (!res.ok) {
      console.error("Error fetching user data");
      return;
    }
    const data = await res.json();
    setUser(data);
    setForm({
      name: data.full_name || "",
      address1: data.address_1 || "",
      address2: data.address_2 || "",
      city: data.city || "",
      state: data.state?.state_code || "",
      zip: data.zipcode || "",
      preferences: data.preferences || "",
      profilePhoto: data.profilePhoto || "",
      role: data.role || "Admin",
    });
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const openModal = () => setProfileModalOpen(true);
  const closeModal = () => setProfileModalOpen(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInvalid) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    const payload = {
      full_name: form.name,
      profilePhoto: form.profilePhoto || null,
    };

    try {
      const userId = getUserIdFromToken();
      const res = await fetchWithAuth(`${API_URL}/api/users/${userId}/admin/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        toast.error(`Profile update failed. ${errText || ""}`);
        return;
      }

      await toast.promise(fetchProfile(), {
        loading: "Refreshing profile...",
        success: "Profile updated!",
        error: "Failed refreshing profile",
      });

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error updating profile.");
    }
  };

  const MissingField = ({ text }) => (
    <p className="text-gray-400 flex items-center gap-1 italic">
      <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
      {text}
    </p>
  );

  return (
    <>
      <div
      className="min-h-[calc(100vh-4rem)] flex justify-center bg-cover bg-center bg-no-repeat p-6 relative"
      style={{ backgroundImage: "url('/Cherry Blossoms.jpg')" }}
      >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Profile content card */}
          <div className="relative z-10 bg-white/85 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-3xl w-full my-10 animate-fadeIn self-start">
            {/* Conditional loading inside the card */}
            {!user ? (
              <div className="flex justify-center items-center py-20">
                <Loading />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-5 border-b pb-5 mb-5">
                  <Image
                    src={form.profilePhoto || "/images/avatars/cole.jpg"}
                    alt={form.name || "Unnamed User"}
                    width={96}
                    height={96}
                    className="rounded-full object-cover border-4 border-red-200"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {form.name || (
                        <span className="text-gray-400 italic flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                          No name provided
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-500">Admin</p>
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
              </>
            )}
          </div>

          {profileModalOpen &&
            createPortal(
              <div
                className="
                  fixed top-[4rem] left-0 right-0 bottom-0 z-[150]
                  flex items-center justify-center
                  bg-white/10 backdrop-blur-lg backdrop-saturate-150
                  transition-all duration-200
                "
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto relative">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Edit Profile
                  </h2>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name (required, max 50)
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        maxLength={50}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo URL (optional)
                      </label>
                      <input
                        type="text"
                        name="profilePhoto"
                        value={form.profilePhoto}
                        onChange={onChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Role (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={form.role}
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
                        disabled={isInvalid}
                        className="px-4 py-2 bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
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
    </>
  );
}
