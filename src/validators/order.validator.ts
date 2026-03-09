import { z } from "zod";

export const createOrderValidator = z.object({

orderItems: z.array(
  z.object({
    product: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    image: z.string().optional()
  })
).min(1),

  shippingAddress: z.object({

    fullName: z.string(),

    mobile: z.string(),

    pincode: z.string(),

    state: z.string(),

    city: z.string(),

    area: z.string(),

    landmark: z.string().optional()

  }),

  paymentMethod: z.enum(["razorpay", "cod"]),

  totalPrice: z.number().positive()

});