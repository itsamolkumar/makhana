import { z } from "zod";

const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  name: z.string().min(1, "Product name required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100"),
  image: z.string().url().optional(),
  sku: z.string().optional(),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  landmark: z.string().optional(),
  coordinates: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
});

export const createOrderValidator = z.object({
  orderItems: z.array(orderItemSchema).min(1, "At least one item required"),

  shippingAddress: shippingAddressSchema,

  billingAddress: shippingAddressSchema.optional(),

  paymentMethod: z.enum(["razorpay", "cod", "upi", "netbanking"]),

  couponCode: z.string().optional(),

  notes: z.string().max(500).optional(),
});

export const updateOrderStatusValidator = z.object({
  status: z.enum(["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"]),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const cancelOrderValidator = z.object({
  cancellationReason: z.string().min(1).max(500).optional(),
});

export const assignDeliveryBoyValidator = z.object({
  deliveryBoyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export const trackingUpdateValidator = z.object({
  trackingNumber: z.string().min(1, "Tracking number required"),
  location: z.string().min(1, "Location required"),
  status: z.enum(["processing", "shipped", "out_for_delivery", "delivered"]),
});

export type CreateOrderInput = z.infer<typeof createOrderValidator>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusValidator>;
export type CancelOrderInput = z.infer<typeof cancelOrderValidator>;
