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
      return apiError("No account found with that email", 404);
    }
    
    // Check if user is a Google auth user without a password
    if (user.password === undefined || user.password === null) {
      return apiError("This account uses Google Login. Please sign in with Google.", 400);
    }

    // Generate reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Remove any existing reset OTPs
    await Otp.deleteMany({ email, type: "reset" });

    // Save
    await Otp.create({
      email,
      otp,
      type: "reset",
      expiresAt
    });

    // Send email (we reuse the same generic OTP email function or modify it if needed)
    await sendOtpEmail(email, otp); 

    return apiSuccess(null, "Password reset OTP sent to your email");

  } catch (error) {
    return handleError(error);
  }
}
