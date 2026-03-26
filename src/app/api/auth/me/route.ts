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

    if (!decoded) {
      return apiSuccess({ user: null }, "Not authenticated");
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("Database User found:", user);

    if (!user) {
      return apiSuccess({ user: null }, "User not found in DB");
    }

    const formattedUser: any = user.toObject ? user.toObject() : {
      ...user,
      id: user._id.toString()
    };
    
    // Ensure id is set
    if (!formattedUser.id) {
      formattedUser.id = formattedUser._id?.toString() || "";
    }

    console.log("Formatted user with addresses:", formattedUser);

    return apiSuccess({ user: formattedUser }, "User fetched successfully");

  }

  catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Authentication failed") {
      return apiSuccess({ user: null }, "Not authenticated");
    }
    return handleError(error);
  }

}