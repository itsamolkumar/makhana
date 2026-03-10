import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import Coupon from "@/models/coupon.model";
import Cart from "@/models/cart.model";
import Product from "@/models/product.model";

import { authMiddleware } from "@/middleware/auth.middleware";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";


export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const body = await req.json();

    const { code } = body;


    const coupon = await Coupon.findOne({

      code: code.toUpperCase(),

      isActive: true

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


    const cart = await Cart

      .findOne({ user: user.userId })

      .populate("items.product");


    if (!cart || cart.items.length === 0) {

      return apiError("Cart is empty");

    }


    let subtotal = 0;

    cart.items.forEach((item: any) => {

      subtotal += item.product.price * item.quantity;

    });


    if (subtotal < coupon.minOrder) {

      return apiError(

        `Minimum order ₹${coupon.minOrder} required`

      );

    }


    let discount = 0;


    if (coupon.discountType === "percentage") {

      discount = (subtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount) {

        discount = Math.min(discount, coupon.maxDiscount);

      }

    }

    else {

      discount = coupon.discountValue;

    }


    const finalPrice = subtotal - discount;


    return apiSuccess(

      {

        subtotal,

        discount,

        finalPrice,

        coupon: coupon.code

      },

      "Coupon applied successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

