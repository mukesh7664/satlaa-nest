"use client";

import React, { useState, useEffect } from "react";
import { InlineEditable } from "@/components/InlineEditable";

interface EcommercePromoBannerProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    description?: string;
    endDate?: string; // ISO format
    ctaText?: string;
    ctaLink?: string;
    discountPercent?: string;
    bgGradient?: string;
    textColor?: string;
  };
}

export default function EcommercePromoBanner({ data, sectionIndex }: EcommercePromoBannerProps) {
  const {
    badge = "LIMITED TIME OFFER",
    title = "Flash Sale: Save up to 50% Off Everything!",
    description = "Don't miss our exclusive deals on top collections. Ends soon!",
    endDate = "2026-12-31T23:59:59Z",
    ctaText = "Shop The Sale",
    ctaLink = "#",
    discountPercent = "50",
    bgGradient: rawBgGradient,
    textColor: rawTextColor,
  } = data || {};

  let bgGradient = rawBgGradient;
  let textColor = rawTextColor;

  if (!bgGradient || bgGradient.includes("#dc2626") || bgGradient.includes("#991b1b")) {
    bgGradient = "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)";
  }
  if (!textColor || textColor === "#ffffff" || textColor === "#fff") {
    textColor = "#0f172a";
  }

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endDate) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(newTimeLeft);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-y border-slate-100" style={{ background: bgGradient, color: textColor }}>
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 rounded-full bg-sky-200/25 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Promo Details & Countdown */}
          <div className="flex-1 flex flex-col items-start text-left">
            {badge && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100/60 shadow-sm">
                <InlineEditable tag="span" value={badge} fieldPath="badge" sectionIndex={sectionIndex} />
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight max-w-xl text-slate-900">
              <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            {description && (
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                <InlineEditable tag="span" value={description} fieldPath="description" sectionIndex={sectionIndex} />
              </p>
            )}

            {/* Countdown Grid */}
            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/85 border border-slate-200/60 shadow-sm w-20 sm:w-24 aspect-square text-slate-800">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-500 mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {ctaText && (
              <a
                href={ctaLink}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-lg shadow-slate-900/10 cursor-pointer text-sm tracking-wide"
              >
                <InlineEditable tag="span" value={ctaText} fieldPath="ctaText" sectionIndex={sectionIndex} />
              </a>
            )}
          </div>

          {/* Graphical Promo Side */}
          {discountPercent && (
            <div className="flex-shrink-0 flex items-center justify-center relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-slate-200/40 bg-white/60 shadow-xl shadow-slate-200/50 text-slate-800">
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-slate-200" />
              <div className="text-center flex flex-col items-center relative z-10">
                <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-slate-900">
                  <InlineEditable tag="span" value={discountPercent} fieldPath="discountPercent" sectionIndex={sectionIndex} />%
                </span>
                <span className="text-xl sm:text-2xl uppercase font-black tracking-widest text-slate-800 mt-2">OFF</span>
                <span className="text-xs uppercase tracking-wider text-slate-500 mt-1 font-semibold">Storewide Sale</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
