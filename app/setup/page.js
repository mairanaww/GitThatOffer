"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Setup() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    branch: "",
    cgpa: "",
    backlogs: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // New state
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (status === "loading" || submitting) return;

    if (!session) {
      router.push("/");
      return;
    }

    // Check if user has existing profile data and pre-populate
    if (
      session.user.branch ||
      session.user.cgpa !== undefined ||
      session.user.backlogs !== undefined
    ) {
      setIsEdit(true);
      setFormData({
        branch: session.user.branch || "",
        cgpa:
          session.user.cgpa !== undefined ? session.user.cgpa.toString() : "",
        backlogs:
          session.user.backlogs !== undefined
            ? session.user.backlogs.toString()
            : "",
      });
    }
  }, [session, status, router, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitting(true); // Prevent re-renders
    setError("");

    // Validation
    if (!formData.branch || !formData.cgpa || formData.backlogs === "") {
      setError("All fields are required");
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10) {
      setError("CGPA must be between 0 and 10");
      setLoading(false);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch: formData.branch,
          cgpa: parseFloat(formData.cgpa),
          backlogs: parseInt(formData.backlogs),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Don't show any UI updates, just redirect immediately
        window.location.replace("/dashboard"); // Use replace to avoid history entry
      } else {
        setError(data.error || "Error updating profile");
        setLoading(false);
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Network error. Please try again.");
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (status === "loading" || submitting) {
    return (
      <div className="min-h-screen bg-[#111020] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-200">
            {submitting ? "Saving profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#111020] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-200">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-200">
            {isEdit ? "Edit Your Profile" : "Complete Your Profile"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isEdit
              ? `Update your information below, ${session.user.name}`
              : `Welcome ${session.user.name}! Please provide your academic details to get started.`}
          </p>
        </div>

        <div className="bg-[#111020] text-white py-8 px-6 shadow-2xl rounded-xl border border-gray-700 backdrop-blur-sm">
          {error && (
            <div className="mb-6 flex items-center gap-3 text-sm text-red-600 bg-red-100 bg-opacity-10 border border-red-500 px-4 py-3 rounded-md shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.618-1.276.894-2.118L13.894 4.882c-.723-.842-2.065-.842-2.788 0L4.188 17.882c-.724.842-.16 2.118.894 2.118z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Branch */}
            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-semibold text-gray-100 mb-1"
              >
                Branch/Department <span className="text-red-500">*</span>
              </label>
              <select
                id="branch"
                name="branch"
                className="block w-full px-4 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                required
              >
                <option value="">Select your branch</option>
                <option value="AAE">Aeronautical Engineering (AAE)</option>
                <option value="AE">Automobile Engineering (AE)</option>
                <option value="BME">Bio Medical Engineering (BME)</option>
                <option value="BT">Bio Technology (BT)</option>
                <option value="CHE">Chemical Engineering (CHE)</option>
                <option value="CE">Civil Engineering (CE)</option>
                <option value="CCE">
                  Computer and Communication Engineering (CCE)
                </option>
                <option value="CSE">
                  Computer Science and Engineering (CSE)
                </option>
                <option value="CSE-AIML">
                  Computer Science and Engineering - AI & ML (CSE-AIML)
                </option>
                <option value="CSFT">
                  Computer Science and Financial Technology (CSFT)
                </option>
                <option value="CPS">Cyber Physical Systems (CPS)</option>
                <option value="DSE">Data Science and Engineering (DSE)</option>
                <option value="EEE">
                  Electrical and Electronics Engineering (EEE)
                </option>
                <option value="ECE">
                  Electronics and Communication Engineering (ECE)
                </option>
                <option value="ENI">
                  Electronics and Instrumentation Engineering (ENI)
                </option>
                <option value="ECE-VLSI">
                  Electronics Engineering - VLSI Design and Technology (ECE-VLSI)
                </option>
                <option value="IE">Industrial Engineering (IE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="MNC">Mathematics and Computing (MNC)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="MTE">Mechatronics (MTE)</option>
              </select>
            </div>

            {/* CGPA */}
            <div>
              <label
                htmlFor="cgpa"
                className="block text-sm font-semibold text-gray-100 mb-1"
              >
                CGPA (0.0 - 10.0) <span className="text-red-500">*</span>
              </label>
              <input
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g., 8.5"
                className="block w-full px-4 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.cgpa}
                onChange={(e) =>
                  setFormData({ ...formData, cgpa: e.target.value })
                }
                required
              />
            </div>

            {/* Backlogs */}
            <div>
              <label
                htmlFor="backlogs"
                className="block text-sm font-semibold text-gray-100 mb-1"
              >
                Number of Backlogs (0-99){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="backlogs"
                name="backlogs"
                type="number"
                min="0"
                max="99"
                placeholder="e.g., 0"
                className="block w-full px-4 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.backlogs}
                onChange={(e) =>
                  setFormData({ ...formData, backlogs: e.target.value })
                }
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300 shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update Profile"
                ) : (
                  "Complete Setup"
                )}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-gray-700 text-white font-medium hover:bg-gray-600 transition duration-300 shadow-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
