"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BulkOrderProps {
  sectionIndex?: number;
  data: {
    tagline?: string;
    title?: string;
    description?: string;
    image?: string;
    // Buttons
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function BulkOrder({ data, sectionIndex }: BulkOrderProps) {
  if (!data?.title && !data?.image) return null;

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  return (
    <section className="w-full py-16 lg:py-24" style={sectionStyle}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square"
          >
            {data.image ? (
              <InlineImageEditable
                src={data.image}
                alt={data.title || "Feature"}
                fill
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="object-contain" // Use contain to keep the object shape intact like the elephant
              />
            ) : (
              <div className="w-full h-full bg-black/5 flex items-center justify-center rounded-lg">
                <span className="text-slate-400">Featured Image</span>
              </div>
            )}
          </motion.div>

          {/* Right: Content */}
          <div className="flex flex-col gap-6 max-w-xl">
            {data.tagline && (
              <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                <InlineEditable tag="span" value={data?.tagline || ""} fieldPath="tagline" sectionIndex={sectionIndex} />
              </span>
            )}

            {data.title && (
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif text-slate-800 leading-tight">
                <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              </h2>
            )}

            {data.description && (
              <div className="prose prose-lg text-slate-600 leading-relaxed font-light">
                <p><InlineEditable tag="span" value={data?.description || ""} fieldPath="description" sectionIndex={sectionIndex} /></p>
              </div>
            )}

            <div className="pt-4 flex flex-wrap gap-4">
              {/* Button 1: Primary Dark */}
              {data.button1Text && (
                <Link
                  href={data.button1Link || "#"}
                  className="inline-flex items-center justify-center px-8 py-3 bg-[#3A3830] text-white border border-[#3A3830] text-sm font-medium tracking-wide hover:bg-slate-800 transition-colors duration-300 min-w-[140px]"
                >
                  <InlineEditable tag="span" value={data?.button1Text || ""} fieldPath="button1Text" sectionIndex={sectionIndex} />
                </Link>
              )}

              {/* Button 2: Outline */}
              {data.button2Text && (
                <Link
                  href={data.button2Link || "#"}
                  className="inline-flex items-center justify-center px-8 py-3 border border-slate-400 text-slate-800 text-sm font-medium tracking-wide hover:bg-white/50 transition-colors duration-300 min-w-[140px]"
                >
                  <InlineEditable tag="span" value={data?.button2Text || ""} fieldPath="button2Text" sectionIndex={sectionIndex} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
