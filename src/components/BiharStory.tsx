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
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5"
          >
            <div className="aspect-[4/3] w-full min-h-[240px] md:aspect-[16/10] md:min-h-[320px]">
              <img
                src={rootImage}
                alt="Bihar Makhana Source"
                className="h-full w-full object-cover object-center"
              />
            </div>
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