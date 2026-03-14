import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import Product from "@/models/product.model";

import { createProductValidator } from "@/validators/product.validator";

import { adminMiddleware } from "@/middleware/admin.middleware";

import { apiSuccess, apiError } from "@/utils/apiResponse";

import { handleError } from "@/utils/errorHandler";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    // Search by either _id (if valid ObjectId) or slug
    const query = id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id) 
      ? { _id: id, isActive: true }
      : { slug: id, isActive: true };

    const product = await Product.findOne(query).lean();

    if (!product) {
      return apiError("Product not found", 404);
    }

    return apiSuccess({ product }, "Product fetched successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(

  req: NextRequest,

  { params }: { params: { id: string } }

) {

  try {

    await connectDB();

    const admin: any = await adminMiddleware(req);

    if (!admin) return;

    const { id } = params;

    const body = await req.json();

    const data = createProductValidator.partial().parse(body);

    const product = await Product.findById(id);

    if (!product) {

      return apiError("Product not found", 404);

    }

    Object.assign(product, data);

    await product.save();

    return apiSuccess(

      { product },

      "Product updated successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

export async function DELETE(

  req: NextRequest,

  { params }: { params: { id: string } }

) {

  try {

    await connectDB();

    const admin: any = await adminMiddleware(req);

    if (!admin) return;

    const { id } = params;

    const product = await Product.findById(id);

    if (!product) {

      return apiError("Product not found", 404);

    }

    product.isActive = false;

    await product.save();

    return apiSuccess(

      null,

      "Product deleted successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}