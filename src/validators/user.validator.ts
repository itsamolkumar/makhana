import { z } from "zod";

export const registerValidator = z.object({

  name: z.string().min(2).max(50),

  email: z.string().email(),

  password: z.string().min(6),

  mobile: z.string().min(10).max(10)

});

export const loginValidator = z.object({

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(6)

});


export const addressValidator = z.object({

  fullName: z.string().min(2),

  mobile: z.string().min(10).max(10),

  pincode: z.string().min(6).max(6),

  state: z.string(),

  city: z.string(),

  area: z.string(),

  landmark: z.string().optional(),

  isDefault: z.boolean().optional()

});