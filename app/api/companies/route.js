import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { getActiveCompanies, findUser } from "../../../lib/mongodb";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUser(session.user.email);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user profile is complete
    if (!user.branch || user.cgpa === undefined || user.cgpa === null) {
      return Response.json(
        {
          error: "Profile incomplete",
          redirect: "/setup",
        },
        { status: 400 }
      );
    }

    // Get all companies
    const companies = await getActiveCompanies();

    if (companies.length === 0) {
      return Response.json([]);
    }

    // Original eligibility check function
    const checkEligibility = (company) => {
      // Check CGPA criteria
      if (company.cgpaCriteria && user.cgpa < company.cgpaCriteria) {
        return false;
      }

      // Check branch eligibility
      if (company.branchesEligible && company.branchesEligible.length > 0) {
        const userBranchCode = user.branch.toUpperCase(); // Ensure it's a code like "CSE", "ECE"

        const isBranchEligible =
          company.branchesEligible.includes(userBranchCode);

        if (!isBranchEligible) {
          return false;
        }
      }

      return true;
    };

    // Add eligibility information to all companies
    const companiesWithEligibility = companies.map((company) => ({
      ...company,
      isEligible: checkEligibility(company),
    }));

    // Sort companies: eligible first, then by user's interest status
    const userStatuses = user.companyStatuses || {};

    const sortedCompanies = companiesWithEligibility.sort((a, b) => {
      // First sort by eligibility
      if (a.isEligible !== b.isEligible) {
        return b.isEligible - a.isEligible; // Eligible companies first
      }

      // Then sort by status within each eligibility group
      const statusA = userStatuses[a._id.toString()]?.status || "none";
      const statusB = userStatuses[b._id.toString()]?.status || "none";

      // Priority order: applied > interested > none > not_interested
      const priority = {
        applied: 4,
        interested: 3,
        none: 2,
        not_interested: 1,
      };

      return priority[statusB] - priority[statusA];
    });

    // Add user status to each company
    const companiesWithStatus = sortedCompanies.map((company) => ({
      ...company,
      userStatus: userStatuses[company._id.toString()]?.status || "none",
    }));

    return Response.json(companiesWithStatus);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
