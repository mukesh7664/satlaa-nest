"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

// Define the type for feature items (matches API structure)
type FeatureItem = {
  title: string;
  description: string;
  image?: string;
};

// Animation variants
const leftSectionVariants: Variants = {
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

const rightHeaderVariants: Variants = {
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

const featureItemVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

interface PowerfulFeaturesProps {
  sectionIndex?: number;
  data: {
    title?: string;
    features?: FeatureItem[];
    image?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function PowerfulFeatures({ data, sectionIndex }: PowerfulFeaturesProps) {
  const { title = "", features = [], image } = data || {};

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Progressive highlight effect
  React.useEffect(() => {
    if (!hasAnimated || !features || features.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= features.length - 1) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [features, hasAnimated]);

  // Don't render if no features from API
  if (!features || features.length === 0 || !title) {
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
    <section className="w-full py-4 sm:py-8" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left Section - Title and Main Image */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={leftSectionVariants}
          >
            <h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl text-[#4988FF] mb-6"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {image && (
              <div className="mt-6">
                <InlineImageEditable
                  src={image}
                  alt="Features"
                  width={600}
                  height={500}
                  fieldPath="image"
                  sectionIndex={sectionIndex}
                  className="object-contain"
                />
              </div>
            )}
          </motion.div>

          {/* Right Section - Features List */}
          <div className="w-full lg:w-1/2">
            <motion.p
              className="text-lg text-black mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={rightHeaderVariants}
            >
              Walkthrough the fantastic features
            </motion.p>

            <div className="space-y-4">
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-sm shadow-sm transition-all duration-500 ${
                    index === activeIndex
                      ? "bg-white shadow-md"
                      : "bg-[#FAFAFA]"
                  }`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={featureItemVariants}
                  onViewportEnter={() => {
                    if (!hasAnimated) setHasAnimated(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <InlineImageEditable
                        src={item.image}
                        alt={item.title}
                        width={28}
                        height={28}
                        fieldPath={`features.${index}.image`}
                        sectionIndex={sectionIndex}
                        className="mr-4 flex-shrink-0"
                      />
                    ) : (
                      // Fallback icon if image is missing?
                      <div className="w-7 h-7 mr-4 bg-gray-200 rounded-full flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900"><InlineEditable tag="span" value={item.title || ""} fieldPath={`features.${index}.title`} sectionIndex={sectionIndex} /></p>
                      <p className="text-sm text-gray-600">
                        <InlineEditable tag="span" value={item.description || ""} fieldPath={`features.${index}.description`} sectionIndex={sectionIndex} />
                      </p>
                    </div>
                  </div>
                  <Image
                    src="/images/pages/brand/brandicon/arrow.png"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-sm"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
