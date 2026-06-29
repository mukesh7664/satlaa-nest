"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

export interface TopSellingSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items?: Array<{
      title?: string;
      slug?: string;
      image?: string;
      placeholder?: boolean;
      bgColor?: string;
    }>;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function TopSellingSection({ data, sectionIndex }: TopSellingSectionProps) {
  const router = useRouter();

  if (data?.show === false || !data?.title) return null;

  const items = data?.items || [];

  if (items.length === 0) return null;

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
  } else {
    // Default
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto overflow-hidden py-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
          >
            <InlineEditable tag="span" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item, index) => {
            const getStyleColor = (cls?: string) => {
              if (!cls) return undefined;
              const match = cls.match(/^bg-\[(.+)\]$/);
              if (match) return match[1];
              if (!cls.startsWith("bg-")) return cls;
              return undefined;
            };
            const styleColor = getStyleColor(item.bgColor);
            const href = item.slug?.startsWith("/")
              ? item.slug
              : `/products/${item.slug}`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={clsx(
                  "transition-all duration-300",
                  item.placeholder ? "cursor-default" : ""
                )}
              >
                {item.placeholder ? (
                  <div
                    className={clsx(
                      "h-40 rounded-2xl",
                      !item.bgColor && "bg-gray-100",
                      item.bgColor
                    )}
                    style={{ backgroundColor: styleColor }}
                  >
                    {/* Placeholder content if needed */}
                  </div>
                ) : (
                  <Link
                    href={href}
                    onClick={(e) => {
                      if (!item.placeholder && item.slug) {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    className="group flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_1px_10px_rgba(0,0,0,0.10)]"
                  >
                    {item.image ? (
                      <InlineImageEditable
                        src={item.image}
                        alt={item.title || "Category"}
                        width={48}
                        height={48}
                        fieldPath={`items.${index}.image`}
                        sectionIndex={sectionIndex}
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        No Image
                      </div>
                    )}
                    <h3 className="text-center text-sm font-semibold text-gray-700 line-clamp-2">
                      <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${index}.title`} sectionIndex={sectionIndex} />
                    </h3>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
