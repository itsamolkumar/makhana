import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/review.model";
import { apiSuccess } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get the review with the most likes
    const topReview = await Review.findOne()
      .sort({ likes: -1 })
      .populate("user", "name _id")
      .populate("product", "name")
      .limit(1);

    return apiSuccess({ review: topReview });
  } catch (error) {
    return handleError(error);
  }
}