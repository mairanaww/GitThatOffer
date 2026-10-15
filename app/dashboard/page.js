"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CompanyCard from "../components/CompanyCard";
import CompanyFilter from "../components/CompanyFilter";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [counts, setCounts] = useState({
    all: 0,
    interested: 0,
    applied: 0,
    not_interested: 0,
  });

  // UPDATED ELIGIBILITY CHECK FUNCTION INCLUDING BACKLOG
  const checkEligibility = (company, userProfile) => {
    if (!userProfile || !userProfile.branch || userProfile.cgpa === null) {
      return { eligible: false, reason: "Complete your profile first" };
    }

    // CGPA check
    if (company.cgpaCriteria && userProfile.cgpa < company.cgpaCriteria) {
      return { 
        eligible: false, 
        reason: `CGPA requirement: ${company.cgpaCriteria}+ (You have: ${userProfile.cgpa})` 
      };
    }

    // Branch check
    if (company.branchesEligible && company.branchesEligible.length > 0) {
      const userBranch = userProfile.branch.toLowerCase();
      const isEligibleBranch = company.branchesEligible.some(eligibleBranch => {
        const eligible = eligibleBranch.toLowerCase();
        return eligible.includes(userBranch) || userBranch.includes(eligible);
      });
      
      if (!isEligibleBranch) {
        return { 
          eligible: false, 
          reason: `Branch requirement: ${company.branchesEligible.join(', ')}` 
        };
      }
    }

    // Backlog check - NEW
    if (company.backlogsAllowed !== null && company.backlogsAllowed !== undefined) {
      if (userProfile.backlogs > company.backlogsAllowed) {
        return { 
          eligible: false, 
          reason: `Backlog requirement: Max ${company.backlogsAllowed} (You have: ${userProfile.backlogs})` 
        };
      }
    }

    return { eligible: true, reason: "You're eligible!" };
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      window.location.href = "/";
      return;
    }

    fetchCompanies();
  }, [session, status]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/companies");

      if (response.ok) {
        const data = await response.json();
        
        // UPDATED TO USE NEW ELIGIBILITY CHECK WITH BACKLOGS
        const companiesWithEligibility = data.map(company => {
          const eligibilityResult = checkEligibility(company, session.user);
          return {
            ...company,
            isEligible: eligibilityResult.eligible,
            eligibilityReason: eligibilityResult.reason
          };
        });
        
        setCompanies(companiesWithEligibility);
        setCounts({
          all: companiesWithEligibility.length,
          interested: companiesWithEligibility.filter((c) => c.userStatus === "interested").length,
          applied: companiesWithEligibility.filter((c) => c.userStatus === "applied").length,
          not_interested: companiesWithEligibility.filter((c) => c.userStatus === "not_interested").length,
        });
      } else {
        const errorData = await response.json();
        if (errorData.redirect === "/setup") {
          router.push("/setup");
          return;
        }
        setError("Failed to fetch companies");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    const updated = companies.map((company) =>
      company._id === companyId
        ? { ...company, userStatus: newStatus }
        : company
    );
    setCompanies(updated);

    setCounts({
      all: updated.length,
      interested: updated.filter((c) => c.userStatus === "interested").length,
      applied: updated.filter((c) => c.userStatus === "applied").length,
      not_interested: updated.filter((c) => c.userStatus === "not_interested")
        .length,
    });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#111020] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Filter companies based on status and eligibility
  let filteredCompanies = companies;

  // First filter by status
  if (filter !== "all") {
    filteredCompanies = filteredCompanies.filter((c) => c.userStatus === filter);
  }

  // Then filter by eligibility if toggle is on
  if (showEligibleOnly) {
    filteredCompanies = filteredCompanies.filter(company => company.isEligible);
  }

  const eligibleCount = companies.filter(company => company.isEligible).length;

  return (
    <div className="min-h-screen bg-[#111020]">
      {/* Header */}
      <div className="bg-[#111020] shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Welcome and Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white text-center md:text-left">
                Welcome back, <br className="md:hidden" />{session.user.name}!
              </h1>

              <div className="mt-4 bg-[#1b1a2e] rounded-xl p-5 border border-gray-700">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    {[
                      {
                        label: "Email",
                        value: session.user.email,
                        color: "border border-yellow-700 bg-yellow-300/10",
                        size: "md:text-lg",
                      },
                      {
                        label: "Branch",
                        value: session.user.branch || "Not set",
                        color: "border border-blue-800 bg-blue-400/10",
                        size: "md:text-lg",
                      },
                      {
                        label: "CGPA",
                        value: session.user.cgpa ?? "Not set",
                        color: "border border-green-700 bg-green-300/10",
                        size: "md:text-lg",
                      },
                      {
                        label: "Backlogs",
                        value: session.user.backlogs ?? "Not set",
                        color: "border border-rose-700 bg-rose-300/10",
                        size: "md:text-lg",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex flex-col px-4 py-3 rounded-xl border border-gray-700 shadow-md bg-gradient-to-br ${item.color} bg-opacity-10 backdrop-blur-md`}
                      >
                        <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase mb-1">
                          {item.label}
                        </span>
                        <span
                          className={`text-lg font-semibold text-white ${
                            item.size
                          } ${
                            item.label === "Email"
                              ? "truncate md:whitespace-nowrap overflow-hidden text-ellipsis"
                              : "break-words"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => router.push("/setup")}
                    className="self-start md:self-center p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition duration-500 shadow-sm border border-gray-600"
                    title="Edit Profile"
                  >
                    <svg
                      className="h-5 w-5"
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
                  </button>
                </div>
              </div>
            </div>

            {/* Admin & Sign Out Buttons */}
            <div className="flex gap-3 flex-wrap">
              {(
                session.user.isAdmin ||
                [
                  "team.gitthatoffer@gmail.com",
                  "pranav.sin123@gmail.com",
                  "atharv.del1610@gmail.com",
                  "guptatanvi.099@gmail.com",
                ].includes(session.user.email)
              ) && (
                <button
                  onClick={() => router.push("/admin")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium shadow-md border border-gray-600 duration-500 transform focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  Admin
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-800 hover:bg-red-900 text-gray-200 font-medium shadow-md border border-red-600 duration-500 transform focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <LoadingSpinner />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-24">
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-blue-800/20">
                <svg
                  className="h-7 w-7 text-blue-500"
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
              <h3 className="mt-4 text-lg font-semibold text-gray-200">
                No companies available
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Check back later for new job opportunities that match your
                profile.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Available Opportunities
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {companies.length} companies available, {eligibleCount} match your profile
                </p>
              </div>

              {/* Company Filter Toggle */}
              <CompanyFilter 
                showEligibleOnly={showEligibleOnly}
                setShowEligibleOnly={setShowEligibleOnly}
                eligibleCount={eligibleCount}
                totalCount={companies.length}
              />

              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { key: "all", label: `All (${counts.all})` },
                  {
                    key: "interested",
                    label: `Interested (${counts.interested})`,
                  },
                  { key: "applied", label: `Applied (${counts.applied})` },
                  {
                    key: "not_interested",
                    label: `Not Interested (${counts.not_interested})`,
                  },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition duration-500 ${
                      filter === key
                        ? "bg-blue-900 border-blue-500 text-white"
                        : "bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company._id}
                    company={company}
                    onStatusChange={handleStatusChange}
                    isEligible={company.isEligible}
                    eligibilityReason={company.eligibilityReason}
                    userBranch={session.user.branch}
                    userCGPA={session.user.cgpa}
                    userBacklogs={session.user.backlogs} // ADDED USER BACKLOGS
                  />
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    {showEligibleOnly 
                      ? "No eligible companies found with the current filters."
                      : "No companies found with the current filters."
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
