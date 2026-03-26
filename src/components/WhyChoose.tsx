"use client";

import { useEffect, useRef } from "react";
import { Leaf, Flame, ShieldCheck, Heart } from "lucide-react";
import FadeUp from "@/components/FadeUp";

const features = [
  { icon: Leaf, title: "100% Natural", description: "No additives. No preservatives." },
  { icon: Flame, title: "Low in Calories", description: "Smart snacking without guilt." },
  { icon: ShieldCheck, title: "Premium Quality", description: "Carefully sourced from Bihar." },
  { icon: Heart, title: "Heart Friendly", description: "Light, nutritious & easy to digest." },
];

export default function WhyChoose() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = container.scrollLeft;
    let isInteracting = false;
    let resumeTimeout: NodeJS.Timeout;

    const autoScroll = () => {
      if (!isInteracting) {
        scrollAmount += 0.8; // Speed thodi adjust ki hai smooth scroll ke liye (increase/decrease if needed)
        
        // Loop logic: Jab aadhi width par pohunche, reset kardo starting se
        if (scrollAmount >= container.scrollWidth / 2) {
          scrollAmount = 0;
        }
        
        container.scrollLeft = scrollAmount;
      }

      animationRef.current = requestAnimationFrame(autoScroll);
    };

    // User Interaction Handlers
    const pauseScroll = () => {
      isInteracting = true;
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const resumeScroll = () => {
      // User ke interaction ke baad jahan container ruka, wahi se scrollAmount resume karo
      scrollAmount = container.scrollLeft; 
      
      // Delay before resuming auto-scroll
      resumeTimeout = setTimeout(() => {
        isInteracting = false;
      }, 1000); 
    };

    // Touch events for mobile
    container.addEventListener("touchstart", pauseScroll, { passive: true });
    container.addEventListener("touchend", resumeScroll, { passive: true });
    
    // Mouse events for desktop testing (optional but good for UX)
    container.addEventListener("mouseenter", pauseScroll);
    container.addEventListener("mouseleave", resumeScroll);
    container.addEventListener("mousedown", pauseScroll);
    container.addEventListener("mouseup", resumeScroll);

    // Start Animation
    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      // Cleanup
      container.removeEventListener("touchstart", pauseScroll);
      container.removeEventListener("touchend", resumeScroll);
      container.removeEventListener("mouseenter", pauseScroll);
      container.removeEventListener("mouseleave", resumeScroll);
      container.removeEventListener("mousedown", pauseScroll);
      container.removeEventListener("mouseup", resumeScroll);

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };
  }, []);

  return (
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">

        <FadeUp>
          <h2 className="text-3xl md:text-5xl font-light mb-4 text-[var(--heading-color)]">
            Why HealtheBites?
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p className="text-sm md:text-lg mb-12 font-light text-[var(--color-muted)]">
            Pure. Honest. Naturally Powerful.
          </p>
        </FadeUp>

        {/* MOBILE AUTO SCROLL */}
        <div
          ref={scrollRef}
          className="flex md:hidden gap-5 overflow-x-auto no-scrollbar pb-4 select-none touch-pan-x"
        >
          {[...features, ...features].map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div key={index} className="min-w-[240px] bg-white rounded-xl p-6 shadow-sm">
                <Icon size={28} className="text-[var(--color-primary)] mb-4" />
                <h3 className="text-base font-medium mb-2 text-[var(--heading-color)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                  <div className="mb-6 flex justify-center">
                    <Icon size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg font-medium mb-3 text-[var(--heading-color)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {feature.description}
                  </p>
                </div>
              </FadeUp>
            );
          })}
        </div>

      </div>
    </section>
  );
}