"use client";

export default function CompanyFilter({
  showEligibleOnly,
  setShowEligibleOnly,
  eligibleCount,
  totalCount,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-[#1a192d] rounded-lg border border-gray-700">
      {/* Toggle Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <span className="text-gray-300 text-sm">Show:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showEligibleOnly}
            onChange={(e) => setShowEligibleOnly(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-12 h-6 rounded-full transition-colors ${
              showEligibleOnly ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                showEligibleOnly ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-white text-sm">
            {showEligibleOnly ? "Eligible Only" : "All Companies"}
          </span>
        </label>
      </div>

      {/* Count Section */}
      <div className="text-sm text-gray-400">
        Showing {showEligibleOnly ? eligibleCount : totalCount} of {totalCount}{" "}
        companies
        {!showEligibleOnly && eligibleCount !== totalCount && (
          <span className="text-green-400 ml-2">
            ({eligibleCount} eligible)
          </span>
        )}
      </div>
    </div>
  );
}
