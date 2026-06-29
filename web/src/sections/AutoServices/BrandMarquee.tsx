"use client";

import React from "react";
import { motion } from "motion/react";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface AutoServicesBrandMarqueeProps {
  sectionIndex?: number;
  data: {
    brands?: {
      name: string;
      logo: string;
    }[];
  };
}

export default function AutoServicesBrandMarquee({ data, sectionIndex }: AutoServicesBrandMarqueeProps) {
  const brands = data?.brands || [];

  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {brands.map((brand, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-6 md:h-8 flex items-center justify-center"
            >
              <InlineImageEditable 
                src={brand.logo} 
                alt={brand.name} 
                fieldPath={`brands.${i}.logo`}
                sectionIndex={sectionIndex}
                className="max-w-full max-h-full object-contain" 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
