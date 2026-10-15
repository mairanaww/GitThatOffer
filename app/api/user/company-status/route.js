// app/api/user/company-status/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { findUser, updateUser } from "../../../../lib/mongodb";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, status } = body;

    if (
      !companyId ||
      !["not_interested", "interested", "applied"].includes(status)
    ) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const user = await findUser(session.user.email);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's company status
    const companyStatuses = user.companyStatuses || {};
    companyStatuses[companyId] = {
      status,
      updatedAt: new Date(),
    };

    await updateUser(session.user.email, { companyStatuses });

    console.log(
      `Status updated for user ${session.user.email}: Company ${companyId} -> ${status}`
    );

    return Response.json({
      message: "Status updated successfully",
      companyId,
      status,
    });
  } catch (error) {
    console.error("Error updating company status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
