"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const defaultSlides = [
  { type: "video", src: "/intro.mp4" },
  { type: "image", src: "/Hero2.jpeg" },
  { type: "image", src: "/Hero3.png" },
  { type: "image", src: "/Hero4.png" },
  { type: "image", src: "/Hero5.jpeg" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/customization", { cache: "no-store" });
        const { data } = await res.json();
        if (data && data.heroSlides && data.heroSlides.length > 0) {
          setSlides(data.heroSlides);
        }
      } catch (err) {
        console.error("Failed to fetch custom hero slides");
      }
    }
    fetchConfig();
  }, []);

  // Auto-slide (images only)
  useEffect(() => {
    if (current === 0 || slides.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 1 : prev + 1
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [current, slides.length]);

  // Swipe support
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -50) {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 1 : prev + 1
      );
    }
    if (info.offset.x > 50) {
      setCurrent((prev) =>
        prev === 1 ? slides.length - 1 : prev - 1
      );
    }
  };

  return (
    <section className="relative w-full overflow-hidden aspect-video md:h-screen">

      {/* Slides */}
      <AnimatePresence mode="wait">
        {slides[current].type === "video" ? (
          <motion.video
            key="video"
            autoPlay
            muted
            playsInline
            onEnded={() => setCurrent(1)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <source src={slides[current].src} type="video/mp4" />
          </motion.video>
        ) : (
          <motion.img
            key={slides[current].src}
            src={slides[current].src}
            alt="Hero Slide"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Soft Gradient Overlay (Desktop Only) */}
      <div className="hidden md:block absolute inset-0 bg-linear-to-b 
        from-[#FAF6F0]/10 
        via-[#FAF6F0]/30 
        to-[#FAF6F0]/70">
      </div>

      {/* First Slide Text */}
      {current === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">

          <div className="max-w-3xl">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[22px] md:text-6xl font-light leading-tight tracking-wide"
              style={{ 
                color: "#2F2A24",
                letterSpacing: "0.5px"
              }}
            >
              From the Heart of Bihar
              <br />
              <span className="font-medium">
                To Your Healthy Moments
              </span>
            </motion.h1>

            {/* Desktop subtitle only */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block text-lg mt-6 font-light"
              style={{ color: "#6B645C" }}
            >
              Naturally grown makhana crafted for modern snacking.
            </motion.p>

            {/* Button */}
            <Link href="/shop">
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm md:text-base shadow-md hover:scale-105 transition"
              style={{
                backgroundColor: "#1F4D36",
                color: "white"
              }}
            >
              <ShoppingBag size={16} />
              Shop Now
            </motion.button>
            </Link>

          </div>

        </div>
      )}

      {/* Progress Bar */}
      {current !== 0 && (
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#1F4D36]"
        />
      )}

      {/* Elegant Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.slice(1).map((_, index) => {
          const slideIndex = index + 1;

          return (
            <button
              key={slideIndex}
              onClick={() => setCurrent(slideIndex)}
              className={`transition-all duration-300 rounded-full ${
                current === slideIndex
                  ? "w-5 h-[3px] bg-[#1F4D36]"
                  : "w-4 h-[3px] bg-black/20"
              }`}
            />
          );
        })}
      </div>

    </section>
  );
}