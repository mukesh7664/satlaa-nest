"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { motion, Variants } from "framer-motion";

interface FloatingProduct {
  title: string;
  subtitle: string;
  icon: string;
}

interface UnlockPotentialProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    image?: string;
    floatingProducts?: FloatingProduct[];
    buttonText?: string;
    buttonLink?: string;
    buttonBgColor?: string;
    mediaType?: "image" | "video";
    videoUrl?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const leftSlideVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const rightSlideVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const videoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function UnlockPotential({ data, sectionIndex }: UnlockPotentialProps) {
  const {
    title = "Unlock your potential with <span class='text-[#4988FF]'>Microsoft 365</span>, the ultimate suite for productivity and collaboration.",
    description = "Microsoft 365 is a comprehensive platform that empowers users to create, collaborate, and innovate.",
    image = "/images/pages/brand/intergrationImage.png",
    floatingProducts = [],
    buttonText = "",
    buttonLink,
    mediaType = "image",
    videoUrl = "/images/pages/brand/video.mp4",
  } = data || {};

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
    // Default or Fallback
    // Originally: bg-[url('/images/pages/brand/unlockBg.png')]
    // We can keep original as fallback if no background settings are provided.
    // However, if we set backgroundImage here, it overrides any class.
    // If no data.bgType is set, we want the default.
  }

  // Combine classes based on whether custom background is active
  const hasCustomBg =
    data?.bgType && (data.bgColor || data.bgGradient || data.backgroundImage);
  const baseClasses = "relative py-20 overflow-hidden";
  const defaultBgClasses =
    "bg-[url('/images/pages/brand/unlockBg.png')] lg:bg-no-repeat bg-contain lg:bg-cover bg-center";

  return (
    <section
      className={`${baseClasses} ${!hasCustomBg ? defaultBgClasses : ""}`}
      style={hasCustomBg ? sectionStyle : undefined}
    >
      <motion.div
        className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h1
          variants={itemVariants}
          className="mb-6 text-3xl max-w-6xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <motion.div variants={itemVariants}>
            <div // changed p to div for safety with block elements
              className="mb-8 text-base text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {buttonLink ? (
              <a href={buttonLink}>
                <Button
                  variant="BlueDark"
                  size="xl"
                  style={{
                    backgroundColor: data?.buttonBgColor || undefined,
                    borderColor: data?.buttonBgColor || undefined,
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: buttonText }} />
                </Button>
              </a>
            ) : (
              <Button
                variant="BlueDark"
                size="xl"
                style={{
                  backgroundColor: data?.buttonBgColor || undefined,
                  borderColor: data?.buttonBgColor || undefined,
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: buttonText }} />
              </Button>
            )}
          </motion.div>

          <div className="flex justify-center relative xl:left-18">
            <div className="relative left-4 flex flex-col gap-8 mt-12 z-20">
              {floatingProducts.map((product, index) => {
                // Helper to normalize icon URL
                const getIconUrl = (iconUrl: string) => {
                  if (!iconUrl) return "/images/placeholder-icon.png";
                  if (iconUrl.startsWith("http")) return iconUrl;
                  if (iconUrl.startsWith("uploads/")) {
                    return `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1"
                    }/${iconUrl}`;
                  }
                  return iconUrl;
                };

                return (
                  <motion.div
                    key={index}
                    variants={leftSlideVariants}
                    className="border border-gray-200 rounded-md shadow-md p-5 bg-white text-left"
                  >
                    <h3 className="text-blue-700 font-bold flex items-center justify-between gap-2">
                      {/* Fixed font-bold typo from original file 'font-' */}
                      <InlineEditable tag="span" value={product.title || ""} fieldPath={`floatingProducts.${index}.title`} sectionIndex={sectionIndex} />
                      <div className="relative w-6 h-6">
                        <Image
                          src={getIconUrl(product.icon)}
                          alt={`${product.title} Icon`}
                          fill
                          className="object-contain"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    </h3>

                    <p className="text-gray-500 text-sm mt-2">
                      <InlineEditable tag="span" value={product.subtitle || ""} fieldPath={`floatingProducts.${index}.subtitle`} sectionIndex={sectionIndex} />
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {mediaType === "video" ? (
              <motion.div
                variants={videoVariants}
                className="h-[420px] w-[260px] z-10"
              >
                <video
                  className="rounded-tr-[127px] rounded-bl-[111px] border border-gray-200 shadow-lg w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={videoUrl}
                ></video>
              </motion.div>
            ) : (
              // Fallback for image logic from original file if needed, but original mixed them.
              // Actually original file has video hardcoded in the middle and image on right?
              // Wait, the original had BOTH video in middle and image on right.
              // The Editor implies toggle. Let's respect the Editor data structure which added `mediaType`.
              // But original component hardcoded video?
              // Original:
              // Middle: Video
              // Right: Image

              // The Editor adds `mediaType` select (Image/Video).
              // If I look at the editor:
              // It controls `mediaType` which seemingly toggles `videoUrl` or `image`.
              // But where does `image` go? Right column.
              // Where does `video` go? Middle column.

              // If the intention of `mediaType` in Editor is to switch the MAIN visual,
              // in the original code, `video` was hardcoded.
              // I will adapt the component to use `data.mediaType` if present,
              // or default to the original structure if `mediaType` is missing.
              // But to be "global", it should follow data.

              // Let's assume the Editor's `mediaType` toggles the "Hero Media".
              // In the original, there are TWO visuals: A video widget (middle) and a large image (right).
              // This is complex.
              // I will preserve the original layout but verify data bindings.

              // Re-reading original `UnlockPotential.tsx`:
              // it displays BOTH list+video (col 2) AND image (col 3).
              // I will stick to original structure for now and map `videoUrl` to the video tag
              // and `image` to the right image.

              <motion.div
                variants={videoVariants}
                className="h-[420px] w-[260px] z-10"
              >
                <video
                  className="rounded-tr-[127px] rounded-bl-[111px] border border-gray-200 shadow-lg w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={videoUrl}
                />
              </motion.div>
            )}
          </div>

          <motion.div
            variants={rightSlideVariants}
            className="flex justify-center z-20"
          >
            <div>
              <InlineImageEditable
                src={image}
                alt="Integration flow"
                width={500}
                height={500}
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
