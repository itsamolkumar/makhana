import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

// PUT - Update address
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = params;
    const body = await req.json();
    const { fullName, mobile, pincode, state, city, area, landmark, isDefault } = body;

    // Find user and address
    const userData = await User.findById(user.userId);
    if (!userData) return apiError("User not found", 404);

    const addressIndex = userData.addresses.findIndex((addr: any) => addr._id.toString() === id);
    if (addressIndex === -1) return apiError("Address not found", 404);

    // Update address fields
    if (fullName) userData.addresses[addressIndex].fullName = fullName;
    if (mobile) userData.addresses[addressIndex].mobile = mobile;
    if (pincode) userData.addresses[addressIndex].pincode = pincode;
    if (state) userData.addresses[addressIndex].state = state;
    if (city) userData.addresses[addressIndex].city = city;
    if (area) userData.addresses[addressIndex].area = area;
    if (landmark !== undefined) userData.addresses[addressIndex].landmark = landmark;

    // Handle default address
    if (isDefault) {
      userData.addresses.forEach((addr: any, index: number) => {
        addr.isDefault = index === addressIndex;
      });
    }

    await userData.save();

    return apiSuccess(
      { address: userData.addresses[addressIndex] },
      "Address updated successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

// DELETE - Remove address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = params;

    // Find user
    const userData = await User.findById(user.userId);
    if (!userData) return apiError("User not found", 404);

    // Find and remove address
    const addressIndex = userData.addresses.findIndex((addr: any) => addr._id.toString() === id);
    if (addressIndex === -1) return apiError("Address not found", 404);

    const isDefault = userData.addresses[addressIndex].isDefault;
    userData.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are remaining addresses, make first one default
    if (isDefault && userData.addresses.length > 0) {
      userData.addresses[0].isDefault = true;
    }

    await userData.save();

    return apiSuccess(null, "Address deleted successfully");
  } catch (error) {
    return handleError(error);
  }
}
