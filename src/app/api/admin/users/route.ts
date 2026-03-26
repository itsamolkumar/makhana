import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import User from "@/models/user.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select("-password");

    return apiSuccess({ users }, "Users retrieved successfully");
  } catch (error) {
    return handleError(error);
  }
}
