"use client";

import React from "react";
import { motion } from "motion/react";
import { InlineEditable } from "@/components/InlineEditable";

interface BrandItem {
  name: string;
}

interface ShoesBrandCarouselProps {
  data?: {
    brands?: BrandItem[];
  };
  sectionIndex?: number;
}


export default function ShoesBrandCarousel({ data, sectionIndex }: ShoesBrandCarouselProps) {
  const brands = data?.brands || [];

  return (
    <section className="w-full bg-white py-12 border-b border-slate-100 flex flex-col items-center">
      
      {/* Centered Scroll Down Mouse Indicator */}
      <div className="flex flex-col items-center gap-2 mb-8 select-none">
        <div className="w-6 h-10 rounded-full border-2 border-slate-300 p-1 flex justify-center">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
          />
        </div>
        <span className="text-[9px] font-black text-slate-400 tracking-[0.25em] uppercase">
          SCROLL DOWN
        </span>
      </div>

      {/* Infinite scrolling Row of monochrome brands */}
      <div className="w-full overflow-hidden relative">
        <div className="flex items-center justify-around gap-8 md:gap-12 flex-wrap max-w-6xl mx-auto px-4">
          {brands.map((brand, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="py-2 px-4 select-none cursor-pointer filter hover:brightness-0 transition-all duration-300 shrink-0"
            >
              <span className="text-sm md:text-base font-black tracking-[0.2em] text-slate-300 uppercase font-sans">
                <InlineEditable tag="span" value={brand.name || ""} fieldPath={`brands.${i}.name`} sectionIndex={sectionIndex} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
