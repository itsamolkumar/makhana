import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/review.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return apiError("productId is required", 400);
    }

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate("user", "name _id")
      .lean();

    return apiSuccess({ reviews });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { productId, orderId, rating, comment } = body;

    if (!productId) return apiError("productId is required", 400);
    if (!rating || rating < 1 || rating > 5) return apiError("Rating must be between 1 and 5", 400);

    try {
      const review = await Review.create({
        user: user.userId,
        product: productId,
        order: orderId,
        rating,
        comment,
      });

      return apiSuccess({ review }, "Review added successfully");
    } catch (err: any) {
      // Handle duplicate review error (unique index)
      if (err.code === 11000) {
        return apiError("You have already reviewed this product", 400);
      }
      throw err;
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId) return apiError("reviewId is required", 400);

    const review = await Review.findById(reviewId);
    if (!review) return apiError("Review not found", 404);
    if (review.user.toString() !== user.userId) return apiError("Not authorized", 403);

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) return apiError("Rating must be between 1 and 5", 400);
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();
    return apiSuccess({ review }, "Review updated successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user: any = await authMiddleware(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { reviewId } = body;

    if (!reviewId) return apiError("reviewId is required", 400);

    const review = await Review.findById(reviewId);
    if (!review) return apiError("Review not found", 404);
    if (review.user.toString() !== user.userId) return apiError("Not authorized", 403);

    await review.deleteOne();
    return apiSuccess({ message: "Review deleted" });
  } catch (error) {
    return handleError(error);
  }
}
