"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { motion } from "motion/react";

interface BrandItem {
  name: string;
  logo: string;
}

interface DentalBrandsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    items?: BrandItem[];
  };
}

export default function DentalBrands({ data, sectionIndex }: DentalBrandsProps) {
  const {
    title = "",
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-slate-100 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        {title && (
          <span className="block text-center text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mb-8">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </span>
        )}

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 hover:opacity-100 transition-opacity duration-300">
          {items.map((brand, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-[#4c80fa] transition-colors shrink-0">
                {brand.name.charAt(0)}
              </div>
              <span className="font-bold text-sm text-[#222222] group-hover:text-[#4c80fa] transition-colors tracking-wide uppercase">
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
