import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { apiSuccess } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const product = await Product.findOne({
      slug: "traditional-raw-makhana-2",
      isActive: true,
    }).lean();

    if (!product) {
      return apiSuccess({ 
        status: "error",
        message: "Product not found",
        data: null 
      });
    }

    return apiSuccess({ 
      status: "success",
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        imagesArray: Array.isArray(product.images) ? product.images : [],
        imagesLength: product.images?.length || 0,
        hasImages: !!product.images && product.images.length > 0,
        allFields: product
      }
    });

  } catch (error) {
    console.error("Test endpoint error:", error);
    return apiSuccess({ 
      status: "error",
      error: String(error),
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
