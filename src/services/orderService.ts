import Order, { IOrder, IOrderItem, IOrderStatusTimeline } from "@/models/order.model";
import Product from "@/models/product.model";
import Cart from "@/models/cart.model";
import Coupon from "@/models/coupon.model";
import User from "@/models/user.model";
import mongoose from "mongoose";

/**
 * Generate unique order number
 * Format: ORD-20260319-000001
 */
export const generateOrderNumber = async (): Promise<string> => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      $lt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
    },
  });
  return `ORD-${date}-${String(count + 1).padStart(6, "0")}`;
};

/**
 * Calculate tax based on total amount and state
 * Assuming 5% GST (can be made dynamic)
 */
export const calculateTax = (subtotal: number, taxRate: number = 0.05): number => {
  return parseFloat((subtotal * taxRate).toFixed(2));
};

/**
 * Calculate estimated delivery date (e.g., 3-5 business days)
 */
export const calculateEstimatedDelivery = (daysRange: { min: number; max: number } = { min: 3, max: 5 }): Date => {
  const currentDate = new Date();
  // Add random days between min and max
  const randomDays = Math.floor(Math.random() * (daysRange.max - daysRange.min + 1)) + daysRange.min;
  currentDate.setDate(currentDate.getDate() + randomDays);
  return currentDate;
};

/**
 * Validate stock availability
 */
export const validateStockAvailability = async (orderItems: any[]): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      errors.push(`Product not found: ${item.name}`);
      continue;
    }
    if (product.stock < item.quantity) {
      errors.push(`${product.name} - Only ${product.stock} available, requested ${item.quantity}`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Process coupon discount
 */
export const processCouponDiscount = async (
  couponCode: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; coupon?: any; error?: string }> => {
  if (!couponCode) {
    return { valid: true, discount: 0 };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return { valid: false, discount: 0, error: "Invalid coupon code" };
  }

  if (coupon.expiry < new Date()) {
    return { valid: false, discount: 0, error: "Coupon has expired" };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: "Coupon usage limit reached" };
  }

  if (subtotal < coupon.minOrder) {
    return { valid: false, discount: 0, error: `Minimum order ₹${coupon.minOrder} required` };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return { valid: true, discount: parseFloat(discount.toFixed(2)), coupon };
};

interface CreateOrderParams {
  userId: string;
  orderItems: IOrderItem[];
  shippingAddress: any;
  paymentMethod: "razorpay" | "cod" | "upi" | "netbanking";
  couponCode?: string;
  notes?: string;
}

/**
 * Create a new order with transaction-like behavior
 */
export const createOrder = async (params: CreateOrderParams): Promise<{ success: boolean; order?: IOrder; error?: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, orderItems, shippingAddress, paymentMethod, couponCode, notes } = params;

    // Validate stock availability
    const stockValidation = await validateStockAvailability(orderItems);
    if (!stockValidation.valid) {
      await session.abortTransaction();
      return { success: false, error: stockValidation.errors.join(", ") };
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of orderItems) {
      subtotal += item.price * item.quantity;
    }

    // Process coupon
    let couponDiscount = 0;
    let couponRecord: any = null;
    if (couponCode) {
      const couponResult = await processCouponDiscount(couponCode, subtotal);
      if (!couponResult.valid) {
        await session.abortTransaction();
        return { success: false, error: couponResult.error };
      }
      couponDiscount = couponResult.discount;
      couponRecord = couponResult.coupon;
    }

    // Calculate other charges
    const taxRate = 0.05; // 5% GST
    const tax = calculateTax(subtotal, taxRate);
    const shippingPrice = 0; // Free shipping for now
    const totalPrice = subtotal + tax + shippingPrice - couponDiscount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await Order.create(
      [
        {
          orderNumber,
          user: userId,
          orderItems,
          shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
          orderStatus: "confirmed",
          statusTimeline: [
            {
              status: "confirmed",
              timestamp: new Date(),
              description: "Order confirmed",
            },
          ],
          subtotal,
          tax,
          shippingPrice,
          couponCode: couponRecord?.code,
          couponDiscount,
          totalPrice,
          estimatedDelivery: calculateEstimatedDelivery(),
          notes,
        },
      ],
      { session }
    );

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { session });
    }

    // Update coupon usage if applied
    if (couponRecord) {
      couponRecord.usedCount = (couponRecord.usedCount || 0) + 1;
      if (couponRecord.usageLimit && couponRecord.usedCount >= couponRecord.usageLimit) {
        couponRecord.isActive = false;
      }
      await couponRecord.save({ session });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });

    // Save user address if not exists
    const user = await User.findById(userId).session(session);
    if (user) {
      const addressExists = user.addresses?.some(
        (addr: any) =>
          addr.fullName === shippingAddress.fullName &&
          addr.mobile === shippingAddress.mobile &&
          addr.pincode === shippingAddress.pincode &&
          addr.state === shippingAddress.state &&
          addr.city === shippingAddress.city &&
          addr.area === shippingAddress.area
      );

      if (!addressExists) {
        user.addresses = user.addresses || [];
        user.addresses.push({
          ...shippingAddress,
          isDefault: (user.addresses?.length || 0) === 0,
        });
        await user.save({ session });
      }
    }

    await session.commitTransaction();

    return { success: true, order: order[0] };
  } catch (error) {
    await session.abortTransaction();
    return { success: false, error: error instanceof Error ? error.message : "Failed to create order" };
  } finally {
    session.endSession();
  }
};

