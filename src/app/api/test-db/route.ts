import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Review from "@/models/review.model"
import Product from "@/models/product.model"
import User from "@/models/user.model"
import Order from "@/models/order.model"

export async function GET() {

  try {

    await connectDB()

    // Seed default reviews
    const products = await Product.find().limit(3)
    const users = await User.find().limit(2)

    if (products.length > 0 && users.length > 0) {
      const defaultReviews = [
        {
          user: users[0]._id,
          product: products[0]._id,
          order: null, // Allow null for default reviews
          rating: 5,
          comment: "Amazing product! The quality is outstanding and it arrived quickly. Highly recommend!",
          likes: 12
        },
        {
          user: users[0]._id,
          product: products[1]._id,
          order: null,
          rating: 4,
          comment: "Great taste and healthy option. Will definitely buy again.",
          likes: 8
        },
        {
          user: users[1]._id,
          product: products[0]._id,
          order: null,
          rating: 5,
          comment: "Love this! Perfect for healthy snacking. The flavor is incredible.",
          likes: 15
        }
      ]

      for (const reviewData of defaultReviews) {
        const existing = await Review.findOne({ user: reviewData.user, product: reviewData.product })
        if (!existing) {
          await Review.create(reviewData)
        }
      }

      // Update product ratings
      for (const product of products) {
        const reviews = await Review.find({ product: product._id })
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          await Product.findByIdAndUpdate(product._id, {
            ratings: Math.round(avgRating * 10) / 10,
            numReviews: reviews.length
          })
        }
      }
    }

    return NextResponse.json({
      message: "MongoDB connected successfully and default reviews seeded"
    })

  } catch (error) {

    return NextResponse.json({
      message: "DB connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })

  }

}