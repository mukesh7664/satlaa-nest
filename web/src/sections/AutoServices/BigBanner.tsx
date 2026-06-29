"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";

interface AutoServicesBigBannerProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    features?: {
      title: string;
      description: string;
    }[];
  };
}

export default function AutoServicesBigBanner({ data, sectionIndex }: AutoServicesBigBannerProps) {
  const {
    title = "",
    subtitle = "",
    description = "",
    image = "",
    features = []
  } = data || {};

  if (!image) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="w-full lg:w-1/2">
            <span className="text-[#8e8e8e] font-inter font-bold tracking-[0.1em] uppercase text-[10px] mb-4 block">
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </span>
            <h2 className="text-[#1a1a1a] font-inter font-bold text-5xl md:text-6xl mb-8 leading-tight">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i >= 5 ? "text-[#8e8e8e]/40" : ""}>{word} </span>
              ))}
            </h2>
            <p className="text-[#666666] font-inter text-base mb-10 leading-relaxed max-w-md">
              <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
            </p>
            <p className="text-[#666666] font-inter text-base leading-relaxed max-w-md">
              Morbi sed rhoncus erat. Aenean quis lacus tellus. Duis commodo at risus sit amet maximus molestie.
            </p>
            
            <a href="#" className="inline-block mt-12 text-[#1a1a1a] font-inter font-bold text-xs uppercase tracking-widest border-b-2 border-[#1a1a1a] pb-1 hover:text-[#0067b2] hover:border-[#0067b2] transition-all">
              Read and Shop Now
            </a>
          </div>

          {/* Center Image */}
          <div className="w-full lg:w-1/3 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <InlineImageEditable 
                src={image} 
                alt="Featured" 
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="w-full h-auto object-contain" 
              />
            </motion.div>
            {/* Soft glow behind car */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-50 rounded-full blur-[100px] -z-0 opacity-60"></div>
          </div>

          {/* Right Features */}
          <div className="w-full lg:w-1/3">
            <div className="space-y-10">
              <h3 className="text-[#1a1a1a] font-inter font-bold text-xl mb-4">Reliable Parts for Unstoppable Rides.</h3>
              <p className="text-[#8e8e8e] font-inter text-sm mb-10">Vestibulum condimentum libero elit, at pretium purus molestie ornare.</p>
              
              <div className="space-y-8">
                {features.map((feat, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[10px] font-bold text-[#8e8e8e] group-hover:bg-[#0067b2] group-hover:text-white group-hover:border-[#0067b2] transition-all">
                      0{i+1}
                    </div>
                    <div>
                      <h4 className="text-[#1a1a1a] font-inter font-bold text-sm mb-2"><InlineEditable tag="span" value={feat.title || ""} fieldPath={`features.${i}.title`} sectionIndex={sectionIndex} /></h4>
                      <p className="text-[#8e8e8e] font-inter text-xs leading-relaxed"><InlineEditable tag="span" value={feat.description || ""} fieldPath={`features.${i}.description`} sectionIndex={sectionIndex} /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
