import { z } from "zod";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";

export const createProductValidator = z.object({
  name: z.string().min(2),

  slug: z.string().min(2),

  description: z.string().optional(),

  price: z.number().positive(),

  discountPrice: z.number().optional(),

  category: z.enum(PRODUCT_CATEGORIES),

  images: z.array(z.string()).min(1),

  weight: z.string(),

  stock: z.number().min(0),
});

export const updateProductValidator = z.object({
  name: z.string().min(2).optional(),

  slug: z.string().min(2).optional(),

  description: z.string().optional(),

  price: z.number().positive().optional(),

  discountPrice: z.number().optional(),

  category: z.enum(PRODUCT_CATEGORIES).optional(),

  images: z.array(z.string()).optional(),

  weight: z.string().optional(),

  stock: z.number().min(0).optional(),
});