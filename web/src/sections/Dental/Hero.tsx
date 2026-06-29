"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
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
  badge?: string;
}

interface CategoryColumn {
  title: string;
  links: { name: string; url: string }[];
}

interface DentalHeroProps {
  data: {
    slides?: SlideData[];
    autoplaySpeed?: number;
    showControls?: boolean;
    height?: string;
    categories?: CategoryColumn[];
  };
  sectionIndex?: number;
}

export default function DentalHero({ data, sectionIndex }: DentalHeroProps) {
  const {
    slides = [],
    autoplaySpeed = 0,
    showControls = false,
    height = "",
    categories = []
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

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 flex flex-col font-sans">
      {/* Slide Container */}
      <div className={`relative w-full ${height} overflow-hidden`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          >
            {/* Soft gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full container mx-auto px-4 md:px-8 flex items-center">
          <div
            className={`w-full max-w-xl md:max-w-2xl text-[#222222] ${
              currentSlide.alignment === "center"
                ? "mx-auto text-center"
                : currentSlide.alignment === "right"
                ? "ml-auto text-right"
                : "text-left"
            }`}
            style={{ color: currentSlide.textColor || "#222222" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
              >
                {currentSlide.badge && (
                  <motion.span
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="inline-block bg-teal-500 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase mb-4"
                  >
                    <InlineEditable tag="span" value={currentSlide.badge || ""} fieldPath={`slides.${current}.badge`} sectionIndex={sectionIndex} />
                  </motion.span>
                )}

                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="block text-xs font-extrabold tracking-[0.2em] text-teal-600 uppercase mb-3"
                >
                  <InlineEditable tag="span" value={currentSlide.subtitle || ""} fieldPath={`slides.${current}.subtitle`} sectionIndex={sectionIndex} />
                </motion.span>

                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 85 } }
                  }}
                  className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5 font-sans"
                  style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
                >
                  <InlineEditable tag="span" value={currentSlide.title || ""} fieldPath={`slides.${current}.title`} sectionIndex={sectionIndex} />
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="text-sm md:text-base text-slate-500 font-normal mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed"
                  style={{
                    marginLeft: currentSlide.alignment === "center" ? "auto" : undefined,
                    marginRight: currentSlide.alignment === "center" ? "auto" : undefined,
                  }}
                >
                  <InlineEditable tag="span" value={currentSlide.description || ""} fieldPath={`slides.${current}.description`} sectionIndex={sectionIndex} />
                </motion.p>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                >
                  <a
                    href={currentSlide.buttonLink}
                    className="inline-block bg-[#4c80fa] hover:bg-blue-600 text-white font-bold text-sm tracking-wide px-9 py-3.5 transition-all duration-300 rounded-[30px] shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    <InlineEditable tag="span" value={currentSlide.buttonText || ""} fieldPath={`slides.${current}.buttonText`} sectionIndex={sectionIndex} />
                  </a>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Side Controls */}
        {showControls && slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white hover:bg-[#4c80fa] text-slate-800 hover:text-white transition-all flex items-center justify-center rounded-full shadow-md border border-slate-100"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white hover:bg-[#4c80fa] text-slate-800 hover:text-white transition-all flex items-center justify-center rounded-full shadow-md border border-slate-100"
            >
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Category Lineup (6 Columns under slider) */}
      <div className="bg-white border-b border-slate-100 py-16 relative z-10">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((col, i) => (
            <div key={i} className="flex flex-col">
              <h4 className="font-extrabold text-[#222222] text-xs tracking-widest uppercase mb-4 pb-2 border-b border-slate-100">
                <InlineEditable tag="span" value={col.title || ""} fieldPath={`categories.${i}.title`} sectionIndex={sectionIndex} />
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.url}
                      className="text-slate-500 hover:text-[#4c80fa] text-sm font-medium transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#4c80fa]" />
                      <span><InlineEditable tag="span" value={link.name || ""} fieldPath={`categories.${i}.links.${j}.name`} sectionIndex={sectionIndex} /></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
