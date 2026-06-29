"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface SportTestimonialsProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    testimonials?: Testimonial[];
  };
}

const SportTestimonials: React.FC<SportTestimonialsProps> = ({ data, sectionIndex }) => {

  const testimonials = data.testimonials || [];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#6c3aed] font-black uppercase tracking-widest text-xs mb-4 block">
            <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-[#101010] tracking-tighter">
            <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-[#f5f6ff] rounded-[3rem] border border-transparent hover:border-[#6c3aed] hover:bg-white hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#f4fb30] fill-[#f4fb30]" />
                ))}
              </div>

              <Quote className="w-12 h-12 text-[#6c3aed] opacity-20 mb-6" />

              <p className="text-[#101010] text-lg font-medium leading-relaxed mb-10 italic">
                "<InlineEditable tag="span" value={item.content || ""} fieldPath={`testimonials.${idx}.content`} sectionIndex={sectionIndex} />"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                    <InlineImageEditable 
                      src={item.avatar || ""} 
                      alt={item.name} 
                      fill
                      fieldPath={`testimonials.${idx}.avatar`}
                      sectionIndex={sectionIndex}
                      className="w-full h-full object-cover" 
                    />
                </div>
                <div>
                    <h4 className="font-black text-[#101010]"><InlineEditable tag="span" value={item.name || ""} fieldPath={`testimonials.${idx}.name`} sectionIndex={sectionIndex} /></h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest"><InlineEditable tag="span" value={item.role || ""} fieldPath={`testimonials.${idx}.role`} sectionIndex={sectionIndex} /></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportTestimonials;
