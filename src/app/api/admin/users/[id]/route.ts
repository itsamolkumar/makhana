import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import User from "@/models/user.model";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // In Next 15+ params is a Promise
) {
  try {
    await connectDB();

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !["block", "unblock"].includes(action)) {
      return apiError("Invalid action", 400);
    }

    const user = await User.findById(id);
    if (!user) return apiError("User not found", 404);

    if (user.role === "admin") {
      return apiError("Cannot block other administrators", 403);
    }

    user.isBlocked = action === "block";
    
    // Optionally revoke tokens when blocking by incrementing tokenVersion
    if (action === "block") {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    return apiSuccess(
      { user: { _id: user._id, isBlocked: user.isBlocked } },
      `User successfully ${action}ed`
    );
  } catch (error) {
    return handleError(error);
  }
}
