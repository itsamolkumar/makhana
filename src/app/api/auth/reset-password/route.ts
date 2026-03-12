import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Otp from "@/models/otp.model";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return apiError("Email, OTP, and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return apiError("Password must be at least 6 characters", 400);
    }

    // 1. Validate the OTP
    const validOtp = await Otp.findOne({
      email,
      otp,
      type: "reset",
      expiresAt: { $gt: new Date() } // Must not be expired
    });

    if (!validOtp) {
      return apiError("Invalid or expired reset OTP", 400);
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update the user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true } // Return updated doc, though we don't strictly need it
    );

    if (!updatedUser) {
      return apiError("User not found", 404);
    }

    // 4. Clean up OTPs 
    await Otp.deleteMany({ email, type: "reset" });

    return apiSuccess(null, "Password reset successfully. You can now login.");

  } catch (error) {
    return handleError(error);
  }
}
