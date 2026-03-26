"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import FadeUp from "@/components/FadeUp";

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Our standard delivery timeline is 3-5 business days across India. Once your order is shipped, you will receive a tracking link via SMS and Email.",
  },
  {
    question: "Is your makhana 100% natural?",
    answer: "Absolutely. We source our makhana directly from the fertile lakes of Bihar. It is roasted to perfection without any artificial preservatives, additives, or MSG.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes, we offer Cash on Delivery (COD) on all orders. You can also opt for secure online payments via UPI, Credit/Debit cards, or Net Banking.",
  },
  {
    question: "How should I store the makhana?",
    answer: "To maintain the crunch and freshness, we recommend storing the makhana in an airtight container in a cool, dry place away from direct sunlight.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-[#FDFBF7]">
      {/* Max-width ko 3xl se badhakar 5xl (1024px) kar diya hai */}
      <div className="max-w-5xl mx-auto">
        
        <FadeUp>
          <h2 className="text-3xl md:text-5xl font-light text-center text-[#1A3A2A] mb-20 tracking-tight">
            Frequently Asked Questions
          </h2>
        </FadeUp>

        <div className="divide-y divide-gray-200">
          {faqs.map((item, index) => {
            const isOpen = open === index;

            return (
              <FadeUp key={index} delay={index * 0.1}>
                <div 
                  className={`group transition-all duration-300 ${
                    isOpen ? "bg-white/40 px-4 md:px-8 rounded-2xl" : "px-0"
                  }`}
                >
                  <button
                    className="w-full flex justify-between items-center py-8 text-left outline-none"
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className={`text-xl md:text-2xl font-medium transition-colors duration-300 pr-8 ${
                      isOpen ? "text-[#1A3A2A]" : "text-gray-700 group-hover:text-[#1A3A2A]"
                    }`}>
                      {item.question}
                    </span>
                    
                    <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500 ${
                      isOpen 
                        ? "bg-[#1A3A2A] border-[#1A3A2A] text-white rotate-180 shadow-lg" 
                        : "bg-transparent border-gray-300 text-gray-400 group-hover:border-[#1A3A2A] group-hover:text-[#1A3A2A]"
                    }`}>
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <p className="pb-8 text-gray-600 leading-relaxed font-light text-lg md:text-xl max-w-4xl">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}