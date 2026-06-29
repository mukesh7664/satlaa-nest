"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SportCoachingProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    content?: string;
    phone?: string;
    image?: string;
    features?: { title: string; description: string }[];
    learnMoreText?: string;
    callUsNowText?: string;
    experienceYears?: string;
    experienceLabel?: string;
  };
}

const SportCoaching: React.FC<SportCoachingProps> = ({ data, sectionIndex }) => {

  const features = data.features || [];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="text-[#6c3aed] font-black uppercase tracking-widest text-xs mb-4 block">
              <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
            </span>
            
            <h2 className="text-4xl md:text-6xl font-black text-[#101010] mb-8 leading-[1.1] tracking-tighter">
              <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            
            <p className="text-gray-600 text-lg mb-12 leading-relaxed italic border-l-4 border-[#f4fb30] pl-6">
              <InlineEditable tag="span" value={data.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
            </p>
            
            <div className="space-y-10 mb-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#f5f6ff] flex items-center justify-center">
                    {idx === 0 ? <Award className="w-7 h-7 text-[#6c3aed]" /> : <Star className="w-7 h-7 text-[#6c3aed]" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#101010] mb-2"><InlineEditable tag="span" value={feature.title || ""} fieldPath={`features.${idx}.title`} sectionIndex={sectionIndex} /></h4>
                    <p className="text-gray-500 leading-relaxed"><InlineEditable tag="span" value={feature.description || ""} fieldPath={`features.${idx}.description`} sectionIndex={sectionIndex} /></p>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="flex flex-wrap items-center gap-8">
              <Link 
                href="#"
                className="px-10 py-5 bg-[#101010] text-white font-black uppercase tracking-tighter text-lg hover:bg-[#6c3aed] transition-all duration-300 transform hover:-translate-y-1 block"
              >
                <InlineEditable tag="span" value={data.learnMoreText || "Learn More"} fieldPath="learnMoreText" sectionIndex={sectionIndex} />
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f4fb30] flex items-center justify-center">
                    <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <InlineEditable tag="span" value={data.callUsNowText || "Call Us Now"} fieldPath="callUsNowText" sectionIndex={sectionIndex} />
                    </div>
                    <div className="text-lg font-black text-[#101010]"><InlineEditable tag="span" value={data.phone || ""} fieldPath="phone" sectionIndex={sectionIndex} /></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Left Side: Image with floating elements */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden">
              <InlineImageEditable 
                src={data.image || "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2670&auto=format&fit=crop"} 
                alt="Coaching" 
                fill
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
            
            {/* Floating Experience Badge */}
            <div className="absolute top-12 -right-6 z-20 bg-[#f4fb30] p-8 rounded-3xl shadow-xl transform rotate-3 pointer-events-auto">
                <div className="text-5xl font-black text-black mb-1">
                    <InlineEditable tag="span" value={data.experienceYears || "15+"} fieldPath="experienceYears" sectionIndex={sectionIndex} />
                </div>
                <div className="text-xs font-black text-black uppercase tracking-widest leading-none">
                    <InlineEditable tag="span" value={data.experienceLabel || "Years of Experience"} fieldPath="experienceLabel" sectionIndex={sectionIndex} />
                </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 bg-[#f4fb30]/10 -m-8 rounded-[4rem] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SportCoaching;
