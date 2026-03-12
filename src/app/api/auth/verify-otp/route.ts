import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";
import Otp from "@/models/otp.model";
import { verifyOtpValidator } from "@/validators/otp.validator";

import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const body = await req.json();

    const { email, otp } = verifyOtpValidator.parse(body);

    const otpRecord = await Otp.findOne({

      email,
      type: "signup"

    });

    if (!otpRecord) {

      return apiError("OTP not found", 400);

    }

    if (otpRecord.otp !== otp) {

      return apiError("Invalid OTP", 400);

    }

    if (otpRecord.expiresAt < new Date()) {

      return apiError("OTP expired", 400);

    }

    const user = await User.findOne({ email });

    if (!user) {

      return apiError("User not found", 404);

    }

    user.isVerified = true;

    await user.save();

    await Otp.deleteMany({ email });

    const payload = {

      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: true

    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    const formattedUser = {
      ...(user.toObject ? user.toObject() : user),
      id: user._id.toString()
    };

    const response = apiSuccess(
      { user: formattedUser },
      "Email verified successfully"
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