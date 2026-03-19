import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { authMiddleware } from "@/middleware/auth.middleware";
import { connectDB } from "@/lib/db";
import OrderModel from "@/models/order.model";

export async function POST(req: NextRequest) {
  try {
    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { 
      dbOrderId,
      error_description,
      razorpay_payment_id
    } = body;

    if (!dbOrderId) {
      return apiError("Missing DB order ID", 400);
    }

    await connectDB();

    const order = await OrderModel.findById(dbOrderId);
    if (!order) {
      return apiError("Order not found", 404);
    }
    
    if (order.user.toString() !== user.userId) {
      return apiError("Unauthorized to update this order", 403);
    }

    // Only update to failed if it wasn't already marked as paid
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      if (razorpay_payment_id) {
        order.paymentId = razorpay_payment_id;
      }
      if (error_description) {
        order.notes = error_description; // Store error trace in notes or similar
      }
      await order.save();
    }

    return apiSuccess({ order }, "Payment marked as failed");
    
  } catch (error) {
    return handleError(error);
  }
}
