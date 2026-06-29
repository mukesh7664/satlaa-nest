"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import { motion } from "motion/react";
import { Instagram as InstagramIcon } from "lucide-react";

interface InstagramItem {
  image: string;
  link: string;
}

interface ClothInstagramProps {
  sectionIndex?: number;
  data: {
    title?: string;
    subtitle?: string;
    hashtag?: string;
    items?: InstagramItem[];
  };
}

export default function ClothInstagram({ data, sectionIndex }: ClothInstagramProps) {
  const {
    title = "",
    subtitle = "",
    hashtag = "",
    items = []
  } = data || {};

  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#8e8e8e] uppercase block mb-3">
            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-3xl font-light font-serif text-[#111111] tracking-tight">
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          {hashtag && (
            <a
              href={`https://instagram.com/${hashtag.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold tracking-wider text-gray-500 hover:text-black mt-2 inline-block transition-colors"
            >
              {hashtag}
            </a>
          )}
          <div className="w-12 h-[1px] bg-black mx-auto mt-4" />
        </div>

        {/* Instagram Grid (5 columns on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group block relative aspect-square overflow-hidden bg-gray-50 shadow-sm"
            >
              <InlineImageEditable
                src={item.image}
                alt="Instagram post"
                fill
                fieldPath={`items.${idx}.image`}
                sectionIndex={sectionIndex}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Instagram Hover Overlay */}
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-md"
                >
                  <InstagramIcon size={18} className="stroke-[1.5]" />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
