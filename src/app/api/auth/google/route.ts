import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return apiError("No Google token provided", 400);
    }

    // Fetch user info from Google using the access token
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${credential}`,
        },
      }
    );

    const googleUser = googleResponse.data;

    if (!googleUser || !googleUser.email) {
      return apiError("Invalid Google token or missing email", 401);
    }

    const { email, name, picture } = googleUser;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        name,
        email,
        image: picture,
        isVerified: true, // Google emails are pre-verified
        role: "user",
      });
    } else {
      if (user.isBlocked) {
        return apiError("Your account has been blocked. Please contact support.", 403);
      }
      
      // If user exists but is somehow not verified, mark them verified now
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
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

    const response = apiSuccess(
      { user: formattedUser },
      "Google Login successful"
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

  } catch (error: any) {
    if (error.response?.status === 401) {
       return apiError("Google authentication failed", 401);
    }
    return handleError(error);
  }
}