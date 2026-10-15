"use client";
import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function CompanyCard({
  company,
  onStatusChange,
  isAdmin = false,
  onDelete,
  isEligible = true,
  eligibilityReason,
  userBranch,
  userCGPA,
  userBacklogs = 0, // ADDED BACKLOGS PROP
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    company.userStatus || "none"
  );
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    setCurrentStatus(company.userStatus || "none");
  }, [company.userStatus]);

  // Get next deadline
  const getNextDeadline = () => {
    if (!company.deadlines || company.deadlines.length === 0) return null;

    const now = new Date();
    const upcomingDeadlines = company.deadlines
      .filter((d) => {
        // Parse DD-MM-YYYY format
        const [day, month, year] = d.date.split("-");
        const [hours, minutes] = (d.time || "23:59").split(":");
        const deadlineDate = new Date(year, month - 1, day, hours, minutes);
        return deadlineDate > now;
      })
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("-");
        const [hoursA, minutesA] = (a.time || "23:59").split(":");
        const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

        const [dayB, monthB, yearB] = b.date.split("-");
        const [hoursB, minutesB] = (b.time || "23:59").split(":");
        const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

        return dateA - dateB;
      });

    return upcomingDeadlines[0] || company.deadlines[0];
  };

  const nextDeadline = getNextDeadline();
  const otherDeadlines =
    company.deadlines?.filter((d) => d !== nextDeadline) || [];

  // Calculate countdown with time support
  useEffect(() => {
    if (!nextDeadline) return;

    const updateCountdown = () => {
      const now = new Date().getTime();

      // Parse DD-MM-YYYY date and time
      const [day, month, year] = nextDeadline.date.split("-");
      const [hours, minutes] = (nextDeadline.time || "23:59").split(":");
      const deadlineTime = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      ).getTime();

      const difference = deadlineTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (days > 0) {
          setTimeLeft(`${days} day${days > 1 ? "s" : ""} left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hour${hours > 1 ? "s" : ""} left`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes} minute${minutes > 1 ? "s" : ""} left`);
        } else {
          setTimeLeft("Less than a minute left");
        }
      } else {
        setTimeLeft("Deadline passed");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [nextDeadline]);

  const handleStatusChange = async (newStatus) => {
    if (isAdmin || !isEligible) return;
    try {
      const res = await fetch("/api/user/company-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company._id, status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
        onStatusChange?.(company._id, newStatus);
      } else {
        setCurrentStatus(company.userStatus || "none");
      }
    } catch {
      setCurrentStatus(company.userStatus || "none");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "applied":
        return "bg-green-900/30 text-green-300 border-green-500";
      case "interested":
        return "bg-blue-900/30 text-blue-300 border-blue-500";
      case "not_interested":
        return "bg-red-900/30 text-red-300 border-red-500";
      default:
        return "bg-[#2d2c3b] text-gray-300 border-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "interested":
        return "Interested";
      case "not_interested":
        return "Not Interested";
      default:
        return "No Status";
    }
  };

  const badge = (text, className, onClick) => (
    <span
      className={`text-sm px-3 py-1 rounded-xl font-medium cursor-pointer ${className}`}
      onClick={onClick}
    >
      {text}
    </span>
  );

  return (
    <div
      className={`border rounded-xl shadow-sm px-3 py-3 md:px-5 md:py-4 mb-5 transition-all duration-200 ${
        isEligible
          ? "bg-[#1c1b2a] border-gray-700"
          : "bg-gray-800/50 border-gray-800 opacity-60"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-3 gap-x-6">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2
              className={`text-lg font-semibold break-words ${
                isEligible ? "text-white" : "text-gray-400"
              }`}
            >
              {company.name}
            </h2>
            {!isEligible && (
              <div className="bg-red-900/30 text-red-300 px-2 py-1 rounded-full text-xs">
                Not Eligible
              </div>
            )}
          </div>
          <p
            className={`${
              isEligible ? "text-gray-300" : "text-gray-500"
            } truncate`}
          >
            {company.role} - {company.location}
          </p>

          {/* ADDED ELIGIBILITY REASON */}
          {!isEligible && eligibilityReason && (
            <p className="text-red-400 text-sm mt-1">{eligibilityReason}</p>
          )}

          {/* Apply Links */}
          {company.applyLinks && company.applyLinks.length > 0 && (
            <div className="mt-3">
              <h4
                className={`text-sm font-medium mb-2 ${
                  isEligible ? "text-blue-300" : "text-gray-500"
                }`}
              >
                Links to Apply:
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.applyLinks.map(
                  (link, index) =>
                    link.url && (
                      <a
                        key={index}
                        href={isEligible ? link.url : "#"}
                        target={isEligible ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors break-all w-full sm:w-auto ${
                          isEligible
                            ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={
                          !isEligible ? (e) => e.preventDefault() : undefined
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {link.title || `Apply Link ${index + 1}`}
                        </span>
                      </a>
                    )
                )}
              </div>
            </div>
          )}

          {/* UPDATED BADGES SECTION WITH BACKLOGS */}
          <div className="flex flex-wrap gap-2 mt-3">
            {badge(
              `CGPA: ${company.cgpaCriteria || "N/A"}+`,
              `${
                isEligible
                  ? "bg-blue-400/20 text-blue-300"
                  : "bg-gray-700/30 text-gray-500"
              } p-2`
            )}

            {/* ADDED BACKLOG BADGE */}
            {badge(
              `Backlogs: ${
                company.backlogsAllowed !== null &&
                company.backlogsAllowed !== undefined
                  ? `Max ${company.backlogsAllowed}`
                  : "Not Specified"
              }`,
              `${
                isEligible
                  ? "bg-orange-400/20 text-orange-300"
                  : "bg-gray-700/30 text-gray-500"
              } p-2`
            )}

            {badge(
              `Stipend: ${company.pay || "Not disclosed"}`,
              `${
                isEligible
                  ? "bg-green-400/20 text-green-300"
                  : "bg-gray-700/30 text-gray-500"
              } p-2`
            )}
            {badge(
              `Duration: ${company.duration || "Not disclosed"}`,
              `${
                isEligible
                  ? "bg-yellow-400/20 text-yellow-300"
                  : "bg-gray-700/30 text-gray-500"
              } p-2`
            )}
            {badge(
              company.branchesEligible?.length
                ? `${company.branchesEligible.length} branches eligible`
                : "All branches eligible",
              `${
                isEligible
                  ? "bg-purple-400/20 text-purple-300"
                  : "bg-gray-700/30 text-gray-500"
              } p-2`
            )}
          </div>
        </div>
        {/* Right Section */}
        <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
          {/* Countdown Timer */}
          {nextDeadline && timeLeft && (
            <div
              className={`text-sm font-medium px-3 py-1 rounded-lg w-full md:w-auto text-center ${
                timeLeft.includes("passed")
                  ? isEligible
                    ? "bg-red-900/30 text-red-300"
                    : "bg-gray-800/30 text-gray-500"
                  : isEligible
                  ? "bg-yellow-900/30 text-yellow-300"
                  : "bg-gray-800/30 text-gray-500"
              }`}
            >
              {nextDeadline.type.charAt(0).toUpperCase() +
                nextDeadline.type.slice(1).toLowerCase()}
              : {timeLeft}
            </div>
          )}
          {!isAdmin && isEligible && !timeLeft.includes("passed") && (
            <>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 bg-[#2d2c3b] text-gray-200 border border-gray-600 rounded-md text-sm focus:outline-none w-full md:w-auto"
              >
                <option value="none">Select Status</option>
                <option value="interested">Interested</option>
                <option value="applied">Applied</option>
                <option value="not_interested">Not Interested</option>
              </select>
              <span
                className={`text-xs border px-3 py-1 rounded-xl font-medium ${getStatusBadge(
                  currentStatus
                )} w-full md:w-auto text-center`}
              >
                {getStatusText(currentStatus)}
              </span>
            </>
          )}
          {!isAdmin && !isEligible && (
            <div className="text-center w-full">
              <div className="px-3 py-2 bg-gray-700/50 text-gray-500 border border-gray-600 rounded-md text-sm cursor-not-allowed w-full">
                Not Available
              </div>
              <div className="text-xs mt-2 text-gray-500 px-2 py-1 rounded-xl font-medium border border-gray-600 w-full">
                Ineligible
              </div>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => onDelete?.(company._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold w-full md:w-auto"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {/* Read More Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-sm mt-4 hover:underline inline-flex items-center ${
          isEligible ? "text-blue-400" : "text-gray-500"
        }`}
      >
        {isExpanded ? "Hide Details" : "Read More"}
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        )}
      </button>
      {/* Expanded Section */}
      {isExpanded && (
        <div
          className={`mt-4 border-t pt-4 text-sm space-y-4 ${
            isEligible
              ? "border-gray-700 text-gray-300"
              : "border-gray-800 text-gray-500"
          }`}
        >
          {/* Role Description */}
          <div
            className={`border rounded-lg px-4 py-3 ${
              isEligible
                ? "bg-[#1b1b24] border-gray-600"
                : "bg-gray-800/30 border-gray-700"
            }`}
          >
            <h4
              className={`text-base font-semibold mb-2 flex items-center gap-2 ${
                isEligible ? "text-blue-300" : "text-gray-500"
              }`}
            >
              Role Description
            </h4>
            <p className="leading-relaxed whitespace-pre-line break-words">
              {company.roleInfo || "Not available"}
            </p>
          </div>
          {/* About Company */}
          <div
            className={`border rounded-lg px-4 py-3 ${
              isEligible
                ? "bg-[#1b1b24] border-gray-600"
                : "bg-gray-800/30 border-gray-700"
            }`}
          >
            <h4
              className={`text-base font-semibold mb-2 flex items-center gap-2 ${
                isEligible ? "text-green-300" : "text-gray-500"
              }`}
            >
              About Company
            </h4>
            <p className="leading-relaxed whitespace-pre-line break-words">
              {company.companyInfo || "Not available"}
            </p>
          </div>
          {/* All Deadlines with time */}
          {company.deadlines && company.deadlines.length > 0 && (
            <div
              className={`border rounded-lg px-4 py-3 ${
                isEligible
                  ? "bg-[#1b1b24] border-yellow-500/40"
                  : "bg-gray-800/30 border-gray-700"
              }`}
            >
              <h4
                className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                  isEligible ? "text-yellow-300" : "text-gray-500"
                }`}
              >
                Important Deadlines
              </h4>
              <ul className="space-y-2">
                {company.deadlines.map((d, idx) => (
                  <li
                    key={idx}
                    className={`border-l-4 pl-4 ${
                      isEligible ? "border-yellow-400" : "border-gray-600"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isEligible ? "text-gray-100" : "text-gray-400"
                      }`}
                    >
                      {d.type}:{" "}
                      <span
                        className={`font-normal ${
                          isEligible ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {d.date} at {d.time || "23:59"}
                      </span>
                    </p>
                    {d.description && (
                      <p
                        className={`text-xs mt-1 ${
                          isEligible ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {d.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Eligible Branches */}
          {company.branchesEligible && company.branchesEligible.length > 0 && (
            <div
              className={`border rounded-lg px-4 py-3 ${
                isEligible
                  ? "bg-[#1b1b24] border-gray-600"
                  : "bg-gray-800/30 border-gray-700"
              }`}
            >
              <h4
                className={`text-base font-semibold mb-2 ${
                  isEligible ? "text-purple-300" : "text-gray-500"
                }`}
              >
                Eligible Branches:
              </h4>
              <div className="flex flex-wrap gap-1">
                {company.branchesEligible.map((branch, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs break-words ${
                      isEligible
                        ? "bg-purple-700/20 text-purple-300"
                        : "bg-gray-900/80 text-gray-600"
                    }`}
                  >
                    {branch}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
