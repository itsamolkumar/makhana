import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/coupon.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    // Only admin can view all coupons
    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Admin access required", 403);

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, expired, inactive

    const query: any = {};

    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    if (status) {
      if (status === "active") {
        query.isActive = true;
        query.expiry = { $gte: new Date() };
      } else if (status === "expired") {
        query.expiry = { $lt: new Date() };
      } else if (status === "inactive") {
        query.isActive = false;
      }
    }

    const skip = (page - 1) * limit;

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Coupon.countDocuments(query);

    return apiSuccess({
      coupons,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Admin access required", 403);

    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      expiry,
      usageLimit
    } = body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiry) {
      return apiError("Code, discount type, discount value, and expiry are required", 400);
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(discountType)) {
      return apiError("Discount type must be 'percentage' or 'fixed'", 400);
    }

    // Validate discount value
    if (discountValue <= 0) {
      return apiError("Discount value must be greater than 0", 400);
    }

    if (discountType === "percentage" && discountValue > 100) {
      return apiError("Percentage discount cannot exceed 100%", 400);
    }

    // Validate expiry date
    if (new Date(expiry) <= new Date()) {
      return apiError("Expiry date must be in the future", 400);
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return apiError("Coupon code already exists", 400);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrder: minOrder || 0,
      maxDiscount,
      expiry: new Date(expiry),
      usageLimit,
      usedCount: 0,
      isActive: true
    });

    return apiSuccess(coupon, "Coupon created successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Admin access required", 403);

    const body = await req.json();
    const {
      id,
      code,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      expiry,
      usageLimit,
      isActive
    } = body;

    if (!id) {
      return apiError("Coupon ID is required", 400);
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return apiError("Coupon not found", 404);
    }

    // Check if new code conflicts with existing coupons
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return apiError("Coupon code already exists", 400);
      }
    }

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrder !== undefined) coupon.minOrder = minOrder;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiry) coupon.expiry = new Date(expiry);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    return apiSuccess(coupon, "Coupon updated successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Admin access required", 403);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Coupon ID is required", 400);
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return apiError("Coupon not found", 404);
    }

    return apiSuccess({ message: "Coupon deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}