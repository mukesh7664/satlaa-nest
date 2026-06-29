"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { motion } from "framer-motion";

interface LandingHeroProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    bgType?: "color" | "gradient" | "image";
    bgColor?: string;
    bgGradient?: string;
    imageUrl?: string;
    textColor?: string;
    trustCount?: string;
    trustText?: string;
  };
}

export default function LandingHero({ data, sectionIndex }: LandingHeroProps) {
  const {
    badge = "INTRODUCING OUR PLATFORM",
    title = "Build Your Dynamic Landing Pages Instantly",
    subtitle = "No coding required. Elevate your presence with stunning pre-designed blocks.",
    ctaText = "Get Started Now",
    ctaLink = "#",
    secondaryCtaText = "Learn More",
    secondaryCtaLink = "#",
    bgType = "gradient",
    bgColor = "#0f172a",
    bgGradient = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    imageUrl = "",
    textColor = "#ffffff",
    trustCount = "12,000+",
    trustText = "Happy subscribers globally",
  } = data || {};

  const sectionStyle: React.CSSProperties = {
    color: textColor,
  };

  if (bgType === "color") {
    sectionStyle.backgroundColor = bgColor;
  } else if (bgType === "gradient") {
    sectionStyle.background = bgGradient;
  } else if (bgType === "image" && imageUrl) {
    sectionStyle.backgroundImage = `url('${imageUrl}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  return (
    <section className="relative overflow-hidden py-20 lg:py-32 flex items-center min-h-[600px]" style={sectionStyle}>
      {/* Background Overlay if image */}
      {bgType === "image" && (
        <div className="absolute inset-0 bg-slate-900/60 z-0" />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/20 text-blue-400 mb-6 border border-blue-500/30">
                <InlineEditable tag="span" value={badge} fieldPath="badge" sectionIndex={sectionIndex} />
              </span>
            )}
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
            </h1>

            <p className="text-lg sm:text-xl opacity-80 mb-8 max-w-2xl leading-relaxed">
              <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              {ctaText && (
                <a
                  href={ctaLink}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
                >
                  <InlineEditable tag="span" value={ctaText} fieldPath="ctaText" sectionIndex={sectionIndex} />
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink}
                  className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-medium rounded-lg transition-colors duration-200"
                >
                  <InlineEditable tag="span" value={secondaryCtaText} fieldPath="secondaryCtaText" sectionIndex={sectionIndex} />
                </a>
              )}
            </div>

            {/* Trust Badging */}
            {(trustCount || trustText) && (
              <div className="flex items-center gap-4 pt-6 border-t border-slate-700/50 w-full lg:w-auto">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold"
                    >
                      U{i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1">
                    <span>★ ★ ★ ★ ★</span>
                    <span className="ml-1"><InlineEditable tag="span" value={trustCount} fieldPath="trustCount" sectionIndex={sectionIndex} /></span>
                  </div>
                  <div className="text-xs opacity-70">
                    <InlineEditable tag="span" value={trustText} fieldPath="trustText" sectionIndex={sectionIndex} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image/Visual Right Column */}
          {imageUrl && bgType !== "image" && (
            <div className="lg:col-span-5 relative w-full aspect-square max-w-[450px] mx-auto">
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl bg-slate-950">
                <InlineImageEditable
                  src={imageUrl}
                  alt="Hero Preview"
                  width={600}
                  height={600}
                  fieldPath="imageUrl"
                  sectionIndex={sectionIndex}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
