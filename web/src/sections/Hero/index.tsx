"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

const companyLogos = [
  {
    src: "/images/pages/companies/acc.png",
    alt: "Brand Logo",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/adobe.png",
    alt: "Bulb Icon",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/amazon.png",
    alt: "Database Icon",
    width: 60,
    height: 40,
  },
  {
    src: "/images/pages/companies/dell.png",
    alt: "Factory Icon",
    width: 110,
    height: 40,
  },
  {
    src: "/images/pages/companies/lenskart.png",
    alt: "Mail Icon",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/microsoft.jpg",
    alt: "Management Icon",
    width: 90,
    height: 40,
  },
  {
    src: "/images/pages/companies/amazon.jpg",
    alt: "Motherboard Icon",
    width: 100,
    height: 40,
  },
];

export interface HeroSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
    content?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    highlightedText?: string;
    backgroundImage?: string;
    // Trusted By Section
    trustedByText?: string;
    trustedByLogos?: Array<{
      src: string;
      alt: string;
      width: number;
      height: number;
    }>;

    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    // Button Style
    buttonTextColor?: string;
    buttonBgColor?: string;
    variant?: "standard";
  };
}

export default function HeroSection({ data, sectionIndex }: HeroSectionProps) {
  const router = useRouter();

  if (!data?.title) return null;

  // --- STANDARD / SOFTWARE LAYOUT ---
  const bgStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    bgStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    bgStyle.background = data.bgGradient;
  } else {
    // Default / Image
    bgStyle.backgroundImage = `url('${
      data?.backgroundImage || ""
    }')`;
  }

  return (
    <section
      className="w-full bg-no-repeat bg-cover bg-center overflow-hidden"
      style={bgStyle}
    >
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-10 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-1 lg:order-2 flex justify-center items-center"
        >
          <InlineImageEditable
            src={data?.image || ""}
            alt={data?.title || "Hero Image"}
            width={600}
            height={450}
            fieldPath="image"
            sectionIndex={sectionIndex}
            className="object-contain w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px]"
          />
        </motion.div>

        <div className="order-2 lg:order-1 flex flex-col text-center lg:text-left items-center lg:items-start min-w-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl font-medium text-gray-600 mt-6 lg:mt-12"
          >
            <InlineEditable tag="span" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[36px] sm:text-[48px] md:text-[60px] font-bold tracking-tight leading-tight mt-2"
          >
            {data?.title ? (
              // Check if title contains HTML tags
              /<[a-z][\s\S]*>/i.test(data.title) ? (
                <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              ) : data.highlightedText &&
                data.title.includes(data.highlightedText) ? (
                <>
                  {data.title.split(data.highlightedText)[0]}
                  <span className="text-[#4988FF]">{data.highlightedText}</span>
                  {data.title.split(data.highlightedText)[1]}
                </>
              ) : (
                <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              )
            ) : null}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-base sm:text-lg text-gray-600 my-4 font-medium max-w-md "
          >
            <InlineEditable tag="div" value={data?.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
          </motion.div>

          {/* ... rest of the standard layout ... */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => router.push(data?.buttonLink || "/contact-us")}
              variant="BlueDark"
              size="xl"
              style={{
                backgroundColor: data?.buttonBgColor,
                borderColor: data?.buttonBgColor, // ensure border matches if it's solid
              }}
            >
              <InlineEditable tag="span" value={data?.buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="mt-8 w-full">
              <p
                className="text-[#303745] text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: data?.trustedByText || "" }}
              />

              {/* Horizontal Scrolling Logo Animation */}
              <div
                className="my-6 relative overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                }}
              >
                <div
                  className="flex items-center animate-scroll"
                  style={{ animationDuration: "40s" }}
                >
                  {(data?.trustedByLogos && data.trustedByLogos.length > 0
                    ? [...data.trustedByLogos, ...data.trustedByLogos]
                    : []
                  ).map((logo, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 mx-6 sm:mx-8 flex items-center justify-center h-10 sm:h-12"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt || "Brand Logo"}
                        width={logo.width || 100}
                        height={logo.height || 40}
                        className=" transition-opacity duration-300 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
