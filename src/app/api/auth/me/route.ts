import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";

import { apiSuccess } from "@/utils/apiResponse";

import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {

  try {

    await connectDB();

    const decoded: any = await authMiddleware(req);

    if (!decoded) return;

    const user = await User.findById(decoded.userId).select("-password");

    return apiSuccess(

      { user },

      "User fetched successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}