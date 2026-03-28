import { z } from "zod";

export const addToCartValidator = z.object({
  productId: z.string().min(1, "Something went wrong — please try again"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});