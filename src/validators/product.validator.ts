import { z } from "zod";

export const createProductValidator = z.object({
  name: z.string().min(2),

  slug: z.string().min(2),

  description: z.string().optional(),

  price: z.number().positive(),

  discountPrice: z.number().optional(),

  category: z.string(),

  images: z.array(z.string()).min(1).optional(),

  weight: z.string(),

  stock: z.number().min(0)
});