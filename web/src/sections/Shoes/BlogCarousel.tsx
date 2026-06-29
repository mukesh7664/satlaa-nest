"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, User, ArrowUpRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  link: string;
}

interface ShoesBlogCarouselProps {
  sectionIndex?: number;
  data?: {
    title?: string;
    posts?: BlogPost[];
  };
}


export default function ShoesBlogCarousel({ data, sectionIndex }: ShoesBlogCarouselProps) {
  const title = data?.title || "LATEST NEWS";
  const posts = data?.posts || [];

  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(posts.length - 3, prev + 1));
  };

  return (
    <section className="w-full bg-[#fcfcfc] py-20 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header with inline Slider Controls */}
        <div className="flex items-end justify-between mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#55eb0c] bg-black px-4 py-1.5 rounded-full uppercase select-none mb-3 inline-block">
              EDITORIAL
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight font-sans">
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="w-10 h-10 rounded-full border border-slate-200 hover:border-black hover:bg-black hover:text-[#55eb0c] text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-800 disabled:hover:border-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex >= posts.length - 3 || posts.length <= 3}
              className="w-10 h-10 rounded-full border border-slate-200 hover:border-black hover:bg-black hover:text-[#55eb0c] text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-800 disabled:hover:border-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(startIndex, startIndex + 3).map((post, index) => (
            <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
              
              {/* Image Block */}
              <div className="aspect-[16/10] overflow-hidden relative">
                <InlineImageEditable 
                  src={post.image} 
                  alt={post.title} 
                  fill
                  fieldPath={`posts.${startIndex + index}.image`}
                  sectionIndex={sectionIndex}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 select-none"
                />
              </div>

              {/* Card content */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                
                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 tracking-wider mb-4 uppercase">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#55eb0c]" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-[#55eb0c]" />
                    <span>{`BY ${post.author}`}</span>
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-black text-black tracking-tight mb-3 leading-tight uppercase group-hover:text-[#55eb0c] transition-colors line-clamp-2">
                  <InlineEditable tag="span" value={post.title || ""} fieldPath={`posts.${startIndex + index}.title`} sectionIndex={sectionIndex} />
                </h3>

                <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6 line-clamp-3">
                  <InlineEditable tag="span" value={post.excerpt || ""} fieldPath={`posts.${startIndex + index}.excerpt`} sectionIndex={sectionIndex} />
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <a 
                    href={post.link}
                    className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-slate-800 hover:text-[#55eb0c] transition-colors uppercase group/link"
                  >
                    <span>READ MORE</span>
                    <ArrowUpRight size={14} className="transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
