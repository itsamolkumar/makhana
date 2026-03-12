"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-[var(--color-bg)] px-5">

      <div className="max-w-xl w-full text-center">

        {/* Big 404 */}
        <motion.h1
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-7xl sm:text-8xl font-extrabold text-[var(--color-primary)] tracking-tight"
        >
          404
        </motion.h1>

        {/* Oops Text */}
        <motion.h2
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-2xl font-semibold text-[var(--heading-color)]"
        >
          Oops! Page Not Found
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-neutral-500 text-sm sm:text-base leading-relaxed"
        >
          The page you are looking for might have been removed, renamed or is
          temporarily unavailable.
        </motion.p>

        {/* Icon Illustration */}
        <motion.div
          initial={{ rotate: -8, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <ShoppingCart
            size={80}
            className="text-[var(--color-primary)]/70"
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition"
          >
            Go to Homepage
          </Link>

          <Link
            href="/shop"
            className="border border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3 rounded-full text-sm font-medium hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            Continue Shopping
          </Link>
        </motion.div>

      </div>

    </section>
  );
}