import { NextRequest } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import cloudinary from "@/lib/cloudinary";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

// ⭐ UNIQUE SLUG GENERATOR
async function generateUniqueSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (admin instanceof Response) return admin;

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const minPriceParam = url.searchParams.get("minPrice");
    const maxPriceParam = url.searchParams.get("maxPrice");
    const minStockParam = url.searchParams.get("minStock");
    const maxStockParam = url.searchParams.get("maxStock");

    const minPrice = minPriceParam !== null ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam !== null ? Number(maxPriceParam) : undefined;
    const minStock = minStockParam !== null ? Number(minStockParam) : undefined;
    const maxStock = maxStockParam !== null ? Number(maxStockParam) : undefined;

    const query: any = {};

    // Search by name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Status filter (active/inactive)
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    if (category) query.category = category;

    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      query.price = { ...(query.price || {}), $gte: minPrice };
    }
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      query.price = { ...(query.price || {}), $lte: maxPrice };
    }

    if (minStock !== undefined && !Number.isNaN(minStock)) {
      query.stock = { ...(query.stock || {}), $gte: minStock };
    }
    if (maxStock !== undefined && !Number.isNaN(maxStock)) {
      query.stock = { ...(query.stock || {}), $lte: maxStock };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    console.log("products are", products);

    return apiSuccess({ products }, "Products fetched");
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (admin instanceof Response) return admin;

    // Support JSON body (from client-side upload + submit flow) or FormData (legacy / file upload)
    let data: any;
    let imageUrls: string[] = [];

    try {
      data = await req.json();
    } catch {
      // not JSON; fallback to FormData
      const formData = await req.formData();
      data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        weight: formData.get("weight") as string,
        stock: parseInt(formData.get("stock") as string),
      };

      const imageFiles = formData.getAll("images") as File[];
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        imageUrls.push((uploadResult as any).secure_url);
      }
    }

    // Validation
    const name = data.name as string;
    const description = data.description as string;
    const price = Number(data.price);
    const discountPrice =
      data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== ""
        ? Number(data.discountPrice)
        : undefined;
    const category = data.category as string;
    const weight = data.weight as string;
    const stock = Number(data.stock);

    if (!name || Number.isNaN(price) || !category || !weight || Number.isNaN(stock)) {
      return apiError("All fields required", 400);
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      imageUrls = data.images as string[];
    }

    if (imageUrls.length === 0) {
      return apiError("At least one image is required", 400);
    }

    const slug = await generateUniqueSlug(name);

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      category,
      images: imageUrls,
      weight,
      stock,
      slug,
      ratings: 0,
      numReviews: 0,
      isActive: true,
    });

    return apiSuccess(
      { product: product.toObject() },
      "Product created",
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (admin instanceof Response) return admin;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return apiError("Product ID required", 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return apiError("Product not found", 404);
    }

    product.isActive = false;
    await product.save();

    return apiSuccess({ product: product.toObject() }, "Product deleted successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (admin instanceof Response) return admin;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return apiError("Product ID required", 400);
    }

    const body = await req.json();
    const isActive = body?.isActive;

    if (typeof isActive !== "boolean") {
      return apiError("isActive must be a boolean", 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return apiError("Product not found", 404);
    }

    product.isActive = isActive;
    await product.save();

    return apiSuccess({ product: product.toObject() }, "Product status updated");
  } catch (error) {
    return handleError(error);
  }
}
