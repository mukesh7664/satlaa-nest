"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface PromoItem {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  badge?: string;
}

interface DentalPromoBannersProps {
  data: {
    items?: PromoItem[];
  };
  sectionIndex?: number;
}

export default function DentalPromoBanners({ data, sectionIndex }: DentalPromoBannersProps) {
  const {
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  const leftBanner = items[0];
  const rightBanner = items[1];

  return (
    <section className="py-12 bg-white font-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
          
          {/* Left Banner: Blue Theme Solid */}
          {leftBanner && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group overflow-hidden rounded-[20px] bg-gradient-to-r from-[#4c80fa] to-[#3b6ecc] shadow-sm hover:shadow-lg transition-all duration-300 min-h-[370px] flex items-center p-10 md:p-12"
            >
              {/* Abstract subtle teeth line-art overlay background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
              
              <div className="relative z-10 w-full max-w-sm text-white">
                <span className="block text-xs font-extrabold tracking-[0.2em] text-blue-100 uppercase mb-3">
                  <InlineEditable tag="span" value={leftBanner.subtitle || ""} fieldPath="items.0.subtitle" sectionIndex={sectionIndex} />
                </span>
                <h3 
                  className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight mb-8"
                  style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
                >
                  <InlineEditable tag="span" value={leftBanner.title || ""} fieldPath="items.0.title" sectionIndex={sectionIndex} />
                </h3>
                <a
                  href={leftBanner.link}
                  className="inline-block bg-white hover:bg-slate-100 text-[#222222] font-semibold text-sm px-[35px] py-[13px] rounded-[30px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <InlineEditable tag="span" value={leftBanner.buttonText || ""} fieldPath="items.0.buttonText" sectionIndex={sectionIndex} />
                </a>
              </div>
            </motion.div>
          )}

          {/* Right Banner: Light Grey Image Theme */}
          {rightBanner && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative group overflow-hidden rounded-[20px] bg-[#eff1f5] border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 min-h-[370px] flex items-center p-10 md:p-12"
            >
              {/* Grey/White Lifestyle Image Background */}
              <InlineImageEditable
                src={rightBanner.image}
                alt="Promo banner"
                fill
                fieldPath="items.1.image"
                sectionIndex={sectionIndex}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103 opacity-35 mix-blend-multiply z-0"
              />

              <div className="relative z-[70] w-full max-w-sm text-[#222222] pointer-events-none">
                <span className="block text-xs font-extrabold tracking-[0.2em] text-[#4c80fa] uppercase mb-3 pointer-events-auto">
                  <InlineEditable tag="span" value={rightBanner.subtitle || ""} fieldPath="items.1.subtitle" sectionIndex={sectionIndex} />
                </span>
                <h3 
                  className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight mb-8 pointer-events-auto"
                  style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
                >
                  <InlineEditable tag="span" value={rightBanner.title || ""} fieldPath="items.1.title" sectionIndex={sectionIndex} />
                </h3>
                <a
                  href={rightBanner.link}
                  className="inline-block bg-[#4c80fa] hover:bg-blue-600 text-white font-semibold text-sm px-[35px] py-[13px] rounded-[30px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 pointer-events-auto"
                >
                  <InlineEditable tag="span" value={rightBanner.buttonText || ""} fieldPath="items.1.buttonText" sectionIndex={sectionIndex} />
                </a>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
