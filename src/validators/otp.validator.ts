import { z } from "zod";

export const sendOtpValidator = z.object({

  email: z.string().email(),

  type: z.enum(["signup","login","reset"])

});

export const verifyOtpValidator = z.object({

  email: z.string().email(),

  otp: z.string().length(6)

});