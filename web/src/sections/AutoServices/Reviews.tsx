"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface AutoServicesReviewsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    rating?: string;
    totalReviews?: string;
    reviews?: {
      name: string;
      date: string;
      comment: string;
      rating: number;
    }[];
  };
}

export default function AutoServicesReviews({ data, sectionIndex }: AutoServicesReviewsProps) {
  const {
    title = "",
    rating = "",
    totalReviews = "",
    reviews = []
  } = data || {};

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Summary */}
          <div className="w-full lg:w-1/4 text-center">
            <h2 className="text-3xl font-inter font-bold text-[#1a1a1a] mb-2"><InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} /></h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-[#00b67a] text-[#00b67a]" />
              ))}
            </div>
            <p className="text-[#1a1a1a] font-inter text-xs font-bold mb-6">Based on <span className="underline cursor-pointer">{totalReviews}</span></p>
            <p className="text-[#8e8e8e] font-inter text-xs max-w-[200px] mx-auto">All comments are from real users who have made purchases before.</p>
          </div>

          {/* Reviews Slider */}
          <div className="w-full lg:w-3/4 relative">
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {reviews.map((rev, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[300px] bg-white p-6 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={`fill-[#00b67a] text-[#00b67a] ${i >= rev.rating ? 'opacity-30' : ''}`} />
                    ))}
                    <span className="text-[10px] text-[#8e8e8e] font-bold uppercase tracking-widest ml-2 flex items-center gap-1">
                      <span className="w-4 h-4 bg-[#00b67a] rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      Purchased user
                    </span>
                  </div>
                  <h4 className="text-[#1a1a1a] font-inter font-bold text-sm mb-3 line-clamp-1">{rev.comment.split('...')[0]}</h4>
                  <p className="text-[#8e8e8e] font-inter text-xs leading-relaxed mb-4 line-clamp-3">
                    {rev.comment}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1a1a1a] font-inter font-bold text-xs">{rev.name}</span>
                    <span className="text-[#8e8e8e] font-inter text-[10px]">{rev.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Nav Buttons */}
            <button className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] shadow-md transition-colors hidden lg:flex">
              <ChevronLeft size={20} />
            </button>
            <button className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] shadow-md transition-colors hidden lg:flex">
              <ChevronRight size={20} />
            </button>

            <div className="mt-8">
              <a href="#" className="text-[#0067b2] font-inter font-bold text-[10px] uppercase tracking-widest hover:underline">Showing our 5 star reviews.</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
