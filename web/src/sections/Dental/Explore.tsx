"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  title: string;
  image: string;
  link: string;
  count?: string;
  iconBgColor?: string;
}

interface DentalExploreProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    items?: CategoryItem[];
  };
}

export default function DentalExplore({ data, sectionIndex }: DentalExploreProps) {
  const {
    title = "",
    subtitle = "",
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-white font-sans">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-[#4c80fa] text-xs md:text-sm font-bold tracking-widest uppercase block mb-2">
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </span>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#222222] tracking-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
            >
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
          </div>
          <a
            href="/shop"
            className="flex items-center gap-2 text-[#4c80fa] hover:text-blue-600 font-bold text-sm tracking-wide group transition-colors shrink-0"
          >
            Explore All Categories
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group block relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Category Image Cover */}
              <div className="relative h-56 overflow-hidden">
                <InlineImageEditable
                  src={item.image}
                  alt={item.title}
                  fill
                  fieldPath={`items.${index}.image`}
                  sectionIndex={sectionIndex}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                
                {/* Count Badge */}
                {item.count && (
                  <span className="absolute top-4 right-4 bg-[#4c80fa] text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                    {item.count}
                  </span>
                )}
              </div>

              {/* Title & Redirection Block */}
              <div className="p-5 flex justify-between items-center bg-white border-t border-slate-50">
                <div>
                  <h3 className="font-bold text-[#222222] text-base group-hover:text-[#4c80fa] transition-colors">
                    <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${index}.title`} sectionIndex={sectionIndex} />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Shop Collection</p>
                </div>
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-[#4c80fa] text-slate-600 group-hover:text-white flex items-center justify-center rounded-full transition-all shrink-0">
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
