"use client";

import { motion } from "framer-motion";
import FadeUp from "@/components/FadeUp";
import { useEffect, useState } from "react";

export default function BiharStory() {
  const [rootImage, setRootImage] = useState("/Hero2.jpeg");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/customization", { cache: "no-store" });
        const { data } = await res.json();
        if (data && data.rootImage) {
          setRootImage(data.rootImage);
        }
      } catch (err) {
        console.error("Failed to fetch root image");
      }
    }
    fetchConfig();
  }, []);

  return (
    <section className="py-16 md:py-20 px-6 bg-white">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* Image Side */}
        <FadeUp>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden shadow-xl bg-neutral-50 flex items-center justify-center p-2 h-[350px] md:h-[500px]"
          >
            <img
              src={rootImage}
              alt="Bihar Makhana Source"
              className="w-full h-full object-contain object-center rounded-2xl"
            />
          </motion.div>
        </FadeUp>

        {/* Content Side */}
        <div>

          <FadeUp>
            <div className="mb-6">
              <span className="text-sm tracking-widest text-[var(--color-accent)] uppercase">
                Our Roots
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-light text-[var(--heading-color)] mb-6 leading-snug">
              From the Lakes of Bihar
              <br />
              to Your Everyday Snack
            </h2>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-[var(--color-muted)] leading-relaxed mb-6">
              Our makhana is sourced directly from the fertile lakes of Bihar,
              where generations of farmers have cultivated it with care.
              We work closely with local growers to ensure purity,
              freshness, and authentic taste in every pack.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Every bite carries the richness of tradition and the promise
              of clean, mindful nutrition.
            </p>
          </FadeUp>

        </div>

      </div>

    </section>
  );
}