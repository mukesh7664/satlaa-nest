"use client";

import React from "react";
import { motion } from "motion/react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface AutoServicesCategoryGridProps {
  data: {
    categories?: {
      name: string;
      image: string;
      count: string;
      link?: string;
    }[];
  };
  sectionIndex?: number;
}

export default function AutoServicesCategoryGrid({ data, sectionIndex }: AutoServicesCategoryGridProps) {
  const categories = data?.categories || [];

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.a
              key={index}
              href={cat.link || "#"}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col items-center bg-[#f3f4f6] rounded-[10px] p-6 transition-all hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center"
            >
              <div className="mb-6 relative h-24 w-full flex items-center justify-center">
                <InlineImageEditable 
                  src={cat.image} 
                  alt={cat.name}
                  fieldPath={`categories.${index}.image`}
                  sectionIndex={sectionIndex}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="font-inter font-bold text-[#1a1a1a] text-sm mb-1 group-hover:text-[#0067b2] transition-colors">
                <InlineEditable tag="span" value={cat.name || ""} fieldPath={`categories.${index}.name`} sectionIndex={sectionIndex} />
              </h3>
              <span className="text-[#8e8e8e] font-inter text-xs font-bold uppercase tracking-widest">
                <InlineEditable tag="span" value={cat.count || ""} fieldPath={`categories.${index}.count`} sectionIndex={sectionIndex} />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
