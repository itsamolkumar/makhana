import { z } from "zod";

export const registerValidator = z.object({
  name: z
    .string()
    .min(2, "Please enter your full name (at least 2 characters)")
    .max(50, "Name is too long — use at most 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter your 10-digit mobile number (numbers only, no spaces)"),
});

export const loginValidator = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const addressValidator = z.object({
  fullName: z.string().min(2, "Please enter the full name for this address"),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter a 10-digit mobile number"),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "PIN code must be exactly 6 digits"),
  state: z.string().min(1, "Please select or enter state"),
  city: z.string().min(1, "Please enter city"),
  area: z.string().min(1, "Please enter area / street"),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});