"use client";

import { InlineImageEditable } from "@/components/InlineImageEditable";
import Image from "next/image";
import Link from "next/link";

export interface BannerSectionProps {
  data?: {
    show: boolean;
    title?: string;
    image?: string;
    imageUrl?: string; // Added imageUrl to interface
    content?: string;
    link?: string;
    linkUrl?: string; // Added linkUrl to interface
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  sectionIndex?: number;
}

export default function BannerSection({ data, sectionIndex }: BannerSectionProps) {
  const finalImage = data?.imageUrl || data?.image;
  const finalLink = data?.linkUrl || data?.link || "#";

  if (data?.show === false || !finalImage) return null;

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
    // No default background for Banner as it was transparent/container before
  }

  return (
    <section
      className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto my-8"
      style={sectionStyle}
    >
      <Link
        href={finalLink}
        className="block relative w-full h-[200px] sm:h-[300px] md:h-[350px] rounded-xl overflow-hidden group"
      >
        <InlineImageEditable
          src={finalImage}
          alt={data.title || "Banner"}
          fill
          fieldPath="imageUrl"
          sectionIndex={sectionIndex}
          className="object-cover transition-transform duration-500 group-hover:scale-105 bg-gray-100"
        />
      </Link>
    </section>
  );
}
