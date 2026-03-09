import { NextRequest } from "next/server";

import { verifyToken, generateAccessToken } from "@/lib/jwt";

import { apiSuccess, apiError } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {

  try {

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {

      return apiError("Refresh token missing", 401);

    }

    const decoded: any = verifyToken(refreshToken);

    if (!decoded) {

      return apiError("Invalid refresh token", 401);

    }

    const payload = {

      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified

    };

    const newAccessToken = generateAccessToken(payload);

    const response = apiSuccess(

      null,

      "Access token refreshed"

    );

    response.cookies.set("accessToken", newAccessToken, {

      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15

    });

    return response;

  } catch {

    return apiError("Refresh failed", 401);

  }

}