"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Product } from "@/types";
import { getProductBySlug } from "@/services/productService";
import { addToCart } from "@/redux/slices/cartSlice";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import ReviewList from "@/components/reviews/ReviewList";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const slug = (params as any)?.slug;

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductBySlug(slug);
        if (res.data?.data?.product) {
          setProduct(res.data.data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;

    setSelectedImageIndex(0);

    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=4`);
        const data = await response.json();
        const products = data.data?.products || [];
        // Filter out current product
        const filtered = products.filter((p: Product) => p._id !== product._id);
        setRelatedProducts(filtered.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch related products", error);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-xl">
          <h2 className="text-2xl font-semibold mb-4">{error || "Product not found"}</h2>
          <button
            onClick={() => router.push("/shop")}
            className="mt-4 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          {/* Product Image Gallery */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <img
              src={product.images?.[selectedImageIndex] || "/makhana-premium1.png"}
              alt={product.name}
              className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Image overlay with zoom indicator */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-3">
            {product.images?.slice(0, 4).map((img, index) => (
              <div
                key={img}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedImageIndex === index
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={img} alt={product.name} className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>

          {/* Product Highlights */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Why Choose This Product?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Premium Quality
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Healthy & Natural
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Rich in Nutrients
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Long Shelf Life
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-2">{product.category}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--heading-color)]">
                  ₹{product.discountPrice || product.price}
                </div>
                {product.discountPrice && (
                  <div className="text-sm text-gray-500 line-through">₹{product.price}</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                {product.ratings ? product.ratings.toFixed(1) : "0.0"} ★
              </span>
              <span className="text-sm text-gray-500">{product.numReviews || 0} reviews</span>
              <span className="text-sm text-gray-500">{product.inStock ? "In stock" : "Out of stock"}</span>
            </div>

            <div
              className="mt-6 text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  if (user) {
                    router.push("/checkout");
                  } else {
                    router.push("/login?redirectTo=/checkout");
                  }
                }}
                disabled={!product.inStock}
                className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Buy Now
              </button>
            </div>
          </div>

          <ReviewList productId={product._id} allowCreate={!!user} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">You Might Also Like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/shop/${relatedProduct.slug}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.images?.[0] || "/makhana-premium1.png"}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">
                          {relatedProduct.ratings ? relatedProduct.ratings.toFixed(1) : "0.0"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--heading-color)]">
                          ₹{relatedProduct.discountPrice || relatedProduct.price}
                        </div>
                        {relatedProduct.discountPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            ₹{relatedProduct.price}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.images?.[selectedImageIndex] || "/makhana-premium1.png"}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1));
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition"
                >
                  &lt;
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition"
                >
                  &gt;
                </button>
              </>
            )}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
