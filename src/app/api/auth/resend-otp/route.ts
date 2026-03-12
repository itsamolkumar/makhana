import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Otp from "@/models/otp.model";
import { sendOtpEmail } from "@/lib/email";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return apiError("Email is required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return apiError("User not found", 404);
    }

    if (user.isVerified) {
      return apiError("User is already verified", 400);
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Remove any existing OTPs for signup
    await Otp.deleteMany({ email, type: "signup" });

    // Save new OTP
    await Otp.create({
      email,
      otp,
      type: "signup",
      expiresAt
    });

    // Send email
    await sendOtpEmail(email, otp);

    return apiSuccess(null, "Verification OTP sent successfully");

  } catch (error) {
    return handleError(error);
  }
}
