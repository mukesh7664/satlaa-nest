"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaArrowRight } from "react-icons/fa";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface BannerBlock {
  bgColor?: string;
  tagline?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
}

interface DualBannerWithSectionProps {
  data: {
    block1?: BannerBlock;
    block2?: BannerBlock;
  };
  sectionIndex?: number;
}

const BannerItem = ({ block, blockName, sectionIndex }: { block?: BannerBlock, blockName: string, sectionIndex?: number }) => {
  if (!block) return null;

  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 h-full"
      style={{ backgroundColor: block.bgColor || "#f5f5f5" }}
    >
      <div className="flex flex-col items-start gap-4 max-w-[50%] z-10">
        {block.tagline && (
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">
            <InlineEditable tag="span" value={block.tagline || ""} fieldPath={`${blockName}.tagline`} sectionIndex={sectionIndex} />
          </span>
        )}
        {block.title && (
          <h3 className="text-3xl md:text-3xl font-serif text-slate-900 leading-tight">
            <InlineEditable tag="span" value={block.title || ""} fieldPath={`${blockName}.title`} sectionIndex={sectionIndex} />
          </h3>
        )}

        {block.buttonText && (
          <Link
            href={block.buttonLink || "#"}
            className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-black text-white text-sm font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 group"
          >
            <InlineEditable tag="span" value={block.buttonText || ""} fieldPath={`${blockName}.buttonText`} sectionIndex={sectionIndex} />
            <FaArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="relative w-full md:w-1/2 aspect-square md:aspect-[4/3] mt-8 md:mt-0">
        {block.image ? (
          <InlineImageEditable
            src={block.image}
            alt={block.title || "Banner"}
            fill
            fieldPath={`${blockName}.image`}
            sectionIndex={sectionIndex}
            className="object-contain object-right-bottom"
          />
        ) : (
          <div className="w-full h-full bg-black/5 rounded flex items-center justify-center">
            <span className="text-slate-400 text-xs">No Image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DualBannerWithSection({
  data,
  sectionIndex,
}: DualBannerWithSectionProps) {
  return (
    <section className="w-full py-12 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <BannerItem block={data.block1} blockName="block1" sectionIndex={sectionIndex} />
        <BannerItem block={data.block2} blockName="block2" sectionIndex={sectionIndex} />
      </div>
    </section>
  );
}