/**
 * Update order status with timeline tracking
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  description?: string,
  location?: string
): Promise<{ success: boolean; order?: IOrder; error?: string }> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const timeline: IOrderStatusTimeline = {
      status: newStatus as any,
      timestamp: new Date(),
      description,
      location,
    };

    order.statusTimeline = order.statusTimeline || [];
    order.statusTimeline.push(timeline);
    order.orderStatus = newStatus as any;

    // Auto-update timestamps
    if (newStatus === "delivered") {
      order.deliveredAt = new Date();
    } else if (newStatus === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();
    return { success: true, order };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update order status" };
  }
};

/**
 * Get order with populated references
 */
export const getOrderById = async (orderId: string, userId?: string): Promise<IOrder | null> => {
  const query: any = { _id: orderId };
  if (userId) {
    query.user = userId;
  }
  return Order.findOne(query).populate("user", "name email mobile").populate("orderItems.product", "name slug price").populate("deliveryBoy", "name mobile");
};

/**
 * Get user orders with pagination
 */
export const getUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<{ orders: IOrder[]; total: number; pages: number }> => {
  const query: any = { user: userId };
  if (status) {
    query.orderStatus = status;
  }

  const skip = (page - 1) * limit;
  const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("orderItems.product", "name images");

  const total = await Order.countDocuments(query);

  return {
    orders,
    total,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Cancel order and restore stock
 */
export const cancelOrder = async (orderId: string, cancellationReason?: string): Promise<{ success: boolean; order?: IOrder; error?: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return { success: false, error: "Order not found" };
    }

    if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return { success: false, error: `Cannot cancel ${order.orderStatus} order` };
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
    }

    // Update order
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason;
    order.paymentStatus = "refunded"; // Assuming immediate refund

    const timeline: IOrderStatusTimeline = {
      status: "cancelled",
      timestamp: new Date(),
      description: cancellationReason || "Order cancelled by user",
    };
    order.statusTimeline = order.statusTimeline || [];
    order.statusTimeline.push(timeline);

    await order.save({ session });
    await session.commitTransaction();

    return { success: true, order };
  } catch (error) {
    await session.abortTransaction();
    return { success: false, error: error instanceof Error ? error.message : "Failed to cancel order" };
  } finally {
    session.endSession();
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (userId?: string): Promise<any> => {
  const query: any = {};
  if (userId) {
    query.user = userId;
  }

  const stats = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        avgOrderValue: { $avg: "$totalPrice" },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
};
