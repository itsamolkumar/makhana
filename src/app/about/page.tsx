"use client";

import { motion } from "framer-motion";
import FadeUp from "@/components/FadeUp";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-16 md:py-24 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <FadeUp>
            <h1 className="text-4xl md:text-5xl font-light text-[var(--heading-color)]">
              About <span className="font-medium text-[var(--color-primary)]">HealtheBites</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-lg text-[var(--color-muted)]">
              Redefining snacking with traditional goodness and modern purity.
            </p>
          </FadeUp>
        </div>

        {/* Hero Image */}
        <FadeUp delay={0.2}>
          <div className="rounded-3xl overflow-hidden aspect-video shadow-xl relative">
            <img 
              src="/Hero3.png" 
              alt="Makhana Harvest" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </FadeUp>

        {/* Story Section */}
        <div className="space-y-12">
          <FadeUp delay={0.3}>
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-[var(--heading-color)] mb-4">
                Our Journey
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed text-lg">
                HealtheBites was born out of a simple desire: to bring the authentic, wholesome goodness of Bihar's famous Makhana to the rest of the world. Growing up, Makhana was more than just a snack; it was a festival staple, a morning ritual, and a healthy addition to our diets. We noticed that the modern market was flooded with overly processed, artificial snacks that compromised on health for taste.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-[var(--heading-color)] mb-4">
                Why Makhana?
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed text-lg mb-4">
                Fox nuts, or Makhana, are incredibly nutritious. They are naturally low in calories, high in protein, and packed with anti-aging properties and antioxidants. Unlike popcorn or chips, Makhana provides a satisfying crunch without the unwanted fat or preservatives.
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed text-lg">
                By carefully roasting and lightly seasoning them, we discovered the perfect balance—a snack that respects its traditional roots while fitting perfectly into a fast-paced, health-conscious lifestyle.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.5}>
            <div className="bg-white p-8 md:p-10 rounded-3xl border shadow-sm">
              <h2 className="text-2xl font-medium text-[var(--heading-color)] mb-4">
                Our Promise
              </h2>
              <ul className="space-y-4 text-lg text-[var(--color-muted)] list-disc pl-5 marker:text-[var(--color-primary)]">
                <li><strong className="text-gray-800">100% Natural:</strong> We never use artificial flavors, colors, or harmful preservatives.</li>
                <li><strong className="text-gray-800">Sourced directly from farmers:</strong> We partner with local farmers in Bihar to ensure fair trade and exceptional quality.</li>
                <li><strong className="text-gray-800">Mindful snacking:</strong> Every pack of HealtheBites is designed to nourish your body and delight your taste buds.</li>
              </ul>
            </div>
          </FadeUp>
        </div>

      </div>
    </div>
  );
}
