import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";

import { verifyGoogleToken } from "@/lib/googleAuth";

import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const body = await req.json();

    const { token } = body;

    const payload: any = await verifyGoogleToken(token);

    if (!payload) {

      return apiError("Invalid Google token", 401);

    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {

      user = await User.create({

        name,
        email,
        image: picture,
        role: "user",
        isVerified: true

      });

    }

    const jwtPayload = {

      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: true

    };

    const accessToken = generateAccessToken(jwtPayload);

    const refreshToken = generateRefreshToken(jwtPayload);

    const response = apiSuccess(

      { user },

      "Google login successful"

    );

    response.cookies.set("accessToken", accessToken, {

      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15

    });

    response.cookies.set("refreshToken", refreshToken, {

      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7

    });

    return response;

  }

  catch (error) {

    return handleError(error);

  }

}