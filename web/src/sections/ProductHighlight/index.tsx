"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductItem {
  image?: string;
  title?: string;
  price?: string;
  link?: string;
}

interface ProductHighlightProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    items?: ProductItem[];
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function ProductHighlight({ data, sectionIndex }: ProductHighlightProps) {
  if (!data?.title && (!data?.items || data.items.length === 0)) return null;

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

  const items = (data.items || []).slice(0, 2); // Ensure max 2

  return (
    <section className="w-full py-16 lg:py-24" style={sectionStyle}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            {/* Small Label (Optional - could be hardcoded or added to schema later if needed) */}
            <span className="text-sm font-medium tracking-wider uppercase text-slate-500">
              In focus
            </span>

            {data.title && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 leading-tight">
                <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              </h2>
            )}

            {data.description && (
              <div className="prose prose-lg text-slate-700 leading-relaxed">
                <p><InlineEditable tag="span" value={data?.description || ""} fieldPath="description" sectionIndex={sectionIndex} /></p>
              </div>
            )}

            {data.buttonText && data.buttonLink && (
              <div className="pt-4">
                <Link
                  href={data.buttonLink}
                  className="inline-flex items-center justify-center px-8 py-3 border border-slate-900 text-slate-900 text-sm font-medium uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-colors duration-300"
                >
                  <InlineEditable tag="span" value={data?.buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
                </Link>
              </div>
            )}
          </div>

          {/* Right Content - Products */}
          <div className="grid grid-cols-2 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Product Card */}
                <Link href={item.link || "#"} className="group block relative">
                  {/* Optional "New" badge style - not in data yet, but nice to have structure */}
                  {/* <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-1 text-xs uppercase font-medium">New</div> */}

                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-sm">
                    {item.image ? (
                      <InlineImageEditable
                        src={item.image}
                        alt={item.title || "Product"}
                        fill
                        fieldPath={`items.${index}.image`}
                        sectionIndex={sectionIndex}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-1">
                  {/* Small super-label if needed */}
                  {/* <p className="text-[10px] uppercase tracking-wider text-slate-400">Dhokra Metal Craft</p> */}

                  {item.title && (
                    <h3 className="text-base font-medium text-slate-800">
                      <Link href={item.link || "#"} className="hover:underline">
                        <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${index}.title`} sectionIndex={sectionIndex} />
                      </Link>
                    </h3>
                  )}
                  {item.price && (
                    <p className="text-sm text-slate-600 font-medium">
                      {item.price}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
