import { z } from "zod";

export const sendOtpValidator = z.object({
  email: z.string().email("Please enter a valid email address"),
  type: z.enum(["signup", "login", "reset"]),
});

export const verifyOtpValidator = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});