"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";

interface BrandItem {
  name: string;
  logo: string;
}

interface EcommerceBrandShowcaseProps {
  sectionIndex?: number;
  data: {
    title?: string;
    bgColor?: string;
    brands?: BrandItem[];
  };
}

export default function EcommerceBrandShowcase({ data, sectionIndex }: EcommerceBrandShowcaseProps) {
  const {
    title = "As Featured In",
    bgColor = "#ffffff",
    brands = [],
  } = data || {};

  return (
    <section className="py-12 border-t border-slate-100/60" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
          </h3>
        )}

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:gap-20">
          {brands.map((brand, index) => (
            <div key={index} className="h-14 sm:h-16 flex items-center justify-center transition-all duration-300 hover:scale-105">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-full w-auto object-contain max-w-[160px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
