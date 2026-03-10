import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";

import Product from "@/models/product.model";

import { apiSuccess, apiError } from "@/utils/apiResponse";

import { handleError } from "@/utils/errorHandler";

export async function GET(

  req: NextRequest,

  { params }: { params: { slug: string } }

) {

  try {

    await connectDB();

    const { slug } = params;

    const product = await Product

      .findOne({

        slug,

        isActive: true

      })

      .lean();

    if (!product) {

      return apiError("Product not found", 404);

    }

    return apiSuccess(

      { product },

      "Product fetched successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}