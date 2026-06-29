"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface SlideData {
  subtitle: string;
  title: string;
  description: string;
  bgBackdrop: string;
  shoeImage: string;
  buttonText: string;
}

interface ShoesHeroSliderProps {
  data?: {
    slides?: SlideData[];
  };
  sectionIndex?: number;
}


export default function ShoesHeroSlider({ data, sectionIndex }: ShoesHeroSliderProps) {
  const slides = data?.slides || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <section className="w-full relative overflow-hidden bg-white border-b border-slate-100 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center">
      
      {/* Background Graphic Shoes Outline silhouette */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] flex items-center justify-center select-none">
        <span className="text-[15rem] md:text-[30rem] font-black uppercase tracking-tighter text-black">
          SHOES
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full z-10 py-12"
        >
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm font-extrabold tracking-[0.3em] text-[#55eb0c] bg-black px-3 py-1 rounded-full uppercase mb-4"
            >
              <InlineEditable tag="span" value={slides[current].subtitle || ""} fieldPath={`slides.${current}.subtitle`} sectionIndex={sectionIndex} />
            </motion.span>
            
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-black uppercase tracking-tight font-sans leading-none mb-6"
            >
              <InlineEditable tag="span" value={slides[current].title || ""} fieldPath={`slides.${current}.title`} sectionIndex={sectionIndex} />
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 font-semibold text-sm md:text-base mb-8 max-w-md"
            >
              <InlineEditable tag="span" value={slides[current].description || ""} fieldPath={`slides.${current}.description`} sectionIndex={sectionIndex} />
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="/shop"
                className="bg-[#55eb0c] hover:bg-black hover:text-[#55eb0c] text-black font-extrabold tracking-widest text-xs uppercase px-10 py-4 rounded-[30px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block text-center"
              >
                <InlineEditable tag="span" value={slides[current].buttonText || ""} fieldPath={`slides.${current}.buttonText`} sectionIndex={sectionIndex} />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Shoes Floating Block */}
          <div className="flex items-center justify-center relative w-full h-[350px] md:h-[450px]">
            <motion.div
              initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
              className={`w-full max-w-[400px] h-full max-h-[400px] rounded-full absolute ${slides[current].bgBackdrop} opacity-70 blur-3xl z-0`}
            />

            <motion.div
              initial={{ scale: 0.6, rotate: -25, y: 50, opacity: 0 }}
              animate={{ scale: 1, rotate: -10, y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.4, 
                type: "spring", 
                stiffness: 90,
                y: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
              className="relative w-full max-w-[480px] z-10 filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.15)] transform select-none"
            >
              <InlineImageEditable 
                src={slides[current].shoeImage}
                alt={slides[current].title}
                fieldPath={`slides.${current}.shoeImage`}
                sectionIndex={sectionIndex}
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Slide Controllers */}
      <div className="absolute bottom-8 left-4 md:left-8 flex items-center gap-4 z-20">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full border border-slate-200 hover:border-black hover:bg-black hover:text-[#55eb0c] text-slate-800 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full border border-slate-200 hover:border-black hover:bg-black hover:text-[#55eb0c] text-slate-800 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Pagination text indicator (03 --- 01 style) */}
      <div className="absolute bottom-8 right-4 md:right-8 z-20 flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
        <span className="text-black font-extrabold">{`0${current + 1}`}</span>
        <span className="w-12 h-[1px] bg-slate-200 relative">
          <span 
            className="absolute left-0 top-0 h-full bg-black transition-all duration-600" 
            style={{ width: `${((current + 1) / slides.length) * 100}%` }}
          />
        </span>
        <span>{`0${slides.length}`}</span>
      </div>

    </section>
  );
}
