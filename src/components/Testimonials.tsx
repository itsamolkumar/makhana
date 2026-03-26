"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { getReviews } from "@/services/reviewService";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sneha Shah",
    role: "Graphic Designer",
    text: "I'm hooked on the Cheesy Italiano makhana from Healthebites! It's crunchy, healthy, and bursting with flavor. What's better is that it's roasted, so I don't feel guilty munching on it during my work breaks.",
    rating: 5
  },
  {
    id: "2",
    name: "Rakesh Jain",
    role: "Marketing Executive",
    text: "Healthebites Pudina Punch is a refreshing twist to the usual snacks! I love how light and crunchy it is. I can indulge in this flavorful snack without any hesitation. A perfect blend of taste and health!",
    rating: 5
  },
  {
    id: "3",
    name: "Meenal Deshmukh",
    role: "Homemaker",
    text: "As someone who enjoys cheesy flavors, the Cheesy Italiano from Healthebites is my absolute favorite. It's so delicious, and I don't feel bad about snacking since it's roasted.",
    rating: 5
  },
  {
    id: "4",
    name: "Neha Patel",
    role: "Fitness Enthusiast",
    text: "I have been snacking on Healthebites Spicy Indiana flavor for a while now, and it's simply addictive! The fact that it's roasted and not fried makes it a healthy option for movie nights!",
    rating: 5
  },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTopReview = async () => {
      try {
        const response = await fetch('/api/reviews/top');
        const data = await response.json();
        const topReview = data.data?.review;

        if (topReview && topReview.likes > 0) {
          const reviewTestimonial = {
            id: topReview._id,
            name: topReview.user?.name || "Anonymous",
            role: "Customer",
            text: topReview.comment || "Great product!",
            rating: topReview.rating
          };
          setTestimonials([reviewTestimonial, ...defaultTestimonials.slice(0, 3)]);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        console.error("Error fetching top review", error);
        setTestimonials(defaultTestimonials);
      }
    };

    fetchTopReview();
  }, []);

  // --- Logic: Slide Transitions ---
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = testimonials.length - 1;
      if (next >= testimonials.length) next = 0;
      return next;
    });
  }, []);

  // --- Logic: Auto Play with Reset ---
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        paginate(1);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, paginate]);

  // User interaction handle karne ke liye function
  const handleUserInteraction = (action: () => void) => {
    setIsAutoPlaying(false); // Stop auto play
    action();
    // 8 seconds baad wapas auto play start karne ke liye
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <section className="relative bg-[#FDFBF7] py-12 md:py-20 px-6 overflow-hidden font-sans">
      {/* Cream/Off-white background matching the Healthebites theme */}
      <div className="max-w-5xl mx-auto text-center relative">
        
        {/* Premium Light Heading */}
        <h2 className="text-[#2C3E2D] text-3xl md:text-5xl font-light mb-16 tracking-wide">
          Happy Shoutouts
        </h2>

        <div className="relative max-w-3xl mx-auto">
          {/* Card Wrapper with Drag Support & Soft Shadows */}
          <motion.div 
            className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-8 py-14 md:px-16 md:py-16 min-h-[350px] flex flex-col justify-center cursor-grab active:cursor-grabbing overflow-hidden border border-gray-50"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.x > 50) handleUserInteraction(() => paginate(-1));
              else if (info.offset.x < -50) handleUserInteraction(() => paginate(1));
            }}
          >
            {/* Soft Quote Icon in Background */}
            <Quote className="absolute top-8 right-10 text-[#1A3A2A] opacity-5 pointer-events-none" size={100} fill="currentColor" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 50, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -50, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center relative z-10"
              >
                <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl">
                  "{testimonials[current].text}"
                </p>

                {/* Stars - Premium Gold color */}
                <div className="flex gap-1.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <h4 className="text-lg md:text-xl font-medium text-[#1A3A2A]">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-gray-500 font-light text-sm mt-1 tracking-wide">
                    {testimonials[current].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation Arrows (Visible on Desktop, positioned outside the card) */}
          <button 
            onClick={() => handleUserInteraction(() => paginate(-1))}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md border border-gray-100 text-[#1A3A2A] hover:bg-[#1A3A2A] hover:text-white transition-all duration-300 hidden md:flex items-center justify-center z-10"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <button 
            onClick={() => handleUserInteraction(() => paginate(1))}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md border border-gray-100 text-[#1A3A2A] hover:bg-[#1A3A2A] hover:text-white transition-all duration-300 hidden md:flex items-center justify-center z-10"
            aria-label="Next Testimonial"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleUserInteraction(() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                })}
                className={`h-2 rounded-full transition-all duration-500 ${
                  current === index ? "w-8 bg-[#1A3A2A]" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}