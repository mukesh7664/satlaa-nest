"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GridItem {
  image?: string;
  title?: string;
  link?: string;
}

interface CategoryGridProps {
  sectionIndex?: number;
  data: {
    title?: string;
    items?: GridItem[];
    bgType?: "color" | "gradient" | "image";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function CategoryGrid({ data, sectionIndex }: CategoryGridProps) {
  const items = data?.items || [];
  const { bgType, bgColor, bgGradient, backgroundImage } = data;

  if (items.length === 0) return null;

  const sectionStyle: React.CSSProperties = {};

  if (bgType === "gradient" && bgGradient) {
    sectionStyle.background = bgGradient;
  } else if (bgType === "image" && backgroundImage) {
    sectionStyle.backgroundImage = `url(${backgroundImage})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
    sectionStyle.backgroundRepeat = "no-repeat";
  } else if (bgType === "color" && bgColor) {
    sectionStyle.backgroundColor = bgColor;
  } else {
    // Default fallback
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section className="w-full py-8 lg:py-12" style={sectionStyle}>
      <div className="container-xl px-4 mx-auto">
        {data.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-900">
            <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, index) => {
            // Layout Logic:
            // Standard: col-span-1 (Square)
            // Index 2 (3rd item): col-span-2 (Rectangle)

            // Note: On mobile (2 cols), if we want 3rd item to span full width: col-span-2

            const isWide = index === 2;
            const hasLink = Boolean(item.link);
            const Wrapper = hasLink ? Link : "div";

            return (
              <Wrapper
                key={index}
                href={item.link || "#"}
                className={cn(
                  "relative group overflow-hidden bg-gray-100 block cursor-pointer",
                  isWide
                    ? "col-span-2 aspect-[2/1] md:aspect-[2/1]"
                    : "col-span-1 aspect-square md:aspect-square",
                  !hasLink && "pointer-events-none"
                )}
              >
                {/* Image */}
                {item.image ? (
                  <InlineImageEditable
                    src={item.image}
                    alt={item.title || "Category"}
                    fill
                    fieldPath={`items.${index}.image`}
                    sectionIndex={sectionIndex}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-sm">No Image</span>
                  </div>
                )}

                {/* Overlay Gradient (for text readability) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                {/* Title Overlay */}
                {item.title && (
                  <div className="absolute bottom-4 left-0 w-full text-center px-2">
                    <span className="text-white text-sm md:text-base font-medium drop-shadow-md">
                      <InlineEditable tag="span" value={item.title || ""} fieldPath={`items.${index}.title`} sectionIndex={sectionIndex} />
                    </span>
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
