"use client";

import Link from "next/link";
import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { Button } from "@/components/ui/button";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import { BiSolidRightArrowSquare } from "react-icons/bi";
import { motion, Variants } from "framer-motion";
import { InlineImageEditable } from "@/components/InlineImageEditable";

// Tool interface matches API structure
interface Tool {
  name: string;
  icon?: string;
  description?: string;
}

interface TeamToolsProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    tools?: Tool[];
    points?: string[];
    videoUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonBgColor?: string;
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

const headerVariants: Variants = {
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const videoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, x: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const listVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const FeatureCard = ({ sectionIndex, 
      name,
      icon,
      description = "",
      isCentered = false,
    }: {
      name: string;
      icon?: string;
      description?: string;
      isCentered?: boolean; sectionIndex?: number;
    }) => {
  // Styles for the image wrapper based on whether the card is centered
  const imageWrapperClasses = isCentered
    ? "relative mx-auto mb-4 rounded-md bg-card-bg"
    : "absolute top-0 right-0 w-20 h-20 rounded-bl-full border border-[#E9EAEB] bg-white flex items-start justify-end p-4";

  // Styles for the card itself
  const cardClasses = `
    relative p-5 rounded-lg border border-[#E9EAEB] bg-[#FAFAFA] h-[150px] flex cursor-pointer overflow-hidden
    ${
      isCentered
        ? " flex-col justify-center bg-white shadow-lg items-center text-center border-2 border-primary-blue"
        : "flex-col pt-10"
    }
    transition-shadow duration-300 hover:shadow-md
  `;

  return (
    <motion.div variants={cardVariants} className={cardClasses}>
      {/* Image Container */}
      {icon && (
        <div className={imageWrapperClasses}>
          <InlineImageEditable
            src={icon}
            alt={name}
            width={isCentered ? 80 : 28}
            height={isCentered ? 80 : 28}
            fieldPath="icon"
            sectionIndex={sectionIndex}
            className={isCentered ? " object-contain" : ""}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className={`${isCentered ? "mt-0" : "mt-6"}`}>
          <h3
            className={`text-[12px] text-left font-medium mb-1 text-[#004DAA] transition-colors duration-300`}
          >
            {name}
          </h3>
          <p
            className={`text-sm line-clamp-2 text-left ${
              isCentered ? "text-[#004DAA]" : "text-gray-600"
            } `}
          >
            <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
          </p>
        </div>
        <div>
          {isCentered && (
            <BiSolidRightArrowSquare className="text-[#004DAA] text-xl" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function TeamTools({ data, sectionIndex }: TeamToolsProps) {
  const {
    title = "Team Tools",
    description = "",
    tools = [],
    points = [],
    videoUrl = "/images/pages/brand/teammeeting.mp4",
    buttonText,
    buttonLink,
  } = data || {};

  // Don't render if no tools from API
  if (!tools || tools.length === 0) {
    return null;
  }

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
    <section
      className="w-full py-8 sm:py-12 overflow-hidden"
      style={sectionStyle}
    >
      <motion.div
        className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Header Section */}
        <motion.div variants={headerVariants} className="text-left mb-12">
          <h2
            className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p
            className="mt-2 text-lg text-gray-600 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-y-8 items-start">
          {/* Left Column: Feature Grid & Button */}
          <div className="w-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <FeatureCard
                  key={index}
                  name={tool.name}
                  icon={tool.icon}
                  description={tool.description} sectionIndex={sectionIndex}
                />
              ))}
            </div>
            {buttonText && (
              <motion.div variants={headerVariants} className="mt-4">
                {buttonLink ? (
                  <Link href={buttonLink}>
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
                  </Link>
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
            )}
          </div>

          {/* Right Column: Video & Feature List */}
          <div className="w-full flex items-center justify-between">
            {/* Video with rounded corners */}
            <motion.div
              variants={videoVariants}
              className="relative left-0 lg:left-12 w-full lg:max-w-none h-[400px] lg:h-[600px] overflow-hidden mb-10 flex items-center justify-center"
            >
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center rounded-t-[167px] rounded-bl-[167px]"
              />
            </motion.div>

            {/* Feature list */}
            {points && points.length > 0 && (
              <div className="w-full max-w-sm lg:max-w-full space-y-2 lg:space-y-4 z-10">
                {points.map((point: string, index: number) => (
                  <motion.div
                    key={index}
                    variants={listVariants}
                    className={`${
                      index === 0 ? "bg-[#E2EFFF]" : "bg-white shadow-lg"
                    } flex items-start p-2 lg:p-4 rounded-lg shadow-blue-100`}
                  >
                    <FaCheck
                      className={`h-5 w-5 p-1 text-[#0F172A] mr-3 mt-1 flex-shrink-0 ${
                        index === 0 ? "bg-white" : "bg-[#E2EFFF]"
                      }`}
                    />
                    <p className="text-base text-gray-700 line-clamp-2">
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
