"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

type BrandLogo = {
  src: string;
  alt: string;
};

const LogoSquare: React.FC<{ logo?: BrandLogo; index: number; sectionIndex?: number }> = ({
  logo,
  index,
  sectionIndex,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!logo) return;

    let timeoutId: NodeJS.Timeout;

    const runCycle = () => {
      // Random time to stay hidden: 2s to 6s
      const hiddenDuration = Math.random() * 4000 + 2000;

      timeoutId = setTimeout(() => {
        setIsVisible(true);

        // Random time to stay visible: 2s to 4s
        const visibleDuration = Math.random() * 2000 + 2000;

        timeoutId = setTimeout(() => {
          setIsVisible(false);
          runCycle(); // Schedule next cycle
        }, visibleDuration);
      }, hiddenDuration);
    };

    // Initial random delay start to desynchronize
    const initialDelay = Math.random() * 5000;
    timeoutId = setTimeout(runCycle, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [logo]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      viewport={{ once: true }}
      className={`relative flex h-full w-full items-center justify-center border border-[#C0C0C0] py-6 xl:py-8 transition-all duration-300 ${
        logo ? "bg-[#F2F8F9]" : "bg-white"
      }`}
    >
      {logo && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isVisible ? 1 : 0,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <InlineImageEditable
            src={logo.src}
            alt={logo.alt}
            width={40}
            height={40}
            fieldPath={`images.${index}`}
            sectionIndex={sectionIndex}
            className="object-contain"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export interface TrustedBrandsSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    ctaText?: string;
    ctaLink?: string;
    highlightedText?: string;
    images?: string[];
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function TrustedBrandsSection({
  data,
  sectionIndex,
}: TrustedBrandsSectionProps) {
  const router = useRouter();

  if (data?.show === false || !data?.title) return null;

  const title = data?.title || "";
  const highlightedText = data?.highlightedText || "";
  const subtitle =
    data?.subtitle ||
    data?.description ||
    "";

  // Align with Admin Editor which saves as ctaText/ctaLink, but keep fallback
  const btnText = data?.ctaText || data?.buttonText || "";
  const btnLink = data?.ctaLink || data?.buttonLink || "";

  const displayImages =
    data?.images?.map((src) => ({ src, alt: "Brand Logo" })) || [];

  if (displayImages.length === 0) return null;

  const totalSlots = Math.max(16, displayImages.length);
  const gridItems = Array(totalSlots)
    .fill(null)
    .map((_, i) => {
      return (
        displayImages[i] || {
          src: "/logos/placeholder-empty.svg",
          alt: "Empty",
        }
      );
    });

  // Safe Highlight Logic
  const getHighlightedTitle = () => {
    if (!highlightedText) return title;

    // Case-insensitive regex escape
    const parts = title.split(new RegExp(`(${highlightedText})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightedText.toLowerCase() ? (
            <span key={i} className="text-[#4988FF]">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

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
    // Default white
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section style={sectionStyle}>
      <div className="container-xl  mx-auto  ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 ">
          {/* Left Column: Text Content */}
          <div
            className={`text-center lg:text-left flex justify-center items-center ${
              !data?.bgType ||
              (data.bgType === "color" && data.bgColor === "#ffffff")
                ? "bg-white"
                : ""
            }`}
          >
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-semibold tracking-tight max-w-xl text-gray-900 leading-tight"
              >
                <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="my-6 text-base text-gray-600 max-w-lg mx-auto lg:mx-0"
              >
                <InlineEditable tag="div" value={data?.subtitle || data?.description || ""} fieldPath="description" sectionIndex={sectionIndex} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Button
                  onClick={() => router.push(btnLink)}
                  variant="BlueDark"
                  size="xl"
                  className="w-[300px]"
                >
                  <InlineEditable tag="span" value={btnText} fieldPath="ctaText" sectionIndex={sectionIndex} />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Logo Grid */}
          <div>
            <div className="col-span-12 md:col-span-7">
              <div className="grid grid-cols-4 grid-rows-4 overflow-hidden  border border-gray-200">
                {gridItems.map((logo, index) => (
                  <LogoSquare
                    key={index}
                    index={index}
                    logo={logo.src.includes("empty") ? undefined : logo}
                    sectionIndex={sectionIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
