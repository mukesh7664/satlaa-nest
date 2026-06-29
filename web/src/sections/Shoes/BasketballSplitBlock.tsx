"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface ShoesBasketballSplitBlockProps {
  sectionIndex?: number;
  data?: {
    subtitle?: string;
    title?: string;
    description?: string;
    image?: string;
    link?: string;
    buttonText?: string;
    rightSubtitle?: string;
    rightDescription?: string;
  };
}

export default function ShoesBasketballSplitBlock({ data, sectionIndex }: ShoesBasketballSplitBlockProps) {
  const {
    subtitle = "",
    title = "",
    description = "",
    image = "",
    link = "",
    buttonText = "",
    rightSubtitle = "COURT EXPLORERS",
    rightDescription = "Engineered side wings for maximum lateral containment."
  } = data || {};

  if (!image) return null;

  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-white border-b border-slate-100">
      
      {/* Left Side: content panel on light grey block */}
      <div className="bg-[#f2f5fa] p-8 md:p-16 lg:p-24 flex flex-col justify-center items-start text-left min-h-[380px] md:min-h-[480px] lg:min-h-[580px] order-2 lg:order-1">
        <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 bg-white border border-slate-200/50 px-3.5 py-1.5 rounded-full uppercase mb-6 inline-block">
          <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
        </span>
        
        <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight font-sans leading-none mb-6">
          <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
        </h2>

        <p className="text-slate-600 font-semibold text-sm md:text-base leading-relaxed mb-8 max-w-md">
          <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
        </p>

        <a 
          href={link}
          className="bg-black hover:bg-[#55eb0c] hover:text-black text-white px-8 py-3.5 rounded-[30px] font-extrabold text-xs tracking-widest uppercase shadow-lg transition-all duration-300 flex items-center gap-3 group"
        >
          <span><InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} /></span>
          <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-black text-white flex items-center justify-center transition-colors">
            <ArrowRight size={10} />
          </div>
        </a>
      </div>

      {/* Right Side: Cyber blue/red action photo */}
      <div className="relative min-h-[380px] md:min-h-[480px] lg:min-h-[580px] overflow-hidden group order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/30 to-red-900/10 z-10 blend-multiply pointer-events-none" />
        <InlineImageEditable 
          src={image} 
          alt={subtitle} 
          fill
          fieldPath="image"
          sectionIndex={sectionIndex}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 select-none z-0" 
        />
        {/* Subtle Cyber Neon Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[70] flex flex-col justify-end p-8 md:p-12 pointer-events-none">
          <span className="pointer-events-auto text-[10px] font-black tracking-[0.3em] text-[#55eb0c] uppercase">
            <InlineEditable tag="span" value={rightSubtitle} fieldPath="rightSubtitle" sectionIndex={sectionIndex} />
          </span>
          <span className="pointer-events-auto text-white font-extrabold text-sm md:text-base max-w-sm mt-2 opacity-95">
            <InlineEditable tag="span" value={rightDescription} fieldPath="rightDescription" sectionIndex={sectionIndex} />
          </span>
        </div>
      </div>

    </section>
  );
}
