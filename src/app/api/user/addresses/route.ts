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
    console.log("GET /api/user/addresses - Auth user:", user);
    
    if (!user) {
      console.error("❌ No user from authMiddleware");
      return apiError("Unauthorized", 401);
    }

    console.log("Fetching addresses for user ID:", user.userId);
    
    const userData = await User.findById(user.userId).select("addresses");
    console.log("User found in DB:", userData ? "YES" : "NO");
    console.log("Raw user data:", userData);
    
    if (!userData) {
      console.error("❌ User not found in database");
      return apiError("User not found", 404);
    }

    console.log("Raw addresses from DB:", userData.addresses);
    console.log("Addresses count:", userData.addresses?.length || 0);

    // Ensure addresses is an array and each address has _id
    const addresses = (userData.addresses || []).map((addr: any, index: number) => {
      const addressObj = addr.toObject ? addr.toObject() : addr;
      const mapped = {
        _id: addr._id?.toString() || `addr_${index}`,
        ...addressObj,
      };
      console.log(`Address ${index}:`, mapped);
      return mapped;
    });
    
    console.log("Final addresses to return:", addresses);
    console.log("✓ Returning", addresses.length, "addresses");
    
    return apiSuccess({ addresses }, "Addresses fetched successfully");
  } catch (error) {
    console.error("❌ Error in GET /api/user/addresses:", error);
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

    console.log("Adding address for user:", user.userId, "Body:", body);

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

    // Get user and check if this is the first address
    const userData = await User.findById(user.userId);
    if (!userData) return apiError("User not found", 404);

    const isFirstAddress = !userData.addresses || userData.addresses.length === 0;

    const newAddress = {
      fullName,
      mobile,
      pincode,
      state,
      city,
      area,
      landmark: landmark || "",
      isDefault: isFirstAddress ? true : (isDefault || false),
    };

    console.log("New address to add:", newAddress, "Is first:", isFirstAddress);

    // If setting as default, unset other defaults
    if (newAddress.isDefault) {
      await User.findByIdAndUpdate(
        user.userId,
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    // Add new address
    const updatedUser: any = await User.findByIdAndUpdate(
      user.userId,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select("addresses");

    console.log("Updated user addresses count:", updatedUser?.addresses?.length);
    const addedAddresses = updatedUser?.addresses || [];
    return apiSuccess(
      { address: addedAddresses[addedAddresses.length - 1] },
      "Address added successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}
