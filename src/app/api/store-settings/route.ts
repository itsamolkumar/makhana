import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  normalizePricingSettings,
} from "@/lib/pricing";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiError, apiSuccess } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import {
  getStorePricingSettings,
  updateStorePricingSettings,
} from "@/services/storeSettings.service";

export async function GET() {
  try {
    await connectDB();
    const settings = await getStorePricingSettings();
    return apiSuccess({ settings }, "Store pricing settings fetched");
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (!admin) {
      return apiError("Admin access required", 403);
    }

    const body = await req.json();
    const gstRatePercent = Number(body?.gstRatePercent);
    const serviceCharge = Number(body?.serviceCharge);
    const deliveryCharge = Number(body?.deliveryCharge);

    if (
      Number.isNaN(gstRatePercent) ||
      Number.isNaN(serviceCharge) ||
      Number.isNaN(deliveryCharge)
    ) {
      return apiError("All pricing values must be valid numbers", 400);
    }

    if (gstRatePercent < 0 || serviceCharge < 0 || deliveryCharge < 0) {
      return apiError("Pricing values cannot be negative", 400);
    }

    const settings = await updateStorePricingSettings(
      normalizePricingSettings({
        gstRate: gstRatePercent / 100,
        serviceCharge,
        deliveryCharge,
      })
    );

    return apiSuccess({ settings }, "Store pricing settings updated");
  } catch (error) {
    return handleError(error);
  }
}
