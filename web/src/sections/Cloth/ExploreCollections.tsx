"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";

interface CollectionItem {
  title: string;
  image: string;
  link: string;
  count?: string;
}

interface ClothExploreCollectionsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    items?: CollectionItem[];
  };
}

export default function ClothExploreCollections({ data, sectionIndex }: ClothExploreCollectionsProps) {
  const {
    title = "",
    subtitle = "",
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#8e8e8e] uppercase block mb-3">
            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight font-serif text-[#111111]">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          <div className="w-12 h-[1px] bg-black mx-auto mt-4" />
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.link}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group block relative overflow-hidden bg-[#f9f9f9]"
            >
              {/* Product Category Image Container */}
              <div className="aspect-[3/4] w-full overflow-hidden relative">
                <InlineImageEditable
                  src={item.image}
                  alt={item.title}
                  fill
                  fieldPath={`items.${idx}.image`}
                  sectionIndex={sectionIndex}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Bottom Label Content */}
              <div className="p-5 text-center bg-white border border-t-0 border-gray-100 relative z-10 transition-all duration-300 group-hover:border-black/10">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#111111] mb-1 font-serif group-hover:text-black transition-colors">
                  <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${idx}.title`} sectionIndex={sectionIndex} />
                </h3>
                {item.count && (
                  <p className="text-[11px] text-[#8e8e8e] tracking-widest uppercase">
                    {item.count}
                  </p>
                )}
                
                {/* Micro animation line */}
                <div className="h-[1px] bg-black w-0 group-hover:w-16 transition-all duration-300 mx-auto mt-3" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
