import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import Cart from "@/models/cart.model";

import { authMiddleware } from "@/middleware/auth.middleware";

import { apiSuccess, apiError } from "@/utils/apiResponse";

import { handleError } from "@/utils/errorHandler";


export async function DELETE(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const cart = await Cart.findOne({ user: user.userId });

    if (!cart) {

      return apiError("Cart not found", 404);

    }

    cart.items = [];

    await cart.save();

    return apiSuccess(

      null,

      "Cart cleared successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}