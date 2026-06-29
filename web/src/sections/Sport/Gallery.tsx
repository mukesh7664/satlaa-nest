"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface SportGalleryProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    images?: { url: string; alt: string }[];
  };
}

const SportGallery: React.FC<SportGalleryProps> = ({ data, sectionIndex }) => {

  const images = data.images || [];

  return (
    <section className="py-24 bg-[#101010]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#f4fb30] font-black uppercase tracking-widest text-xs mb-4 block">
            <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-3xl"
            >
              <InlineImageEditable 
                src={img.url} 
                alt={img.alt} 
                fill
                fieldPath={`images.${idx}.url`}
                sectionIndex={sectionIndex}
                className="w-full h-auto object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#f4fb30] flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500">
                    <Plus className="w-8 h-8 text-black" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportGallery;
