import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await context.params;
    const product = await Product.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!product) return apiError("Product not found", 404);

    // Add inStock field based on stock
    const productWithInStock = {
      ...product,
      inStock: product.stock > 0
    };

    return apiSuccess({ product: productWithInStock });

  } catch (error) {
    return handleError(error);
  }
}