import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";

export async function authMiddleware(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    // Connect to DB and verify user isn't blocked
    await connectDB();
    const user = await User.findById(decoded.userId).select("isBlocked");
    if (!user || user.isBlocked) {
      throw new Error(user?.isBlocked ? "BLOCKED_USER" : "User not found");
    }

    return decoded as import("@/lib/jwt").JwtPayload;
  } catch (error: any) {
    throw new Error(error.message || "Authentication failed");
  }
}