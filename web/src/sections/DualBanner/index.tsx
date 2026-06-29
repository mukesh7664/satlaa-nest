"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { InlineImageEditable } from "@/components/InlineImageEditable";

// --- Reusable Banner Card Component ---
// This makes the code cleaner by abstracting the common styles for each banner.
const BannerCard = ({
  children,
  linkUrl,
  direction,
}: {
  children: React.ReactNode;
  linkUrl?: string;
  direction: "left" | "right";
}) => {
  const Content = (
    <motion.div
      initial={{ x: direction === "left" ? -100 : 100, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative w-full h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-md"
    >
      {children}
    </motion.div>
  );

  if (linkUrl) {
    return <Link href={linkUrl}>{Content}</Link>;
  }
  return Content;
};

export interface DualBannerSectionProps {
  data?: {
    show: boolean;
    banner1: {
      image?: string;
      link?: string;
    };
    banner2: {
      image?: string;
      link?: string;
    };
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

// --- Main Component ---
export default function DualBannerSection({ data, sectionIndex }: DualBannerSectionProps & { sectionIndex?: number }) {

  if (data?.show === false) return null;

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
    <section className="py-6" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-2 overflow-hidden ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Banner Image */}
          <BannerCard linkUrl={data?.banner1?.link} direction="left">
            <InlineImageEditable
              src={data?.banner1?.image || ""}
              alt="Banner 1"
              fill
              fieldPath="banner1.image"
              sectionIndex={sectionIndex}
              className="transition-transform duration-500 group-hover:scale-105 object-cover"
            />
          </BannerCard>

          {/* Right Banner Image */}
          <BannerCard linkUrl={data?.banner2?.link} direction="right">
            <InlineImageEditable
              src={data?.banner2?.image || ""}
              alt="Banner 2"
              fill
              fieldPath="banner2.image"
              sectionIndex={sectionIndex}
              className="transition-transform duration-500 group-hover:scale-105 object-cover"
            />
          </BannerCard>
        </div>
      </div>
    </section>
  );
}
