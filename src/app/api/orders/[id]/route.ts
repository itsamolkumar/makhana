import { NextRequest } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/middleware/auth.middleware";
import { adminMiddleware } from "@/middleware/admin.middleware";
import OrderModel from "@/models/order.model";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import {
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "@/services/orderService";
import {
  updateOrderStatusValidator,
  cancelOrderValidator,
} from "@/validators/order.validator";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await context.params;
    if (!id) return apiError("Order ID is required", 400);

    const isAdmin = user.role === "admin";

    // Get order - admin can view any, user can view only their own
    const order = await getOrderById(id, isAdmin ? undefined : user.userId);

    if (!order) {
      return apiError(isAdmin ? "Order not found" : "Not authorized to view this order", isAdmin ? 404 : 403);
    }

    return apiSuccess({ order }, "Order retrieved");
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Only admins can update order status", 403);

    const { id } = await context.params;
    if (!id) return apiError("Order ID is required", 400);

    const body = await req.json();

    // Validate request
    const validationResult = updateOrderStatusValidator.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: any) => e.message).join(", ");
      return apiError(`Validation failed: ${errors}`, 400);
    }

    const { status, description, location } = validationResult.data;

    // Update order status with service
    const result = await updateOrderStatus(id, status, description, location);

    if (!result.success) {
      return apiError(result.error, 400);
    }

    // ✅ TODO: Emit order status update event for notifications
    // eventEmitter.emit('order.status.updated', { order: result.order, status });

    return apiSuccess({ order: result.order }, `Order status updated to ${status}`);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await context.params;
    if (!id) return apiError("Order ID is required", 400);

    const body = await req.json().catch(() => ({}));

    // Validate request
    const validationResult = cancelOrderValidator.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      return apiError(`Validation failed: ${errors}`, 400);
    }

    const orderDoc = await OrderModel.findById(id).select("user");
    if (!orderDoc) {
      return apiError("Order not found", 404);
    }
    const isAdmin = user.role === "admin";
    if (!isAdmin && orderDoc.user.toString() !== user.userId) {
      return apiError("You can only cancel your own orders", 403);
    }

    // Cancel order with service
    const result = await cancelOrder(id, validationResult.data.cancellationReason);

    if (!result.success) {
      return apiError(result.error, 400);
    }

    // ✅ TODO: Emit order cancellation event for notifications
    // eventEmitter.emit('order.cancelled', { order: result.order });

    return apiSuccess({ order: result.order }, "Order cancelled successfully");
  } catch (error) {
    return handleError(error);
  }
}

