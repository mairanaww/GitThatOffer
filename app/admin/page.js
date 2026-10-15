"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const editSectionRef = useRef(null);

  // Helper functions for date conversion
  const convertDDMMYYYYToYYYYMMDD = (ddmmyyyy) => {
    if (!ddmmyyyy || ddmmyyyy.length < 10) return "";
    const [day, month, year] = ddmmyyyy.split("-");
    return `${year}-${month}-${day}`;
  };

  const convertYYYYMMDDToDDMMYYYY = (yyyymmdd) => {
    if (!yyyymmdd) return "";
    const [year, month, day] = yyyymmdd.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    // Check if user is admin
    const adminEmails = [
      "team.gitthatoffer@gmail.com",
      "pranav.sin123@gmail.com",
      "atharv.del1610@gmail.com",
      "guptatanvi.099@gmail.com",
    ];
    if (!session.user.isAdmin && !adminEmails.includes(session.user.email)) {
      router.push("/dashboard");
      return;
    }

    fetchCompanies();
  }, [session, status, router]);

  const fetchCompanies = async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch companies");
      }
    } catch (error) {
      setError("Network error while fetching companies");
    }
  };

  const handleManualAdd = () => {
    setEditingData({
      name: "",
      role: "",
      location: "",
      cgpaCriteria: "",
      backlogsAllowed: "", // ADDED BACKLOGS FIELD
      pay: "",
      duration: "",
      branchesEligible: [],
      companyInfo: "",
      roleInfo: "",
      deadlines: [{ type: "", date: "", time: "23:59", description: "" }],
      applyLinks: [{ title: "", url: "" }],
    });
    setEditingCompanyId(null);
    setError("");
    setSuccess("");
    setTimeout(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleEditCompany = (company) => {
    setEditingData({
      name: company.name,
      role: company.role,
      location: company.location,
      cgpaCriteria: company.cgpaCriteria,
      backlogsAllowed: company.backlogsAllowed, // ADDED BACKLOGS FIELD
      pay: company.pay,
      duration: company.duration || "",
      branchesEligible: company.branchesEligible || [],
      companyInfo: company.companyInfo,
      roleInfo: company.roleInfo,
      deadlines: company.deadlines || [
        { type: "", date: "", time: "23:59", description: "" },
      ],
      applyLinks: company.applyLinks || [{ title: "", url: "" }],
    });
    setEditingCompanyId(company._id);
    setError("");
    setSuccess("");
    setTimeout(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError("");
    console.log("File selected:", file?.name);
  };

  const handleExtractInformation = async () => {
    if (!selectedFile && !textInput.trim()) {
      setError(
        "Please upload a PDF file or enter text before extracting information"
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
        console.log("Adding PDF file to extraction:", selectedFile.name);
      }

      if (textInput.trim()) {
        formData.append("text", textInput.trim());
        console.log(
          "Adding text to extraction, length:",
          textInput.trim().length
        );
      }

      console.log("Starting extraction with inputs...");
      console.log("Making request to: /api/admin/extract");

      const response = await fetch("/api/admin/extract", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        const extractedData = result.data;

        // Debug: Log the extracted data
        console.log("🔍 Full extracted data:", extractedData);
        console.log("🔍 Extracted deadlines:", extractedData.deadlines);
        console.log("🔍 Extracted apply links:", extractedData.applyLinks);
        console.log("🔍 Extracted duration:", extractedData.duration);

        // Ensure proper deadline structure - DON'T override with defaults
        const processedDeadlines =
          Array.isArray(extractedData.deadlines) &&
          extractedData.deadlines.length > 0
            ? extractedData.deadlines.map((deadline) => ({
                type: deadline.type || "",
                date: deadline.date || "",
                time: deadline.time || "23:59",
                description: deadline.description || "",
              }))
            : [{ type: "", date: "", time: "23:59", description: "" }];

        // Ensure proper apply links structure - DON'T override with defaults
        const processedApplyLinks =
          Array.isArray(extractedData.applyLinks) &&
          extractedData.applyLinks.length > 0
            ? extractedData.applyLinks.map((link) => ({
                title: link.title || "",
                url: link.url || "",
              }))
            : [{ title: "", url: "" }];

        console.log("🔍 Processed deadlines:", processedDeadlines);
        console.log("🔍 Processed apply links:", processedApplyLinks);

        setExtractedData(extractedData);
        setEditingData({
          name: extractedData.name || "",
          role: extractedData.role || "",
          location: extractedData.location || "",
          duration: extractedData.duration || "", // Don't override this!
          cgpaCriteria: extractedData.cgpaCriteria || "",
          backlogsAllowed: extractedData.backlogsAllowed || "", // ADDED BACKLOGS FIELD
          pay: extractedData.pay || "",
          branchesEligible: extractedData.branchesEligible || [],
          companyInfo: extractedData.companyInfo || "",
          roleInfo: extractedData.roleInfo || "",
          deadlines: processedDeadlines, // Use processed deadlines
          applyLinks: processedApplyLinks, // Use processed apply links
        });
        setTimeout(() => {
          editSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
        setEditingCompanyId(null);

        const deadlineCount = processedDeadlines.filter(
          (d) => d.date && d.type
        ).length;
        const linkCount = processedApplyLinks.filter((l) => l.url).length;

        setSuccess(`Information extracted successfully! 
  Company: ${extractedData.name || "Unknown"}`);

        console.log("✅ Final editing data set:", {
          duration: extractedData.duration,
          deadlines: processedDeadlines,
          applyLinks: processedApplyLinks,
        });
      } else {
        setError(result.error || "Failed to extract information");
        console.error("Extraction failed:", result);
      }
    } catch (error) {
      console.error("Error extracting information:", error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!editingData) return;

    if (
      !editingData.name ||
      editingData.name === "Not Available" ||
      !editingData.role ||
      editingData.role === "Not Available" ||
      !editingData.location ||
      editingData.location === "Not Available"
    ) {
      setError("Company name, role, and location are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Debug: Log what we're about to save
      console.log("🔍 About to save editing data:", editingData);
      console.log("🔍 Deadlines being saved:", editingData.deadlines);
      console.log("🔍 Apply links being saved:", editingData.applyLinks);
      console.log("🔍 Duration being saved:", editingData.duration);

      const url = editingCompanyId
        ? `/api/admin/companies/${editingCompanyId}`
        : "/api/admin/companies";

      const method = editingCompanyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingData),
      });

      const result = await response.json();

      if (response.ok) {
        const action = editingCompanyId ? "updated" : "saved";
        setSuccess(`Company "${editingData.name}" ${action} successfully!`);
        setExtractedData(null);
        setEditingData(null);
        setEditingCompanyId(null);
        setTextInput("");
        setSelectedFile(null);
        fetchCompanies();
      } else {
        setError(
          result.error ||
            `Failed to ${editingCompanyId ? "update" : "save"} company`
        );
      }
    } catch (error) {
      console.error("Error saving company:", error);
      setError("Error saving company");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      setError("");
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Company deleted successfully!");
        fetchCompanies();
      } else {
        const result = await response.json();
        setError(result.error || "Failed to delete company");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      setError("Error deleting company");
    }
  };

  const clearInputs = () => {
    setSelectedFile(null);
    setTextInput("");
    setEditingData(null);
    setExtractedData(null);
    setEditingCompanyId(null);
    setError("");
    setSuccess("");
  };

  const testEmail = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/email/test');
      const result = await response.json();
      
      if (result.success) {
        setSuccess("✅ Email connection successful!");
      } else {
        setError(`❌ Email test failed: ${result.error}`);
      }
    } catch (error) {
      setError(`❌ Email test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#111020] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-400 rounded-full mx-auto"></div>
          <p className="mt-4 text-xl text-gray-200">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const adminEmails = [
    "team.gitthatoffer@gmail.com",
    "pranav.sin123@gmail.com",
    "atharv.del1610@gmail.com",
    "guptatanvi.099@gmail.com",
  ];

  if (
    !session ||
    (!session.user.isAdmin && !adminEmails.includes(session.user.email))
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#111020] text-white">
      <header className="border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome, {session.user.name}!
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <section className="bg-[#1a192d] p-6 rounded-lg border border-gray-700 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Add Company</h2>
            <button
              onClick={handleManualAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              + Add Manually
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg mb-2">Upload PDF (optional)</h3>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf"
                maxSize={10 * 1024 * 1024}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-blue-300">
                  {selectedFile.name} selected
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">
                Paste Job Description (optional)
              </h3>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-[9.8em] bg-[#1a1a2e] text-gray-200 placeholder-gray-500 p-3 mt-[0.1em] rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Paste description here..."
              />
              {selectedFile && textInput && (
                <button
                  onClick={clearInputs}
                  className="text-red-400 hover:underline"
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExtractInformation}
              disabled={loading || (!selectedFile && !textInput)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Extracting..." : "Extract Info"}
            </button>
            
            <button
              onClick={testEmail}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Email Connection"}
            </button>
          </div>

          {editingData && (
            <div className="mt-8" ref={editSectionRef}>
              <h3 className="text-xl font-semibold mb-4 text-white">
                {editingCompanyId
                  ? "Edit Company"
                  : extractedData
                  ? "Extracted Company Details"
                  : "Manual Company Entry"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                {/* Company Name */}
                <div className="flex flex-col">
                  <label className="mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) =>
                      setEditingData({ ...editingData, name: e.target.value })
                    }
                    className={`p-3 rounded bg-[#1e1e2f] text-white border ${
                      !editingData.name ? "border-red-500" : "border-gray-700"
                    } focus:outline-none`}
                    placeholder="Company Name"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col">
                  <label className="mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingData.role}
                    onChange={(e) =>
                      setEditingData({ ...editingData, role: e.target.value })
                    }
                    className={`p-3 rounded bg-[#1e1e2f] text-white border ${
                      !editingData.role ? "border-red-500" : "border-gray-700"
                    } focus:outline-none`}
                    placeholder="Role"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col">
                  <label className="mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingData.location}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        location: e.target.value,
                      })
                    }
                    className={`p-3 rounded bg-[#1e1e2f] text-white border ${
                      !editingData.location
                        ? "border-red-500"
                        : "border-gray-700"
                    } focus:outline-none`}
                    placeholder="Location"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col">
                  <label className="mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingData.duration}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        duration: e.target.value,
                      })
                    }
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6 months, 3 months"
                  />
                </div>

                {/* CGPA Criteria */}
                <div className="flex flex-col">
                  <label className="mb-1">CGPA</label>
                  <input
                    type="text"
                    value={editingData.cgpaCriteria}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        cgpaCriteria: e.target.value,
                      })
                    }
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CGPA Criteria"
                  />
                </div>

                {/* Backlogs Allowed - NEW FIELD */}
                <div className="flex flex-col">
                  <label className="mb-1">Backlogs Allowed</label>
                  <input
                    type="number"
                    min="0"
                    value={editingData.backlogsAllowed}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        backlogsAllowed: e.target.value,
                      })
                    }
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2 (leave empty if not specified)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty if not specified (allows any number of backlogs)
                  </p>
                </div>

                {/* Pay */}
                <div className="flex flex-col">
                  <label className="mb-1">Pay</label>
                  <input
                    type="text"
                    value={editingData.pay}
                    onChange={(e) =>
                      setEditingData({ ...editingData, pay: e.target.value })
                    }
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pay (LPA)"
                  />
                </div>

                {/* Eligible Branches */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="mb-1">Branches</label>
                  <input
                    type="text"
                    value={editingData.branchesEligible?.join(", ")}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        branchesEligible: e.target.value
                          .split(",")
                          .map((b) => b.trim()),
                      })
                    }
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Eligible Branches (Comma Separated)"
                  />
                </div>

                {/* Apply Links */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="mb-1">Apply Links (1-2 links)</label>
                  {editingData.applyLinks?.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 mb-2"
                    >
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...editingData.applyLinks];
                          newLinks[index].title = e.target.value;
                          setEditingData({
                            ...editingData,
                            applyLinks: newLinks,
                          });
                        }}
                        className="flex-1 p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Link Title (e.g., Company Portal)"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...editingData.applyLinks];
                          newLinks[index].url = e.target.value;
                          setEditingData({
                            ...editingData,
                            applyLinks: newLinks,
                          });
                        }}
                        className="flex-1 p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/apply"
                      />
                      {editingData.applyLinks.length >= 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = editingData.applyLinks.filter(
                              (_, i) => i !== index
                            );
                            setEditingData({
                              ...editingData,
                              applyLinks: newLinks,
                            });
                          }}
                          className="
            px-3 py-2 bg-red-600/80 text-white rounded hover:bg-red-700/80
            w-full sm:w-auto md:w-9 md:h-9 md:p-0 flex items-center justify-center
            transition
          "
                          aria-label="Remove apply link"
                        >
                          <span className="block md:hidden">Remove</span>
                          <XMarkIcon className="hidden md:block w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {editingData.applyLinks?.length < 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = [
                          ...(editingData.applyLinks || []),
                          { title: "", url: "" },
                        ];
                        setEditingData({
                          ...editingData,
                          applyLinks: newLinks,
                        });
                      }}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
                    >
                      Add Another Link
                    </button>
                  )}
                </div>

                {/* Multiple Deadlines with Time */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="mb-1">Deadlines</label>
                  {editingData.deadlines?.map((deadline, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
                    >
                      <input
                        type="text"
                        value={deadline.type}
                        onChange={(e) => {
                          const newDeadlines = [...editingData.deadlines];
                          newDeadlines[index].type = e.target.value;
                          setEditingData({
                            ...editingData,
                            deadlines: newDeadlines,
                          });
                        }}
                        className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Deadline Type"
                      />
                      <input
                        type="date"
                        value={
                          deadline.date
                            ? convertDDMMYYYYToYYYYMMDD(deadline.date)
                            : ""
                        }
                        onChange={(e) => {
                          const newDeadlines = [...editingData.deadlines];
                          newDeadlines[index].date = convertYYYYMMDDToDDMMYYYY(
                            e.target.value
                          );
                          setEditingData({
                            ...editingData,
                            deadlines: newDeadlines,
                          });
                        }}
                        className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={deadline.time || "23:59"}
                        onChange={(e) => {
                          const newDeadlines = [...editingData.deadlines];
                          newDeadlines[index].time = e.target.value;
                          setEditingData({
                            ...editingData,
                            deadlines: newDeadlines,
                          });
                        }}
                        className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={deadline.description}
                          onChange={(e) => {
                            const newDeadlines = [...editingData.deadlines];
                            newDeadlines[index].description = e.target.value;
                            setEditingData({
                              ...editingData,
                              deadlines: newDeadlines,
                            });
                          }}
                          className="flex-1 p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description"
                        />
                        {/* Remove Button: Text on mobile, cross icon on md+ */}
                        <button
                          type="button"
                          onClick={() => {
                            const newDeadlines = editingData.deadlines.filter(
                              (_, i) => i !== index
                            );
                            setEditingData({
                              ...editingData,
                              deadlines: newDeadlines,
                            });
                          }}
                          className="
    px-3 py-2 bg-red-600/80 text-white rounded hover:bg-red-700/80
    w-full md:w-9 md:h-9 md:p-0 flex items-center justify-center
    transition
  "
                          aria-label="Remove deadline"
                        >
                          {/* Show text on mobile, hide on md+ */}
                          <span className="block md:hidden">Remove</span>
                          {/* Show icon on md+, hide on mobile */}
                          <XMarkIcon className="hidden md:block w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newDeadlines = [
                        ...(editingData.deadlines || []),
                        { type: "", date: "", time: "23:59", description: "" },
                      ];
                      setEditingData({
                        ...editingData,
                        deadlines: newDeadlines,
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
                  >
                    Add Deadline
                  </button>
                </div>

                {/* Company Info */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="mb-1">Company Info</label>
                  <textarea
                    value={editingData.companyInfo}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        companyInfo: e.target.value,
                      })
                    }
                    rows={6} // <-- Makes the textarea taller
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" // <-- Ensures a minimum height
                    placeholder="Company Info"
                  />
                </div>

                {/* Role Info */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="mb-1">Role Info</label>
                  <textarea
                    value={editingData.roleInfo}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        roleInfo: e.target.value,
                      })
                    }
                    rows={6} // <-- Makes the textarea taller
                    className="p-3 rounded bg-[#1e1e2f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" // <-- Ensures a minimum height
                    placeholder="Role Info"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSaveCompany}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md text-white"
                >
                  {loading
                    ? "Saving..."
                    : editingCompanyId
                    ? "Update Company"
                    : "Save Company"}
                </button>
                <button
                  onClick={clearInputs}
                  className="text-gray-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {error && (
          <p className="mb-10 mt-[-2em] text-red-400 bg-red-900/20 p-3 rounded-md whitespace-pre-line">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-green-400 bg-green-900/20 p-3 rounded-md whitespace-pre-line">
            {success}
          </p>
        )}

        <section className="bg-[#1a192d] p-6 rounded-lg border border-gray-700 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              Existing Companies ({companies.length})
            </h2>
          </div>
          <div className="p-6">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-300 text-lg font-medium">
                  No companies added yet
                </p>
                <p className="text-gray-400 mt-1">
                  Use extraction or manual entry to add your first company!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {companies.map((company) => (
                  <div
                    key={company._id}
                    className="border bg-[#1c1b2a] border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow overflow-hidden break-words"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-medium text-gray-100 break-words">
                          {company.name}
                        </h3>
                        <p className="text-gray-300 mt-1 break-words">
                          {company.role} - {company.location}
                          {company.duration && (
                            <span className="ml-4">
                              Duration: {company.duration}
                            </span>
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 p-2 bg-blue-400/20 text-blue-300 rounded-full text-md font-medium bg-blue-100">
                            CGPA: {company.cgpaCriteria || "Not specified"}+
                          </span>
                          
                          {/* ADDED BACKLOGS BADGE */}
                          <span className="inline-flex items-center px-2.5 py-0.5 p-2 bg-orange-400/20 text-orange-300 rounded-full text-md font-medium">
                            Backlogs: {company.backlogsAllowed !== null && company.backlogsAllowed !== undefined 
                              ? `Max ${company.backlogsAllowed}` 
                              : 'Not Specified'}
                          </span>
                          
                          <span className="inline-flex items-center bg-green-400/20 p-2 text-green-300 px-2.5 py-0.5 rounded-full text-md font-medium bg-green-100">
                            Pay: {company.pay || "Not specified"}
                          </span>
                          {company.branchesEligible &&
                            company.branchesEligible.length > 0 && (
                              <span className="inline-flex items-center bg-purple-400/20 text-purple-300 p-2 px-2.5 py-0.5 rounded-full text-md font-medium bg-purple-100">
                                {company.branchesEligible.length} branches
                                eligible
                              </span>
                            )}
                          {company.deadlines &&
                            company.deadlines.length > 0 && (
                              <span className="inline-flex items-center bg-yellow-400/20 text-yellow-300 p-2 px-2.5 py-0.5 rounded-full text-md font-medium bg-yellow-100">
                                {company.deadlines.length} deadline
                                {company.deadlines.length > 1 ? "s" : ""}
                              </span>
                            )}
                          {company.applyLinks &&
                            company.applyLinks.length > 0 && (
                              <span className="inline-flex items-center bg-indigo-400/20 text-indigo-300 p-2 px-2.5 py-0.5 rounded-full text-md font-medium bg-indigo-100">
                                {company.applyLinks.filter((l) => l.url).length}{" "}
                                apply link
                                {company.applyLinks.filter((l) => l.url)
                                  .length > 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                        </div>
                        {company.companyInfo && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2 break-words">
                            {company.companyInfo}
                          </p>
                        )}
                      </div>
                      {/* Responsive button group */}
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:ml-4">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="w-1/2 md:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md duration-500 text-white bg-blue-600/70 hover:bg-blue-700/70"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company._id)}
                          className="w-1/2 md:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md duration-500 text-white bg-red-600/70 hover:bg-red-700/70"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
