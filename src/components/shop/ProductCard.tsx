"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart } from "@/redux/slices/cartSlice";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 transition-all duration-300 border border-neutral-100 overflow-hidden flex flex-col h-full"
    >
      <Link href={`/shop/${product.slug}`} className="flex flex-col h-full relative cursor-pointer">
        {/* Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            SALE
          </div>
        )}
        
        {/* Image Wrapper */}
        <div className="relative w-full aspect-square bg-neutral-50 overflow-hidden flex items-center justify-center p-6">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : "/makhana-premium1.png"}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 will-change-transform"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-2">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
              {product.category || "Snacks"}
            </p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>
          
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-xl font-bold text-[var(--color-primary)]">
                    ₹{product.discountPrice}
                  </span>
                  <span className="text-sm font-medium text-gray-400 line-through">
                    ₹{product.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              type="button"
              disabled={!product.inStock}
              className="w-12 h-12 rounded-full bg-neutral-50 hover:bg-[var(--color-primary)] text-gray-700 hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              title={product.inStock ? "Add to cart" : "Out of stock"}
            >
              <ShoppingCart size={20} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
