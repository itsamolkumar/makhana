import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

// GET user addresses
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const userData = await User.findById(user.userId).select("addresses").lean();
    if (!userData) return apiError("User not found", 404);

    return apiSuccess({ addresses: userData.addresses || [] }, "Addresses fetched successfully");
  } catch (error) {
    return handleError(error);
  }
}

// POST - Add new address
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { fullName, mobile, pincode, state, city, area, landmark, isDefault } = body;

    // Validate required fields
    if (!fullName || !mobile || !pincode || !state || !city || !area) {
      return apiError("Missing required fields", 400);
    }

    // Validate phone number (basic)
    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
      return apiError("Invalid mobile number", 400);
    }

    // Validate pincode (basic)
    if (!/^\d{6}$/.test(pincode)) {
      return apiError("Invalid pincode", 400);
    }

    const newAddress = {
      fullName,
      mobile,
      pincode,
      state,
      city,
      area,
      landmark: landmark || "",
      isDefault: isDefault || false,
    };

    // If this is the first address, make it default
    const userData = await User.findById(user.userId);
    if (!userData.addresses || userData.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If setting as default, unset other defaults
    if (newAddress.isDefault && userData.addresses) {
      userData.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select("addresses");

    return apiSuccess(
      { address: updatedUser.addresses[updatedUser.addresses.length - 1] },
      "Address added successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}
