import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { authMiddleware } from "@/middleware/auth.middleware";

export async function POST(req: NextRequest) {
  try {
    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { amount } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return apiError("Invalid amount", 400);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_SECRET as string,
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${user.userId.substring(0, 5)}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order || !order.id) {
      return apiError("Failed to create Razorpay order", 500);
    }

    return apiSuccess({ 
      orderId: order.id, 
      amount: order.amount, 
      keyId: process.env.RAZORPAY_KEY_ID // send key to client safely as it's a public key
    }, "Payment order created");
  } catch (error) {
    return handleError(error);
  }
}
