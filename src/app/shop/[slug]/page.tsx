"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Product } from "@/types";
import { getProductBySlug } from "@/services/productService";
import { addToCart } from "@/redux/slices/cartSlice";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import ReviewList from "@/components/reviews/ReviewList";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductBySlug(slug);

        const productData = res?.data?.data?.product;
        if (!productData) {
          setError("Product not found");
          return;
        }

        setProduct(productData);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ================= RELATED PRODUCTS =================
  useEffect(() => {
    if (!product) return;

    setSelectedImageIndex(0);

    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?category=${encodeURIComponent(
            product.category
          )}&limit=4`
        );
        const data = await res.json();

        const filtered =
          data?.data?.products?.filter(
            (p: Product) => p._id !== product._id
          ) || [];

        setRelatedProducts(filtered.slice(0, 3));
      } catch {}
    };

    fetchRelatedProducts();
  }, [product]);

  // ================= ACTIONS =================
  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (!user) {
      toast.error("Please login first!", {
        duration: 3000,
      });
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
    toast.success("Added to cart!");
  }, [product, user, dispatch]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;

    if (!user) {
      toast.error("Login required!", {
        duration: 3000,
      });
      router.push("/login?redirectTo=/checkout");
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
    router.push("/checkout");
  }, [product, user, dispatch, router]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ================= ERROR =================
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border text-center">
          <h2 className="text-xl font-semibold">
            {error || "Product not found"}
          </h2>
          <button
            onClick={() => router.push("/shop")}
            className="mt-4 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-10 px-4 overflow-x-hidden">

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="space-y-6">

          {/* IMAGE */}
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="w-full h-80 sm:h-96 flex items-center justify-center">

              {product.images?.[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/fallback.png";
                  }}
                />
              ) : (
                <p className="text-gray-400">No Image</p>
              )}

            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {product.images?.slice(0, 4).map((img, index) => (
              <div
                key={img}
                onClick={() => setSelectedImageIndex(index)}
                className={`cursor-pointer border rounded-xl overflow-hidden ${
                  selectedImageIndex === index
                    ? "border-[var(--color-primary)]"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  className="w-full h-20 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white rounded-3xl shadow-sm border p-6 sm:p-8">

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {product.category}
            </p>

            <div className="mt-4 text-2xl sm:text-3xl font-bold text-[var(--heading-color)]">
              ₹{product.discountPrice || product.price}
            </div>

            {/* PRODUCT INFO */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">

              <div className="bg-gray-50 border rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-semibold">{product.weight}</p>
              </div>

              <div className="bg-gray-50 border rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Stock</p>
                <p className={product.inStock ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </p>
              </div>

              <div className="bg-gray-50 border rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-semibold">
                  {product.ratings?.toFixed(1) || "0.0"} ★
                </p>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div
              className="mt-6 text-gray-700"
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold bg-[var(--color-primary)] text-white disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 px-6 py-4 rounded-full font-semibold border-2 border-[var(--color-primary)] text-[var(--color-primary)] disabled:opacity-50"
              >
                Buy Now
              </button>

            </div>
          </div>

          <ReviewList productId={product._id} allowCreate={!!user} />
        </div>
      </div>

      {/* RELATED */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">
            You Might Also Like
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => router.push(`/shop/${p.slug}`)}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer"
              >
                <img
                  src={p.images?.[0]}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{p.discountPrice || p.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}