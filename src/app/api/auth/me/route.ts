import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";

import { apiSuccess } from "@/utils/apiResponse";

import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    console.log("--- GET /api/auth/me called ---");
    await connectDB();

    const decoded: any = await authMiddleware(req);
    console.log("AuthMiddleware result:", decoded);

    if (!decoded) return;

    const user = await User.findById(decoded.userId).select("-password").lean();
    console.log("Database User found:", user);

    if (!user) {
      return apiSuccess({ user: null }, "User not found in DB");
    }

    const formattedUser = {
      ...user,
      id: user._id.toString()
    };

    return apiSuccess({ user: formattedUser }, "User fetched successfully");

  }

  catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Authentication failed") {
      return apiSuccess({ user: null }, "Not authenticated");
    }
    return handleError(error);
  }

}