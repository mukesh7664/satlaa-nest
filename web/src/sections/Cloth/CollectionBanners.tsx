"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface BannerItem {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  badge?: string;
}

interface ClothCollectionBannersProps {
  sectionIndex?: number;
  data: {
    items?: BannerItem[];
    gapSize?: "small" | "medium" | "large";
  };
}

export default function ClothCollectionBanners({ data, sectionIndex }: ClothCollectionBannersProps) {
  const {
    items = [],
    gapSize = "medium"
  } = data || {};

  if (!items || items.length === 0) return null;

  const gapClasses = {
    small: "gap-4",
    medium: "gap-8",
    large: "gap-12"
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-3 ${gapClasses[gapSize]}`}>
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group block relative overflow-hidden bg-gray-50 aspect-[4/5] shadow-sm"
            >
              {/* Zoom Image */}
              <InlineImageEditable
                src={item.image}
                alt={item.title}
                fill
                fieldPath={`items.${idx}.image`}
                sectionIndex={sectionIndex}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-all duration-300" />

              {/* Badge */}
              {item.badge && (
                <div className="absolute top-6 left-6 bg-white text-black text-[9px] font-bold tracking-widest uppercase px-3 py-1 shadow-sm">
                  {item.badge}
                </div>
              )}

              {/* Elegant white bottom overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white p-6 shadow-md transition-all duration-300 translate-y-2 group-hover:translate-y-0 group-hover:shadow-lg border border-transparent group-hover:border-black/5 z-[70]">
                <span className="text-[10px] font-bold text-[#8e8e8e] tracking-widest uppercase block mb-1.5">
                  <InlineEditable tag="span" value={item.subtitle || ""} fieldPath={`items.${idx}.subtitle`} sectionIndex={sectionIndex} />
                </span>
                <h3 className="text-lg font-light font-serif text-[#111111] mb-4">
                  <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${idx}.title`} sectionIndex={sectionIndex} />
                </h3>
                <a
                  href={item.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-black hover:text-[#8e8e8e] transition-colors"
                >
                  <InlineEditable tag="span" value={item.buttonText || ""} fieldPath={`items.${idx}.buttonText`} sectionIndex={sectionIndex} /> <ArrowRight size={13} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
