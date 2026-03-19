import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { name, email, mobile } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (mobile) updates.mobile = mobile;

    if (!Object.keys(updates).length) {
      return apiError("No updates provided", 400);
    }

    // Prevent email duplication
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user.userId } });
      if (existing) {
        return apiError("Email already in use", 400);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(user.userId, updates, { new: true }).lean();
    if (!updatedUser) return apiError("User not found", 404);

    return apiSuccess({ user: updatedUser }, "Profile updated successfully");
  } catch (error) {
    return handleError(error);
  }
}
