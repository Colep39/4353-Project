"use client";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Loading from "../loading/Loading";
import { createPortal } from "react-dom";
import { fetchWithAuth, getUserIdFromToken } from '../../authHelper';
import toast from "react-hot-toast";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "@/store/useUserStore";

export default function VolunteerProfile() {
  const [localuser, setLocalUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { user, setUser } = useUserStore();

  const [form, setForm] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    preferences: "",
    profile_photo: "",
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
    setLocalUser(data); // local state for profile
    setUser(data); // global state for navbar
    setForm({
      name: data.full_name || "",
      address1: data.address_1 || "",
      address2: data.address_2 || "",
      city: data.city || "",
      state: data.state?.state_code || "",
      zip: data.zipcode || "",
      preferences: data.preferences || "",
      profile_photo: data.profile_photo || "",
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

  // handle file uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // show preview
    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, profile_photo: previewUrl }));

    try {
      const userId = getUserIdFromToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      // send to backend endpoint that uploads to Supabase Storage or saves locally
      const res = await fetch(`${API_URL}/api/upload/profile-photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const { fileUrl } = await res.json();

      // update form to use permanent URL
      setForm((f) => ({ ...f, profile_photo: fileUrl }));
      toast.success("Profile photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Error uploading profile photo.");
    }
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
      profile_photo: form.profile_photo || null,
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
            {!localuser ? (
              <div className="flex justify-center items-center py-20">
                <Loading />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-5 border-b pb-5 mb-5">
                  <Image
                    src={user?.profile_photo || "/images/avatars/cole.jpg"}
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
                    
                    {/* Profile Photo Upload */}
                    <div className="flex flex-col items-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo (optional)
                      </label>

                      {/* Upload area */}
                      <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-red-400 hover:bg-red-50 transition cursor-pointer relative">
                        <input
                          id="profilePhotoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {/* Upload icon & text */}
                        <div className="text-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto h-10 w-10 text-gray-400 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6.1a5 5 0 011.1 9.9H7z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 12v9m0 0l-3-3m3 3l3-3"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-red-600">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, or JPEG up to 5 MB</p>
                        </div>
                      </div>
                      {/* Preview */}
                      {form.profile_photo && (
                        <div className="mt-4 flex flex-col items-center">
                          <Image
                            src={form.profile_photo}
                            alt="Profile Preview"
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-red-200 object-cover shadow-md"
                          />
                          <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, profile_photo: "" }))}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 transition"
                          >
                            Remove photo
                          </button>
                          </div>
                          )}
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
