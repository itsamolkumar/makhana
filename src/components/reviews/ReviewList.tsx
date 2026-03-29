"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import { getReviews, deleteReview } from "@/services/reviewService";
import { Review } from "@/types";
import ReviewForm from "./ReviewForm";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface ReviewListProps {
  productId: string;
  allowCreate?: boolean;
  orderId?: string;
  onReviewAdded?: () => void;
}

export default function ReviewList({ productId, allowCreate = true, orderId, onReviewAdded }: ReviewListProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { confirm } = useConfirm();

  const userReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.user?._id === user.id);
  }, [reviews, user]);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getReviews(productId);
      setReviews(res.data?.data?.reviews || []);
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [productId]);

  const handleDelete = async (reviewId: string) => {
    const accepted = await confirm({
      title: "Delete this review?",
      description: "Your review will be removed from the product page.",
      confirmText: "Delete review",
      cancelText: "Keep it",
      tone: "danger",
    });
    if (!accepted) return;

    try {
      await deleteReview(reviewId);
      toast.success("Review deleted");
      fetch();
      onReviewAdded?.();
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(error?.response?.data?.message || "Failed to delete review");
    }
  };

  const handleSaved = () => {
    setEditing(null);
    setShowForm(false);
    fetch();
    onReviewAdded?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Customer Reviews</h2>
          <p className="text-sm text-gray-500">See what other customers are saying and share your own experience.</p>
        </div>
        {allowCreate && user ? (
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition"
          >
            {userReview ? "Edit Your Review" : "Write a Review"}
          </button>
        ) : !user ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-blue-700">Please login to add valuable comment</p>
          </div>
        ) : null}
      </div>

      {showForm || editing ? (
        <ReviewForm
          productId={productId}
          initialReview={editing || userReview || undefined}
          orderId={orderId}
          onSaved={handleSaved}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
        />
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</span>
                    <span className="text-sm text-gray-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {user && review.user?._id === user.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(review);
                        setShowForm(true);
                      }}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(review._id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              {review.comment ? (
                <p className="mt-4 text-gray-700 whitespace-pre-line">{review.comment}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
