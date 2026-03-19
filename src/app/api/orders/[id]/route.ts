import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/order.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

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

    const order = await Order.findById(id)
      .populate("orderItems.product")
      .lean();

    if (!order) return apiError("Order not found", 404);

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin && order.user.toString() !== user.userId) {
      return apiError("Not authorized to view this order", 403);
    }

    return apiSuccess({ order });
  } catch (error) {
    return handleError(error);
  }
}
