import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { updateProductValidator } from "@/validators/product.validator";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";


// ⭐ UNIQUE SLUG GENERATOR
async function generateUniqueSlug(name: string) {
  let baseSlug = name
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



// ⭐ GET SINGLE PRODUCT
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (!admin) return apiError("Unauthorized", 401);

    const { id } = await params;
    console.log("id---", id);

    const product = await Product.findById(id);

    if (!product) return apiError("Product not found", 404);

    return apiSuccess({ product }, "Product fetched");

  } catch (error) {
    return handleError(error);
  }
}



// ⭐ UPDATE PRODUCT
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (!admin) return apiError("Unauthorized", 401);

    const { id } = await params;

    const body = await req.json();
    const data = updateProductValidator.parse(body);

    const product = await Product.findOne({
      _id: id,
      isActive: true
    });

    if (!product) return apiError("Product not found", 404);

    // ⭐ regenerate slug if name updated
    if (data.name && data.name !== product.name) {
      product.slug = await generateUniqueSlug(data.name);
    }

    Object.assign(product, data);

    await product.save();

    return apiSuccess(
      { product: product.toObject() },
      "Product updated"
    );

  } catch (error) {
    return handleError(error);
  }
}



// ⭐ SOFT DELETE PRODUCT
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await adminMiddleware(req);
    if (!admin) return apiError("Unauthorized", 401);

    const { id } = await params;

    const product = await Product.findOne({
      _id: id,
      isActive: true
    });

    if (!product) return apiError("Product not found", 404);

    product.isActive = false;
    await product.save();

    return apiSuccess(null, "Product deleted");

  } catch (error) {
    return handleError(error);
  }
}