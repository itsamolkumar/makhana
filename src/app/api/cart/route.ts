import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import Cart from "@/models/cart.model";
import Product from "@/models/product.model";

import { authMiddleware } from "@/middleware/auth.middleware";

import { addToCartValidator } from "@/validators/cart.validator";

import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";


export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const body = await req.json();

    const { productId, quantity } = addToCartValidator.parse(body);


    const product = await Product.findById(productId);

    if (!product || !product.isActive) {

      return apiError("Product not available", 404);

    }


    let cart = await Cart.findOne({ user: user.userId });

    if (!cart) {

      cart = await Cart.create({

        user: user.userId,

        items: []

      });

    }


    const existingItem = cart.items.find(

      (item: any) => item.product.toString() === productId

    );


    if (existingItem) {

      existingItem.quantity += quantity;

    }

    else {

      cart.items.push({

        product: product._id,

        quantity

      });

    }


    await cart.save();


    return apiSuccess(

      { cart },

      "Product added to cart"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

export async function GET(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const cart = await Cart

      .findOne({ user: user.userId })

      .populate("items.product")

      .lean();


    if (!cart) {

      return apiSuccess(

        { items: [], subtotal: 0 },

        "Cart is empty"

      );

    }


    let subtotal = 0;


    const items = cart.items.map((item: any) => {

      const product = item.product;

      const total = product.price * item.quantity;

      subtotal += total;

      return {

        productId: product._id,

        name: product.name,

        price: product.price,

        image: product.images?.[0],

        quantity: item.quantity,

        total

      };

    });


    return apiSuccess(

      {

        items,

        subtotal

      },

      "Cart fetched successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

export async function PATCH(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const body = await req.json();

    const { productId, quantity } = addToCartValidator.parse(body);


    const cart = await Cart.findOne({ user: user.userId });

    if (!cart) {

      return apiError("Cart not found", 404);

    }


    const item = cart.items.find(

      (item: any) => item.product.toString() === productId

    );


    if (!item) {

      return apiError("Product not in cart", 404);

    }


    item.quantity = quantity;


    await cart.save();


    return apiSuccess(

      { cart },

      "Cart updated successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

export async function DELETE(req: NextRequest) {

  try {

    await connectDB();

    const user: any = await authMiddleware(req);

    if (!user) return;

    const body = await req.json();

    const { productId } = body;


    const cart = await Cart.findOne({ user: user.userId });

    if (!cart) {

      return apiError("Cart not found", 404);

    }


    cart.items = cart.items.filter(

      (item: any) => item.product.toString() !== productId

    );


    await cart.save();


    return apiSuccess(

      { cart },

      "Item removed from cart"

    );

  }

  catch (error) {

    return handleError(error);

  }

}