"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  designation: string;
  rating: number;
  avatar: string;
}

interface DentalTestimonialsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    items?: Testimonial[];
  };
}

export default function DentalTestimonials({ data, sectionIndex }: DentalTestimonialsProps) {
  const {
    title = "",
    subtitle = "",
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const activeItem = items[current] || items[0];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-teal-600 text-xs md:text-sm font-bold tracking-widest uppercase block mb-3">
            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        </div>

        {/* Testimonials Slider */}
        {activeItem && (
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Large quote decoration */}
              <div className="absolute top-6 left-6 text-slate-50 pointer-events-none">
                <Quote size={80} className="stroke-[1.5px]" />
              </div>

              {/* Dynamic Slides */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {/* Rating stars */}
                  <div className="flex justify-center gap-0.5 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < activeItem.rating
                            ? "fill-amber-400 stroke-amber-400"
                            : "stroke-slate-200"
                        }
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-600 text-base md:text-lg italic leading-relaxed mb-8">
                    "{activeItem.quote}"
                  </p>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-500 shadow-md mb-4 relative">
                      <InlineImageEditable
                        src={activeItem.avatar}
                        alt={activeItem.author}
                        fill
                        fieldPath={`items.${current}.avatar`}
                        sectionIndex={sectionIndex}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">
                      {activeItem.author}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
                      {activeItem.designation}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide control arrows */}
            {items.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 bg-white border border-slate-100 hover:border-teal-200 text-slate-700 hover:text-teal-600 rounded-full flex items-center justify-center shadow-md transition-all shrink-0"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 bg-white border border-slate-100 hover:border-teal-200 text-slate-700 hover:text-teal-600 rounded-full flex items-center justify-center shadow-md transition-all shrink-0"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
