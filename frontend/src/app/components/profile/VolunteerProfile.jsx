"use client";
import Image from "next/image";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import Loading from "../loading/Loading";
import { createPortal } from "react-dom";
import { fetchWithAuth, getUserIdFromToken } from "../../authHelper";
import toast from "react-hot-toast";

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Reference data
  const [states, setStates] = useState([]);
  const [skills, setSkills] = useState([]);

  // Controlled form state
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

  // Controlled chips state
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const todayISO = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );
  const isPastDate = (isoDate) =>
    new Date(isoDate) < new Date(new Date().setHours(0, 0, 0, 0));

  // Calendar helpers (no mutation)
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const buildMonthDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Determine how many blanks to pad before the 1st (so weeks align Sun-Sat)
    const firstWeekday = start.getDay(); // 0=Sun ... 6=Sat
    const days = [];

    // padding leading blanks
    for (let i = 0; i < firstWeekday; i++) {
      days.push(null);
    }

    // actual days
    for (let d = 1; d <= end.getDate(); d++) {
      const dayISO = new Date(date.getFullYear(), date.getMonth(), d)
        .toISOString()
        .split("T")[0];
      days.push(dayISO);
    }

    return days;
  };

  const monthDays = useMemo(() => buildMonthDays(calendarMonth), [calendarMonth]);

  const fetchProfile = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const res = await fetchWithAuth(`${API_URL}/api/users/${userId}`);
    if (!res.ok) {
      console.error("Error fetching user data");
      return;
    }
    const data = await res.json();

    // Normalize
    const normalizedSkills = Array.isArray(data.skills)
      ? data.skills.map((s) => s.skills?.description).filter(Boolean)
      : [];

    const normalizedDates = Array.isArray(data.availability)
      ? data.availability
      : data.availability
      ? [data.availability]
      : [];

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
      role: data.role || "Volunteer",
    });
    setSelectedSkills(normalizedSkills);
    setSelectedDates(normalizedDates);
  };

  useEffect(() => {
    // bootstrap reference data
    fetchWithAuth(`${API_URL}/api/states/`)
      .then((r) => r.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error fetching states:", e));

    fetchWithAuth(`${API_URL}/api/skills/`)
      .then((r) => r.json())
      .then((data) => setSkills(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error fetching skills:", e));
  }, [API_URL]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const openModal = () => setProfileModalOpen(true);
  const closeModal = () => setProfileModalOpen(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addSkill = (desc) => {
    if (!desc) return;
    if (!selectedSkills.includes(desc)) {
      setSelectedSkills((prev) => [...prev, desc]);
    }
  };

  const removeSkill = (desc) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== desc));
  };

  const addDate = (iso) => {
    if (!iso || isPastDate(iso)) return;
    if (!selectedDates.includes(iso)) {
      setSelectedDates((prev) => [...prev, iso]);
    }
  };

  const toggleCalendarDay = (iso) => {
    if (!iso || isPastDate(iso)) return;
    setSelectedDates((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
    );
  };

  const isInvalid =
    !form.name.trim() ||
    !form.address1.trim() ||
    !form.city.trim() ||
    !form.state.trim() ||
    !form.zip.trim() ||
    form.zip.length < 5 ||
    form.zip.length > 9 ||
    selectedSkills.length === 0 ||
    selectedDates.length === 0 ||
    form.name.length > 50 ||
    form.address1.length > 100 ||
    form.address2.length > 100 ||
    form.city.length > 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInvalid) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    const payload = {
      full_name: form.name,
      address_1: form.address1,
      address_2: form.address2 || null,
      city: form.city,
      state: form.state, 
      zipcode: form.zip,
      preferences: form.preferences || null,
      profilePhoto: form.profilePhoto || null,
      skills: selectedSkills, 
      availability: selectedDates,
    };

    try {
      const userId = getUserIdFromToken();
      const res = await fetchWithAuth(`${API_URL}/api/users/${userId}/update`, {
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
      {!user ? (
        <div className="flex justify-center items-center mt-20">
          <Loading />
        </div>
      ) : (
        <div
          className="min-h-[calc(100vh-4rem)] flex justify-center bg-cover bg-center bg-no-repeat p-6 relative"
          style={{ backgroundImage: "url('/profile_background.jpg')" }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Profile content card */}
          <div className="relative z-10 bg-white/85 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-3xl w-full my-10 animate-fadeIn self-start">
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
                <p className="text-gray-500">Volunteer</p>
              </div>
            </div>

            {/* Contact & Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Contact Information
                </h2>

                {form.address1 ? (
                  <p className="text-gray-700">
                    {form.address1}
                    {form.address2 && `, ${form.address2}`}
                  </p>
                ) : (
                  <MissingField text="No address provided." />
                )}

                {form.city || form.state || form.zip ? (
                  <p className="text-gray-700">
                    {form.city || "Unknown City"}, {form.state || "N/A"}{" "}
                    {form.zip || "N/A"}
                  </p>
                ) : (
                  <MissingField text="No city/state/ZIP provided." />
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Preferences
                </h2>
                {form.preferences ? (
                  <p className="text-gray-700">{form.preferences}</p>
                ) : (
                  <MissingField text="No preferences specified." />
                )}
              </div>
            </div>

            {/* Skills & Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Skills
                </h2>
                {selectedSkills && selectedSkills.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedSkills.map((skill, idx) => (
                      <li key={`${skill}-${idx}`}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <MissingField text="No skills specified." />
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Availability
                </h2>
                {selectedDates && selectedDates.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedDates.map((d) => (
                      <li key={d}>
                        {new Date(d).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <MissingField text="No availability set." />
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

                    {/* Address 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 1 (required, max 100)
                      </label>
                      <input
                        type="text"
                        name="address1"
                        value={form.address1}
                        onChange={onChange}
                        maxLength={100}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Address 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 2 (optional, max 100)
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={form.address2}
                        onChange={onChange}
                        maxLength={100}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City (required, max 100)
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        maxLength={100}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State (required)
                      </label>
                      <select
                        name="state"
                        value={form.state}
                        onChange={onChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      >
                        <option value="">Select a state...</option>
                        {states.map((st) => (
                          <option key={st.state_id} value={st.state_code}>
                            {st.state_code} — {st.state_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ZIP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code (required, 5–9 chars)
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={form.zip}
                        onChange={onChange}
                        minLength={5}
                        maxLength={9}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Skills (dropdown → chips) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skills (required)
                      </label>
                      <select
                        className="border p-2 rounded w-full bg-white"
                        onChange={(e) => addSkill(e.target.value)}
                        value=""
                      >
                        <option value="">Add skill...</option>
                        {skills.map((s) => (
                          <option key={s.skill_id} value={s.description}>
                            {s.description}
                          </option>
                        ))}
                      </select>

                      <div className="flex flex-wrap mt-2 gap-2">
                        {selectedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              className="text-red-900"
                              onClick={() => removeSkill(skill)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      {selectedSkills.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Choose at least one skill.
                        </p>
                      )}
                    </div>

                    {/* Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferences (optional)
                      </label>
                      <textarea
                        name="preferences"
                        value={form.preferences}
                        onChange={onChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    {/* Availability (date picker + chips + calendar grid) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability (pick multiple dates — required)
                      </label>

                      {/* Single date adder */}
                      <input
                        type="date"
                        min={todayISO}
                        onChange={(e) => addDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        className="border p-2 rounded w-full"
                      />

                      {/* Chips */}
                      <div className="flex flex-wrap mt-2 gap-2">
                        {selectedDates.map((date) => (
                          <span
                            key={date}
                            className="flex items-center gap-1 bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm"
                          >
                            {new Date(date).toLocaleDateString()}
                            <button
                              type="button"
                              className="text-blue-900"
                              onClick={() =>
                                setSelectedDates((prev) =>
                                  prev.filter((d) => d !== date)
                                )
                              }
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      {selectedDates.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Choose at least one date.
                        </p>
                      )}

                      {/* Calendar Grid */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCalendarMonth(
                                new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth() - 1,
                                  1
                                )
                              )
                            }
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            ‹ Prev
                          </button>

                          <span className="font-semibold">
                            {calendarMonth.toLocaleString("default", {
                              month: "long",
                            })}{" "}
                            {calendarMonth.getFullYear()}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setCalendarMonth(
                                new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth() + 1,
                                  1
                                )
                              )
                            }
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            Next ›
                          </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 text-xs text-gray-500 mb-1 text-center">
                          <div>Sun</div>
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center">
                          {monthDays.map((iso, i) =>
                            iso ? (
                              <button
                                type="button"
                                key={iso}
                                disabled={isPastDate(iso)}
                                onClick={() => toggleCalendarDay(iso)}
                                className={`px-2 py-1 rounded text-sm border
                                  ${
                                    isPastDate(iso)
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : selectedDates.includes(iso)
                                      ? "bg-blue-600 text-white border-blue-700"
                                      : "bg-white hover:bg-blue-100"
                                  }`}
                              >
                                {new Date(iso).getDate()}
                              </button>
                            ) : (
                              <div key={`pad-${i}`} />
                            )
                          )}
                        </div>
                      </div>
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
      )}
    </>
  );
}
