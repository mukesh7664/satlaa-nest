"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { usePreview } from "@/contexts/PreviewContext";

interface ClothTabbedPromoProps {
  sectionIndex?: number;
  data: {
    bannerImage?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerLink?: string;
    bannerButtonText?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    countdownDate?: string; // Format: "2026-12-31T23:59:59"
    ctaText?: string;
    ctaLink?: string;
    discountPercent?: string;
  };
}

export default function ClothTabbedPromo({ data, sectionIndex }: ClothTabbedPromoProps) {
  const {
    bannerImage = "",
    bannerTitle = "",
    bannerSubtitle = "",
    bannerLink = "",
    bannerButtonText = "Shop Now",
    title = "",
    subtitle = "",
    description = "",
    countdownDate = "",
    ctaText = "",
    ctaLink = "",
    discountPercent = ""
  } = data || {};

  const { isPreview } = usePreview();

  if (!bannerImage) return null;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const target = new Date(countdownDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [countdownDate]);

  return (
    <section className="py-16 md:py-24 bg-[#fbfbfb]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Image Banner */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden group aspect-[4/5] md:aspect-[4/3] lg:aspect-[4/5] bg-gray-100 shadow-sm"
          >
            <InlineImageEditable
              src={bannerImage}
              alt={bannerTitle}
              fill
              fieldPath="bannerImage"
              sectionIndex={sectionIndex}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Absolute Overlay & Text */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
            
            <div className="absolute bottom-10 left-10 text-white z-[70] pointer-events-none">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase mb-2 block text-gray-200 pointer-events-auto">
                <InlineEditable tag="span" value={bannerSubtitle || ""} fieldPath="bannerSubtitle" sectionIndex={sectionIndex} />
              </span>
              <h3 className="text-2xl md:text-3xl font-light font-serif tracking-wide mb-6 pointer-events-auto">
                <InlineEditable tag="span" value={bannerTitle || ""} fieldPath="bannerTitle" sectionIndex={sectionIndex} />
              </h3>
              <a
                href={bannerLink}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase pb-1 border-b border-white hover:text-gray-200 hover:border-gray-200 transition-colors pointer-events-auto"
              >
                <InlineEditable tag="span" value={bannerButtonText || "Shop Now"} fieldPath="bannerButtonText" sectionIndex={sectionIndex} /> <ArrowRight size={14} />
              </a>
            </div>

            {/* Discount Badge */}
            {(discountPercent || isPreview) && (
              <div className="absolute top-6 right-6 bg-[#111111] text-white text-xs font-semibold tracking-wider uppercase px-4 py-2 z-[70] pointer-events-auto">
                <InlineEditable tag="span" value={discountPercent || "SAVE UP TO 40%"} fieldPath="discountPercent" sectionIndex={sectionIndex} />
              </div>
            )}
          </motion.div>

          {/* Right Column: Countdown and Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center space-y-8 lg:pl-6"
          >
            <div className="space-y-4">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#8e8e8e] uppercase block">
                <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
              </span>
              <h2 className="text-3xl md:text-4xl font-light font-serif text-[#111111] tracking-tight leading-snug">
                <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              </h2>
              <div className="w-12 h-[1px] bg-black my-4" />
              <p className="text-sm md:text-base text-[#666666] font-light leading-relaxed max-w-lg">
                <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
              </p>
            </div>

            {/* Premium Minimal Countdown */}
            {!timeLeft.isExpired && (
              <div className="flex gap-4 sm:gap-6 pt-4">
                {[
                  { label: "DAYS", value: timeLeft.days },
                  { label: "HOURS", value: timeLeft.hours },
                  { label: "MINS", value: timeLeft.minutes },
                  { label: "SECS", value: timeLeft.seconds }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center bg-white border border-gray-100 w-16 h-16 sm:w-20 sm:h-20 shadow-sm"
                  >
                    <span className="text-xl sm:text-2xl font-light font-serif text-[#111111]">
                      {String(item.value).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-bold text-[#8e8e8e] tracking-widest mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {timeLeft.isExpired && (
              <div className="text-sm text-red-500 font-semibold tracking-wider uppercase">
                The exclusive event has concluded! Stay tuned for more specials.
              </div>
            )}

            <div className="pt-4">
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white hover:text-gray-100 font-semibold text-xs tracking-widest uppercase px-8 py-4 transition-all shadow-md active:scale-95"
              >
                {ctaText} <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
