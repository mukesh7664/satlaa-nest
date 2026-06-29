"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";

interface AutoServicesPromotionBannerProps {
  sectionIndex?: number;
  data: {
    banners?: {
      title: string;
      subtitle: string;
      description: string;
      image: string;
      buttonText: string;
      link: string;
    }[];
  };
}

export default function AutoServicesPromotionBanner({ data, sectionIndex }: AutoServicesPromotionBannerProps) {
  const {
    banners = []
  } = data || {};

  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-[15px] group bg-[#f3f4f6]"
            >
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-full sm:w-1/2 p-10 z-10">
                  <span className="text-[#8e8e8e] font-inter font-bold tracking-[0.1em] uppercase text-[10px] mb-4 block">
                    <InlineEditable tag="span" value={banner.subtitle || ""} fieldPath={`banners.${index}.subtitle`} sectionIndex={sectionIndex} />
                  </span>
                  <h3 className="text-[#1a1a1a] font-inter font-bold text-3xl mb-3 leading-tight group-hover:text-[#0067b2] transition-colors">
                    <InlineEditable tag="span" value={banner.title || ""} fieldPath={`banners.${index}.title`} sectionIndex={sectionIndex} />
                  </h3>
                  <p className="text-[#8e8e8e] font-inter text-sm mb-8">
                    <InlineEditable tag="span" value={banner.description || ""} fieldPath={`banners.${index}.description`} sectionIndex={sectionIndex} />
                  </p>
                  <a
                    href={banner.link}
                    className="inline-block bg-white hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] font-inter font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm"
                  >
                    <InlineEditable tag="span" value={banner.buttonText || ""} fieldPath={`banners.${index}.buttonText`} sectionIndex={sectionIndex} />
                  </a>
                </div>
                <div className="w-full sm:w-1/2 relative h-[250px] sm:h-[350px]">
                  <InlineImageEditable 
                    src={banner.image} 
                    alt={banner.title}
                    fieldPath={`banners.${index}.image`}
                    sectionIndex={sectionIndex}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
