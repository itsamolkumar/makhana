"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { removeFromCart, updateQuantity, clearCart } from "@/redux/slices/cartSlice";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, subtotal, discount, total } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--heading-color)] mb-3">Your cart is empty</h1>
          <p className="text-gray-600 mb-8 text-lg">Add some delicious makhana to get started!</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-4 rounded-full hover:opacity-90 transition font-semibold text-lg shadow-lg hover:shadow-xl duration-300"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--heading-color)]">Shopping Cart</h1>
          <p className="text-gray-600 mt-2 text-lg">You have <span className="font-bold text-[var(--color-primary)]">{items.length}</span> {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const price = item.product.discountPrice || item.product.price;
              const itemTotal = price * item.quantity;
              return (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.images?.[0] || "/makhana-premium1.png"}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                      <h3 className="font-bold text-base sm:text-lg text-[var(--heading-color)] mb-1 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 font-medium">{item.product.weight}</p>

                      {/* Price Info */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg sm:text-xl font-bold text-[var(--color-primary)]">₹{price}</span>
                        {item.product.discountPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">₹{item.product.price}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id!, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition font-semibold text-gray-700"
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-900 w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id!, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition font-semibold text-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">({item.quantity} × ₹{price})</p>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="text-lg sm:text-2xl font-bold text-[var(--heading-color)]">₹{itemTotal}</p>
                        {item.product.discountPrice && (
                          <p className="text-xs text-gray-500 line-through hidden sm:block">
                            ₹{item.product.price * item.quantity}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.product._id!)}
                        className="absolute sm:relative top-0 right-0 sm:top-auto sm:right-auto text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition duration-200"
                      >
                        <Trash2 size={20} className="sm:w-[22px] sm:h-[22px]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 h-fit sticky top-24 space-y-6"
            >
              <h2 className="text-2xl font-bold text-[var(--heading-color)]">Order Summary</h2>

              {/* Pricing Breakdown */}
              <div className="space-y-4 py-6 border-y border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Discount</span>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}

                {/* Divider */}
                {discount > 0 && (
                  <div className="text-xs text-gray-500 text-center py-2">Savings applied</div>
                )}
              </div>

              {/* Total */}
              <div className="space-y-2 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Estimated Total</span>
                  <span className="text-3xl font-bold text-[var(--color-primary)]">₹{total}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">(Including all taxes)</p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push("/checkout");
                  } else {
                    router.push("/login?redirectTo=/checkout");
                  }
                }}
                className="w-full bg-[var(--color-primary)] text-white py-4 rounded-full font-bold hover:opacity-90 transition duration-300 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Proceed to Checkout
              </button>

              {/* Continue Shopping Link */}
              <Link
                href="/shop"
                className="block text-center text-[var(--color-primary)] hover:underline font-semibold transition"
              >
                ← Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Authentic Products</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Fast Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}