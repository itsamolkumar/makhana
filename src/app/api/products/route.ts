import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { apiSuccess } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const query: any = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return apiSuccess({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    return handleError(error);
  }
}