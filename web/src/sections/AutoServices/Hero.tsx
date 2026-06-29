"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";

interface AutoServicesHeroProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
    discountBadge?: string;
    bgColor?: string;
  };
}

export default function AutoServicesHero({ data, sectionIndex }: AutoServicesHeroProps) {
  const {
    title = "",
    subtitle = "",
    description = "",
    image = "",
    buttonText = "",
    buttonLink = "",
    discountBadge = "",
    bgColor = ""
  } = data || {};

  if (!image) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[#8e8e8e] font-inter font-bold tracking-[0.1em] uppercase text-xs mb-4 block"
            >
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#1a1a1a] font-inter font-bold text-5xl md:text-7xl mb-6 leading-[1.1]"
            >
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#666666] font-inter text-lg mb-10 max-w-lg leading-relaxed"
            >
              <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <a
                href={buttonLink}
                className="inline-flex items-center gap-2 bg-[#0067b2] hover:bg-[#005694] text-white font-inter font-bold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
              </a>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-sm text-[#8e8e8e] font-inter"
            >
              Time remaining until the end of the campaign: <span className="text-[#1a1a1a] font-bold">The campaign is over!</span>
            </motion.p>
          </div>

          {/* Right Image with Badge */}
          <div className="relative order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative"
            >
              <InlineImageEditable 
                src={image} 
                alt="Featured Product" 
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="w-full h-auto object-contain z-10 relative"
              />
              
              {/* Circular Discount Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -top-4 right-0 md:right-8 bg-[#ff4c3b] w-24 h-24 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl z-20"
              >
                <span className="text-3xl md:text-5xl font-inter font-bold leading-none">{discountBadge}</span>
                <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-tighter opacity-80 mt-1">Total discount in the campaign</span>
              </motion.div>
            </motion.div>

            {/* Decorative background shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50 -z-0"></div>
          </div>
        </div>
      </div>

      {/* Slider Indicators (Static for now) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#0067b2]"></div>
        <div className="w-2 h-2 rounded-full bg-[#e0e0e0]"></div>
      </div>
    </section>
  );
}
