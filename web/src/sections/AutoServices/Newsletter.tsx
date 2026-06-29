"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { motion } from "motion/react";

interface AutoServicesNewsletterProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    discount?: string;
    couponCode?: string;
  };
}

export default function AutoServicesNewsletter({ data, sectionIndex }: AutoServicesNewsletterProps) {
  const {
    title = "",
    description = "",
    discount = "",
    couponCode = ""
  } = data || {};

  if (!discount) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative bg-[#fff0ef] rounded-[15px] overflow-hidden p-8 md:p-12 border border-[#ffe0df]">
          {/* Background Decorative Text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
            <span className="text-[200px] font-black font-inter tracking-tighter text-[#ff4c3b]">% % % %</span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="text-[#ff4c3b] font-inter font-bold text-5xl md:text-7xl leading-none">
                {discount}
              </div>
              <div>
                <h3 className="text-[#ff4c3b] font-inter font-bold text-xl md:text-2xl mb-1">
                  <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                </h3>
                <p className="text-[#ff4c3b]/60 font-inter text-sm font-medium italic">
                  <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-dashed border-[#ff4c3b]/30 px-8 py-3 rounded-md text-[#ff4c3b] font-inter font-bold tracking-[0.2em] text-lg mb-2 shadow-sm">
                {couponCode}
              </div>
              <span className="text-[10px] text-[#ff4c3b]/40 font-bold uppercase tracking-widest">Click to copy code</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
