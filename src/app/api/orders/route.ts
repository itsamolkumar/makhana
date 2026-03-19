import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/order.model";
import Cart from "@/models/cart.model";
import Coupon from "@/models/coupon.model";
import Product from "@/models/product.model";
import User from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const isAdmin = await adminMiddleware(req);

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");

    const query: any = {};
    if (!isAdmin) {
      query.user = user.userId;
    }

    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    return apiSuccess({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();

    // Determine shipping address
    let shippingAddress = body.shippingAddress;
    const addressId = body.addressId;

    // If addressId was passed, try to resolve it from the user's stored addresses
    if (!shippingAddress && typeof addressId !== "undefined") {
      const userDoc = await User.findById(user.userId);
      if (userDoc?.addresses && userDoc.addresses[addressId]) {
        shippingAddress = userDoc.addresses[addressId];
      }
    }

    if (!shippingAddress) {
      return apiError("Shipping address is required", 400);
    }

    // Basic validation
    const requiredAddressFields = ["fullName", "mobile", "pincode", "state", "city", "area"];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return apiError(`Shipping address ${field} is required`, 400);
      }
    }

    const cart = await Cart.findOne({ user: user.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return apiError("Cart is empty");
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      const product = (item as any).product;
      if (!product) continue;

      if (product.stock < item.quantity) {
        return apiError(`Product ${product.name} is out of stock`);
      }

      subtotal += (product.discountPrice || product.price) * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    let couponCode = null;

    if (body.couponCode) {
      const coupon = await Coupon.findOne({
        code: body.couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return apiError("Invalid coupon code", 404);
      }

      if (coupon.expiry < new Date()) {
        return apiError("Coupon expired");
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return apiError("Coupon usage limit reached");
      }

      if (subtotal < coupon.minOrder) {
        return apiError(`Minimum order ₹${coupon.minOrder} required`);
      }

      if (coupon.discountType === "percentage") {
        couponDiscount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
        }
      } else {
        couponDiscount = coupon.discountValue;
      }

      couponCode = coupon.code;

      coupon.usedCount = (coupon.usedCount || 0) + 1;
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        coupon.isActive = false;
      }
      await coupon.save();
    }

    const totalPrice = Math.max(0, subtotal - couponDiscount);

    // Update user profile details if provided
    const updateData: any = {};
    if (body.userDetails) {
      if (body.userDetails.name) updateData.name = body.userDetails.name;
      if (body.userDetails.email) updateData.email = body.userDetails.email;
      if (body.userDetails.mobile) updateData.mobile = body.userDetails.mobile;
    }

    if (Object.keys(updateData).length) {
      await User.findByIdAndUpdate(user.userId, updateData, { new: true });
    }

    // Save the address to user address book if it isn't already present
    if (shippingAddress) {
      const userDoc = await User.findById(user.userId);
      if (userDoc) {
        const exists = userDoc.addresses?.some((addr: any) =>
          addr.fullName === shippingAddress.fullName &&
          addr.mobile === shippingAddress.mobile &&
          addr.pincode === shippingAddress.pincode &&
          addr.state === shippingAddress.state &&
          addr.city === shippingAddress.city &&
          addr.area === shippingAddress.area &&
          addr.landmark === (shippingAddress.landmark || "")
        );

        if (!exists) {
          userDoc.addresses = userDoc.addresses || [];
          userDoc.addresses.push({
            ...shippingAddress,
            isDefault: userDoc.addresses.length === 0,
          });
          await userDoc.save();
        }
      }
    }

    // Reduce stock
    for (const item of cart.items) {
      const product = (item as any).product;
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: user.userId,
      orderItems,
      shippingAddress,
      paymentMethod: body.paymentMethod || "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      totalPrice,
      shippingPrice: 0,
      couponCode,
      couponDiscount,
    });

    // Clear cart after order placement
    await Cart.findOneAndUpdate({ user: user.userId }, { items: [] });

    return apiSuccess({ order }, "Order placed successfully");
  } catch (error) {
    return handleError(error);
  }
}
