import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { updatePaymentMethodValidator } from "@/validators/order.validator";
import { updatePaymentMethodForOrder } from "@/services/orderService";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await context.params;
    if (!id) return apiError("Order ID is required", 400);

    const body = await req.json();
    const validationResult = updatePaymentMethodValidator.safeParse(body);
    if (!validationResult.success) {
      const msg = validationResult.error.issues.map((e) => e.message).join(", ");
      return apiError(msg, 400);
    }

    const result = await updatePaymentMethodForOrder(id, user.userId, validationResult.data.paymentMethod);

    if (!result.success) {
      return apiError(result.error || "Could not update payment method", 400);
    }

    return apiSuccess({ order: result.order }, "Payment method updated");
  } catch (error) {
    return handleError(error);
  }
}
