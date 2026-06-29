"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";

interface DentalMostPurchasedProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    productName?: string;
    productDescription?: string;
    price?: string;
    originalPrice?: string;
    image?: string;
    link?: string;
    countdownDate?: string;
    specs?: string[];
  };
}

export default function DentalMostPurchased({ data, sectionIndex }: DentalMostPurchasedProps) {
  const {
    title = "",
    subtitle = "",
    productName = "",
    productDescription = "",
    price = "",
    originalPrice = "",
    image = "",
    link = "",
    countdownDate = "",
    specs = []
  } = data || {};

  if (!image) return null;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(countdownDate).getTime();
    if (isNaN(target)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDate]);

  return (
    <section 
      className="py-20 bg-cover bg-center relative"
      style={{ 
        backgroundImage: 'url("https://www.devsnews.com/template/stepmeds/stepmeds/images/bg/purchased-item-bg.jpg")',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Subtle screen overlay for better readability */}
      <div className="absolute inset-0 bg-white/90" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[30px] items-stretch">
          
          {/* Left Column: Visual Highlight Banner */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[350px] lg:min-h-full flex items-center p-8 bg-slate-900 shadow-md">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url("https://images.unsplash.com/photo-1579684389782-64d84b5e902a?q=80&w=800&auto=format&fit=crop")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent" />
            
            <div className="relative z-10 text-white mt-auto">
              <span className="inline-block bg-[#e4573d] text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase mb-4 shadow-sm">
                EXCLUSIVE WHOLESALE DEAL
              </span>
              <h4 
                className="text-2xl sm:text-3xl font-medium leading-snug mb-3"
                style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
              >
                Upgrading Your Dental Clinic Has Never Been Easier
              </h4>
              <p className="text-xs text-slate-300">
                FDA compliant equipment with verified 3-year warranties.
              </p>
            </div>
          </div>

          {/* Right Column: Spotlight Deal Details & Countdown Cards */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-8 md:p-12 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="block text-xs font-extrabold tracking-[0.2em] text-[#4c80fa] uppercase mb-2">
                    <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                  </span>
                  <h3 
                    className="text-2xl sm:text-3xl font-medium text-[#222222] tracking-tight leading-tight"
                    style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
                  >
                    <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                  </h3>
                </div>
                <span className="bg-[#e4573d] text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                  SAVE $551
                </span>
              </div>

              {/* Product Showroom */}
              <div className="flex flex-col md:flex-row gap-8 items-center py-6 border-y border-slate-100 mb-8">
                <div className="relative w-full md:w-48 aspect-square bg-[#f8fafc] rounded-xl flex items-center justify-center p-4 shrink-0 overflow-hidden group">
                  <InlineImageEditable
                    src={image}
                    alt={productName}
                    fill
                    fieldPath="image"
                    sectionIndex={sectionIndex}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                  />

                  {/* StepMeds Countdown timer bottom overlay inside image */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-700">
                    <div className="text-center flex-1">
                      <span className="block text-xs font-black text-[#e4573d] leading-none">{timeLeft.days}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest">Days</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="text-center flex-1">
                      <span className="block text-xs font-black text-slate-800 leading-none">{timeLeft.hours}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest">Hrs</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="text-center flex-1">
                      <span className="block text-xs font-black text-slate-800 leading-none">{timeLeft.minutes}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest">Mins</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="text-center flex-1 animate-pulse">
                      <span className="block text-xs font-black text-[#4c80fa] leading-none">{timeLeft.seconds}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest">Secs</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-extrabold text-[#222222] text-lg mb-3">
                    {productName}
                  </h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4">
                    {productDescription}
                  </p>
                  
                  {/* Highlights Checklist */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {specs.slice(0, 4).map((spec, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                        <ShieldCheck size={14} className="text-[#4c80fa] shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Price Details & Action */}
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Special Offer Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#e4573d]">{price}</span>
                  {originalPrice && (
                    <span className="text-sm text-slate-400 line-through font-semibold">{originalPrice}</span>
                  )}
                </div>
              </div>

              <a
                href={link}
                className="flex items-center gap-2 bg-[#4c80fa] hover:bg-blue-600 text-white font-bold text-xs tracking-wider uppercase px-8 py-3.5 rounded-[30px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <ShoppingCart size={14} />
                Order Spotlight Deal
                <ArrowRight size={14} />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
