import { NextRequest } from "next/server";

import { verifyToken } from "@/lib/jwt";

import { apiError } from "@/utils/apiResponse";

export async function authMiddleware(req: NextRequest) {

  try {

    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {

      return apiError("Unauthorized", 401);

    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {

      return apiError("Invalid token", 401);

    }

    return decoded;

  }

  catch {

    return apiError("Authentication failed", 401);

  }

}