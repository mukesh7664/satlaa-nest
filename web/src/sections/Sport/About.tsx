"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface SportAboutProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    content?: string;
    features?: string[];
    image?: string;
    statsLabel?: string;
    statsValue?: string;
  };
}

const SportAbout: React.FC<SportAboutProps> = ({ data, sectionIndex }) => {

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="text-[#6c3aed] font-black uppercase tracking-widest text-xs mb-4 block px-3 py-1 bg-purple-50 rounded-full w-fit">
              <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
            </span>
            
            <h2 className="text-4xl md:text-6xl font-black text-[#101010] mb-8 leading-[1.1] tracking-tighter">
              <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              <InlineEditable tag="span" value={data.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
            </p>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {(data.features || []).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f4fb30] fill-black shrink-0" />
                  <span className="font-bold text-[#101010]">
                    <InlineEditable tag="span" value={feature || ""} fieldPath={`features.${idx}`} sectionIndex={sectionIndex} />
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-6 p-6 bg-[#f5f6ff] border-l-8 border-[#6c3aed]">
                <div className="text-4xl font-black text-[#101010]"><InlineEditable tag="span" value={data.statsValue || ""} fieldPath="statsValue" sectionIndex={sectionIndex} /></div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-tight">
                    <InlineEditable tag="span" value={data.statsLabel || ""} fieldPath="statsLabel" sectionIndex={sectionIndex} />
                </div>
            </div>
          </motion.div>

          {/* Right Side: Image with decoration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
              <InlineImageEditable 
                src={data.image || "https://images.unsplash.com/photo-1626244661279-b25546777b0c?q=80&w=2670&auto=format&fit=crop"} 
                alt="About Padel" 
                fill
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
            
            {/* Background decorative boxes */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#f4fb30] rounded-[2rem] -z-10" />
            <div className="absolute -top-10 -left-10 w-48 h-48 border-4 border-[#6c3aed] rounded-[2rem] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SportAbout;
