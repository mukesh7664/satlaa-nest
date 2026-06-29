"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SportHeroProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    content?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
  };
}

const SportHero: React.FC<SportHeroProps> = ({ data, sectionIndex }) => {
  if (!data?.title) return null;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#101010]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 opacity-40 grayscale-[50%]">
        <InlineImageEditable
          src={data.backgroundImage || ""}
          alt="Hero Background"
          fill
          fieldPath="backgroundImage"
          sectionIndex={sectionIndex}
          className="object-cover"
        />
      </div>
      
      <div className="container mx-auto px-6 relative z-10 py-24 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl pointer-events-auto"
        >
           {data.subtitle && (
            <span className="text-[#f4fb30] font-bold tracking-widest text-sm uppercase mb-6 block border-l-4 border-[#f4fb30] pl-4">
              <InlineEditable tag="span" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </span>
          )}
          
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
            <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            <InlineEditable tag="span" value={data.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
          </p>
          
          <div className="flex flex-wrap gap-6">
            <Link 
              href={data.primaryCtaLink || "#"}
              className="px-10 py-5 bg-[#f4fb30] text-black font-black uppercase tracking-tighter text-lg hover:bg-white transition-all duration-300 transform hover:-translate-y-1 block"
            >
              <InlineEditable tag="span" value={data.primaryCtaText || ""} fieldPath="primaryCtaText" sectionIndex={sectionIndex} />
            </Link>
            
            <Link 
              href={data.secondaryCtaLink || "#"}
              className="px-10 py-5 border-2 border-white/20 text-white font-black uppercase tracking-tighter text-lg hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 block"
            >
              <InlineEditable tag="span" value={data.secondaryCtaText || ""} fieldPath="secondaryCtaText" sectionIndex={sectionIndex} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute left-10 bottom-0 top-0 w-px bg-white/10 hidden xl:block" />
    </section>
  );
};

export default SportHero;
