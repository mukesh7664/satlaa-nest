"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { InlineEditable } from "@/components/InlineEditable";

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  alignment?: "left" | "center" | "right";
  textColor?: string;
}

interface ClothHeroProps {
  data: {
    slides?: SlideData[];
    autoplaySpeed?: number;
    showControls?: boolean;
    height?: string;
  };
  sectionIndex?: number;
}

export default function ClothHero({ data, sectionIndex }: ClothHeroProps) {
  const {
    slides = [],
    autoplaySpeed = 0,
    showControls = false,
    height = ""
  } = data || {};

  if (!slides || slides.length === 0) return null;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoplaySpeed || autoplaySpeed <= 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => clearInterval(interval);
  }, [slides.length, autoplaySpeed]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[current] || slides[0];

  // Convert any height class (e.g. h-[500px]) to a minimum height class (e.g. min-h-[500px])
  // to prevent content from overflowing and getting clipped at the top/bottom on smaller screens or high zoom.
  const minHeightClass = height
    ? height.replace(/\bh-\[/g, "min-h-[").replace(/\bh-(\d+|full|screen)\b/g, "min-h-$1")
    : "min-h-[550px] md:min-h-[650px] lg:min-h-[750px]";

  return (
    <section className={`relative w-full overflow-hidden ${minHeightClass} bg-[#f5f5f5] flex items-center py-16 md:py-24`}>
      {/* Background Image Carousel with Fade Transitions */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          >
            {/* Elegant overlay to guarantee text legibility */}
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Interactive elements & Slide Text Content */}
      <div className="relative z-10 w-full container mx-auto px-4 md:px-8">
        <div
          className={`w-full max-w-xl md:max-w-3xl text-white ${
            currentSlide.alignment === "center"
              ? "mx-auto text-center"
              : currentSlide.alignment === "right"
              ? "ml-auto text-right"
              : "text-left"
          }`}
          style={{ color: currentSlide.textColor || "#ffffff" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="inline-block text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-4"
              >
                <InlineEditable 
                  tag="span" 
                  value={currentSlide.subtitle || ""} 
                  fieldPath={`slides.${current}.subtitle`} 
                  sectionIndex={sectionIndex} 
                />
              </motion.span>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
                }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.15] mb-6 font-serif"
              >
                <InlineEditable 
                  tag="span" 
                  value={currentSlide.title || ""} 
                  fieldPath={`slides.${current}.title`} 
                  sectionIndex={sectionIndex} 
                />
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-sm md:text-lg opacity-90 font-light mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed"
                style={{
                  marginLeft: currentSlide.alignment === "center" ? "auto" : undefined,
                  marginRight: currentSlide.alignment === "center" ? "auto" : undefined,
                }}
              >
                <InlineEditable 
                  tag="span" 
                  value={currentSlide.description || ""} 
                  fieldPath={`slides.${current}.description`} 
                  sectionIndex={sectionIndex} 
                />
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <a
                  href={currentSlide.buttonLink}
                  onClick={(e) => {
                    // Prevent navigation in preview
                    if (typeof window !== "undefined" && window.location.pathname === "/preview") {
                      e.preventDefault();
                    }
                  }}
                  className="inline-block bg-white hover:bg-black hover:text-white text-black font-semibold text-xs md:text-sm tracking-wider uppercase px-8 py-4 transition-all duration-300 border border-white hover:border-black rounded-none shadow-md"
                >
                  <InlineEditable 
                    tag="span" 
                    value={currentSlide.buttonText || ""} 
                    fieldPath={`slides.${current}.buttonText`} 
                    sectionIndex={sectionIndex} 
                  />
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {showControls && slides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white transition-all flex items-center justify-center rounded-full opacity-60 hover:opacity-100"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white transition-all flex items-center justify-center rounded-full opacity-60 hover:opacity-100"
          >
            <ArrowRight size={18} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  current === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
