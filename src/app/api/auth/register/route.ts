import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

import User from "@/models/user.model";
import Otp from "@/models/otp.model";

import { registerValidator } from "@/validators/user.validator";

import { sendOtpEmail } from "@/lib/email";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const body = await req.json();

    const { name, email, password, mobile } = registerValidator.parse(body);

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return apiError("Email already registered", 400);

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      isVerified: false
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await Otp.deleteMany({ email });
    
    await Otp.create({
      email,
      otp,
      type: "signup",
      expiresAt
    });

    await sendOtpEmail(email, otp);

    return apiSuccess(
      null,
      "OTP sent successfully. Please check your email to verify your account."
    );

  } catch (error) {

    return handleError(error);

  }

}