"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface BannerData {
  title: string;
  image: string;
  bgColor: string;
  link: string;
  buttonText: string;
}

interface ShoesDualSplitBannersProps {
  data?: {
    left?: BannerData;
    right?: BannerData;
  };
}



export default function ShoesDualSplitBanners({ data, sectionIndex }: ShoesDualSplitBannersProps & { sectionIndex?: number }) {
  const left = data?.left || null;
  const right = data?.right || null;

  if (!left && !right) return null;

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
      
      {/* Left Banner: Women's mustard yellow banner */}
      {left && (
      <div className={`relative ${left?.bgColor || ""} py-20 px-8 md:px-12 flex flex-col justify-between items-center text-center overflow-hidden min-h-[350px] md:min-h-[450px] group`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center opacity-85 z-0"
        >
          <InlineImageEditable 
            src={left?.image} 
            alt={left?.title} 
            fill
            fieldPath="left.image"
            sectionIndex={sectionIndex}
            className="w-full h-full object-cover filter brightness-95 transform group-hover:scale-105 transition-transform duration-700" 
          />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-20 w-full h-full flex flex-col justify-between items-center flex-1 pointer-events-none">
          <span className="pointer-events-auto text-[10px] font-black tracking-[0.3em] text-black uppercase bg-white/90 px-4 py-1.5 rounded-full select-none mb-12">
            <InlineEditable tag="span" value={left?.title || "NEW COMFORT"} fieldPath="left.title" sectionIndex={sectionIndex} />
          </span>

          <a 
            href={left?.link || "#"}
            className="pointer-events-auto bg-white text-black hover:bg-black hover:text-white px-6 py-3 rounded-[30px] font-extrabold text-xs tracking-widest uppercase shadow-lg transition-all duration-300 flex items-center gap-3 group/btn"
          >
            <span><InlineEditable tag="span" value={left?.buttonText || ""} fieldPath="left.buttonText" sectionIndex={sectionIndex} /></span>
            <div className="w-6 h-6 rounded-full bg-slate-950 text-white group-hover/btn:bg-[#55eb0c] group-hover/btn:text-black flex items-center justify-center transition-colors">
              <ArrowRight size={12} />
            </div>
          </a>
        </div>
      </div>
      )}

      {/* Right Banner: Men's charcoal dark banner */}
      {right && (
      <div className={`relative ${right?.bgColor || ""} py-20 px-8 md:px-12 flex flex-col justify-between items-center text-center overflow-hidden min-h-[350px] md:min-h-[450px] group`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center opacity-85 z-0"
        >
          <InlineImageEditable 
            src={right?.image} 
            alt={right?.title} 
            fill
            fieldPath="right.image"
            sectionIndex={sectionIndex}
            className="w-full h-full object-cover filter brightness-75 transform group-hover:scale-105 transition-transform duration-700" 
          />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-20 w-full h-full flex flex-col justify-between items-center flex-1 pointer-events-none">
          <span className="pointer-events-auto text-[10px] font-black tracking-[0.3em] text-[#55eb0c] uppercase bg-black/80 px-4 py-1.5 rounded-full select-none mb-12 border border-white/10">
            <InlineEditable tag="span" value={right?.title || "ELITE PERFORMANCE"} fieldPath="right.title" sectionIndex={sectionIndex} />
          </span>

          <a 
            href={right?.link || "#"}
            className="pointer-events-auto bg-white text-black hover:bg-black hover:text-white px-6 py-3 rounded-[30px] font-extrabold text-xs tracking-widest uppercase shadow-lg transition-all duration-300 flex items-center gap-3 group/btn"
          >
            <span><InlineEditable tag="span" value={right?.buttonText || ""} fieldPath="right.buttonText" sectionIndex={sectionIndex} /></span>
            <div className="w-6 h-6 rounded-full bg-slate-950 text-white group-hover/btn:bg-[#55eb0c] group-hover/btn:text-black flex items-center justify-center transition-colors">
              <ArrowRight size={12} />
            </div>
          </a>
        </div>
      </div>
      )}

    </section>
  );
}
