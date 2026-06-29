"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  name: string;
  image: string;
  slug: string;
}

interface EcommerceCategoriesGridProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    subtitle?: string;
    bgColor?: string;
    categories?: CategoryItem[];
  };
}

export default function EcommerceCategoriesGrid({ data, sectionIndex }: EcommerceCategoriesGridProps) {
  const {
    badge = "DISCOVER NEW STYLES",
    title = "Shop by Product Category",
    subtitle = "Find exactly what you need sorted by our curated collections.",
    bgColor = "#f8fafc",
    categories = [],
  } = data || {};

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" style={{ color: "#0f172a" }}>
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-600 mb-4 border border-red-100">
              <InlineEditable tag="span" value={badge} fieldPath="badge" sectionIndex={sectionIndex} />
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg opacity-85 leading-relaxed">
              <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, index) => (
            <a
              key={index}
              href={`/collections/${cat.slug}`}
              className="group relative flex flex-col justify-end aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-900 border border-slate-100"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

              {/* Text content overlay */}
              <div className="relative z-20 p-6 flex items-center justify-between text-white w-full">
                <div className="text-left">
                  <h3 className="text-xl font-bold tracking-tight mb-1">
                    <InlineEditable tag="span" value={cat.name} fieldPath={`categories.${index}.name`} sectionIndex={sectionIndex} />
                  </h3>
                  <span className="text-xs uppercase font-semibold opacity-75 tracking-wider">Browse Collection</span>
                </div>
                <div className="p-3 bg-white/10 group-hover:bg-white text-white group-hover:text-slate-900 rounded-full backdrop-blur-sm transition-colors duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
