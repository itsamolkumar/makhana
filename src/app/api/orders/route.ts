import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { sendAdminOrderEmail } from "@/lib/email";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from "@/services/orderService";
import {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  CreateOrderInput,
} from "@/validators/order.validator";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = user.role === "admin";

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const stats = searchParams.get("stats") === "true";
    const search = searchParams.get("search");

    // Admin can view all orders
    if (isAdmin && searchParams.get("all") === "true") {
      const skip = (page - 1) * limit;
      const query: any = {};
      if (status) query.orderStatus = status;

      if (search) {
        // Search by Object ID if it's a valid 24 hex char string
        if (/^[0-9a-fA-F]{24}$/.test(search)) {
          query._id = search;
        } else {
          // Alternatively, we would need an aggregation or lookup to search by user name/email.
          // Since user is populated, we can't cleanly search user collection from order collection without `$lookup`.
          // For simplicity, we just search order ID if valid.
        }
      }

      const Order = require("@/models/order.model").default;
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email mobile")
        .populate("orderItems.product", "name images");

      const total = await Order.countDocuments(query);

      if (stats) {
        const orderStats = await getOrderStats();
        return apiSuccess({ orders, total, pages: Math.ceil(total / limit), stats: orderStats }, "Orders retrieved");
      }

      return apiSuccess({ orders, total, pages: Math.ceil(total / limit) }, "Orders retrieved");
    }

    // User can view only their orders
    const { orders, total, pages } = await getUserOrders(user.userId, page, limit, status || undefined);

    if (stats) {
      const userStats = await getOrderStats(user.userId);
      return apiSuccess({ orders, total, pages, stats: userStats }, "Orders retrieved");
    }

    return apiSuccess({ orders, total, pages }, "Orders retrieved");
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();

    // Validate request
    const validationResult = createOrderValidator.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: any) => e.message).join(", ");
      return apiError(`Validation failed: ${errors}`, 400);
    }

    const orderData: CreateOrderInput = validationResult.data;

    // Convert product IDs from strings to ObjectIds
    const convertedOrderItems = orderData.orderItems.map(item => ({
      ...item,
      product: new (require('mongoose')).Types.ObjectId(item.product)
    }));

    // Create order with service layer
    const orderResult = await createOrder({
      userId: user.userId,
      orderItems: convertedOrderItems as any,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      couponCode: orderData.couponCode,
      notes: orderData.notes,
    });

    if (!orderResult.success) {
      return apiError(orderResult.error || "Failed to create order", 400);
    }

    // ✅ TODO: Emit order creation event for notifications
    // eventEmitter.emit('order.created', orderResult.order);

    if (orderData.paymentMethod === "cod" && process.env.EMAIL_USER && orderResult.order) {
      const OrderModel = require("@/models/order.model").default;
      const populatedOrder = await OrderModel.findById(orderResult.order._id).populate("orderItems.product", "name");
      if (populatedOrder) {
        sendAdminOrderEmail(populatedOrder, process.env.EMAIL_USER).catch((err: any) => console.error("Admin Email Error:", err));
      }
    }

    return apiSuccess(
      { order: orderResult.order },
      "Order placed successfully",
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

