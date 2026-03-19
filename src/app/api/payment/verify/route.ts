import { NextRequest } from "next/server";
import crypto from "crypto";
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
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      dbOrderId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return apiError("Missing payment verification details", 400);
    }

    const secret = process.env.RAZORPAY_SECRET as string;
    
    // Create signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Could also mark order as failed here if we wanted
      return apiError("Payment verification failed. Invalid signature.", 400);
    }

    await connectDB();

    // Verify ownership
    const order = await OrderModel.findById(dbOrderId);
    if (!order) {
      return apiError("Order not found", 404);
    }
    
    if (order.user.toString() !== user.userId) {
      return apiError("Unauthorized to update this order", 403);
    }

    // Update payment status and ID since verify succeeded
    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    await order.save();

    return apiSuccess({ 
      order, 
      paymentId: razorpay_payment_id 
    }, "Payment verified and order updated successfully");
    
  } catch (error) {
    return handleError(error);
  }
}
