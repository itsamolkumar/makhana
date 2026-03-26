"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative py-20 md:py-24 px-6 bg-[var(--color-bg)] overflow-hidden">

      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] bg-[var(--color-primary)] opacity-[0.03] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-light text-[var(--heading-color)] mb-8 leading-tight tracking-wide">
          Elevate Your Everyday Snacking
        </h2>

        <p className="text-[var(--color-muted)] text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
          Experience makhana crafted with care, purity, and intention —
          straight from Bihar to your home.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="relative inline-flex items-center justify-center px-10 py-4 rounded-full text-white bg-[var(--color-primary)] text-lg tracking-wide shadow-md hover:shadow-xl transition-all duration-300"
        >
          Shop Now
        </motion.button>
      </motion.div>

    </section>
  );
}