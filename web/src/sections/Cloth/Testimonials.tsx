"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  rating: number;
  image?: string;
}

interface ClothTestimonialsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    testimonials?: Testimonial[];
    bgColor?: string;
  };
}

export default function ClothTestimonials({ data, sectionIndex }: ClothTestimonialsProps) {
  const {
    title = "",
    subtitle = "",
    testimonials = [],
    bgColor = ""
  } = data || {};

  if (!testimonials || testimonials.length === 0) return null;

  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[current] || testimonials[0];

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#8e8e8e] uppercase block mb-3">
            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-3xl font-light font-serif text-[#111111] tracking-tight">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          <div className="w-12 h-[1px] bg-black mx-auto mt-4" />
        </div>

        {/* Carousel Content */}
        <div className="relative bg-[#fcfcfc] border border-gray-100 p-8 md:p-16 shadow-sm text-center">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-[0.03] text-black">
            <Quote size={80} className="fill-current" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Star Rating */}
              <div className="flex gap-1.5 justify-center">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-black text-black" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base md:text-xl font-light font-serif text-[#333333] leading-relaxed italic max-w-2xl">
                "{currentTestimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {currentTestimonial.image && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shrink-0">
                    <InlineImageEditable
                      src={currentTestimonial.image}
                      alt={currentTestimonial.author}
                      fill
                      fieldPath={`testimonials.${current}.image`}
                      sectionIndex={sectionIndex}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[#111111] tracking-wider uppercase">
                    {currentTestimonial.author}
                  </h4>
                  {currentTestimonial.role && (
                    <span className="text-[10px] text-[#8e8e8e] tracking-widest uppercase">
                      {currentTestimonial.role}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
