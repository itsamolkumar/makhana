import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";
import { loginValidator } from "@/validators/user.validator";

import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const body = await req.json();

    const { email, password } = loginValidator.parse(body);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {

      return apiError("Invalid credentials", 401);

    }

    if (!user.isVerified) {
      return apiError("Email not verified", 403);
    }
    
    if (user.isBlocked) {
      return apiError("Your account has been blocked. Please contact support.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return apiError("Invalid credentials", 401);

    }

    const payload = {

      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified

    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    const formattedUser = {
      ...(user.toObject ? user.toObject() : user),
      id: user._id.toString()
    };

    console.log("Login: Formatted user:", formattedUser);
    console.log("Login: User addresses:", formattedUser.addresses);

    const response = apiSuccess(
      { user: formattedUser },
      "Login successful"
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {

    return handleError(error);

  }

}