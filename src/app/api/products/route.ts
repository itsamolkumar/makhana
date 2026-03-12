import { NextRequest } from "next/server";
<<<<<<< HEAD

import { connectDB } from "@/lib/db";

import Product from "@/models/product.model";

import { createProductValidator } from "@/validators/product.validator";

import { adminMiddleware } from "@/middleware/admin.middleware";

import { apiSuccess } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";


function generateSlug(name: string) {

  return name

    .toLowerCase()

    .replace(/\s+/g, "-")

    .replace(/[^\w-]+/g, "");

}


export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const admin: any = await adminMiddleware(req);

    if (!admin) return;

    const body = await req.json();

    const data = createProductValidator.parse(body);

    const slug = generateSlug(data.name);

    const existing = await Product.findOne({ slug });

    if (existing) {

      throw new Error("Product with same name already exists");

    }

    const product = await Product.create({

      ...data,

      slug

    });

    return apiSuccess(

      { product },

      "Product created successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}

export async function GET(req: NextRequest) {

  try {

    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;

    const limit = Number(searchParams.get("limit")) || 10;

    const search = searchParams.get("search");

    const category = searchParams.get("category");

    const minPrice = Number(searchParams.get("minPrice"));

    const maxPrice = Number(searchParams.get("maxPrice"));

    const sort = searchParams.get("sort");


    const query: any = {

      isActive: true

    };


    if (search) {

      query.name = {

        $regex: search,

        $options: "i"

      };

    }


    if (category) {

      query.category = category;

    }


    if (minPrice || maxPrice) {

      query.price = {};

      if (minPrice) query.price.$gte = minPrice;

      if (maxPrice) query.price.$lte = maxPrice;

    }


    const skip = (page - 1) * limit;


    let sortOption: any = {

      createdAt: -1

    };


    if (sort === "price") {

      sortOption = { price: 1 };

    }

    if (sort === "-price") {

      sortOption = { price: -1 };

    }

    if (sort === "latest") {

      sortOption = { createdAt: -1 };

    }


    const products = await Product

      .find(query)

      .sort(sortOption)

      .skip(skip)

      .limit(limit)

      .lean();


    const total = await Product.countDocuments(query);


    return apiSuccess(

      {

        products,

        total,

        page,

        pages: Math.ceil(total / limit)

      },

      "Products fetched successfully"

    );

  }

  catch (error) {

    return handleError(error);

  }

}
=======
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "-createdAt"; // Default new first
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query: any = {};

    // 1. Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // 3. Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination bounds
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Map _id to id and add frontend helpers
    const formattedProducts = products.map((p: any) => {
      p.id = p._id.toString();
      p.inStock = p.stock > 0;
      delete p._id; // Clean up
      return p;
    });

    return apiSuccess({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Products fetched successfully");

  } catch (error) {
    return handleError(error);
  }
}
>>>>>>> 0563ed2 (adding authentication ui using gravity)
