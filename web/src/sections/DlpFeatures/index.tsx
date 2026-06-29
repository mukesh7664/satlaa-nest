"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// Define the type for our feature data (matches API structure)
type Feature = {
  icon?: string;
  title: string;
  description: string;
  isFeatured?: boolean;
  buttonText?: string;
  buttonLink?: string;
};

// Animation variants
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

const carouselContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const carouselItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

interface DlpFeaturesProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    features?: Feature[];
    buttonBgColor?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function DlpFeatures({ data, sectionIndex }: DlpFeaturesProps) {
  const { title = "", description, features = [] } = data || {};

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
        {/* Heading Section */}
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
        >
          <h1
            className="text-3xl max-w-4xl mx-auto font-semibold tracking-tight text-[#181D27] sm:text-4xl lg:text-5xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {description && (
            <p
              className="mt-6 text-lg text-gray-600"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </motion.div>

        {/* Feature Cards Carousel */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={carouselContainerVariants}
        >
          <div className="relative group">
            {/* Left Fade Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

            {/* Right Fade Overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full mx-auto"
            >
              <CarouselContent
                className={cn(
                  "-ml-4 pb-4",
                  features.length <= 3 && "justify-center"
                )}
              >
                {features.map((feature, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 basis-[90%] md:basis-1/2 lg:basis-[31.25%]"
                  >
                    <motion.div
                      className="p-1 h-full"
                      variants={carouselItemVariants}
                    >
                      <Card
                        className={cn(
                          "flex h-full w-full flex-col items-center justify-between bg-[#F5F5F5] rounded-md p-8 text-center transition-all duration-300 hover:shadow-lg cursor-pointer",
                          feature.isFeatured &&
                            "border-2 border-[#004DAA] bg-white shadow-2xl"
                        )}
                      >
                        <CardContent className="flex flex-col items-center p-0">
                          {feature.icon && (
                            <div className="h-12 w-12 mb-6 relative">
                              <InlineImageEditable
                                src={feature.icon}
                                alt={feature.title}
                                fill
                                fieldPath={`features.${index}.icon`}
                                sectionIndex={sectionIndex}
                                className="object-contain"
                              />
                            </div>
                          )}

                          <h3 className="text-2xl font-medium text-[#004DAA]">
                            <InlineEditable tag="span" value={feature.title || ""} fieldPath={`features.${index}.title`} sectionIndex={sectionIndex} />
                          </h3>
                          <p className="mt-2 text-base text-gray-600">
                            <InlineEditable tag="span" value={feature.description || ""} fieldPath={`features.${index}.description`} sectionIndex={sectionIndex} />
                          </p>
                        </CardContent>

                        <Link
                          href={feature.buttonLink || "#"}
                          className="w-full mt-8"
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-[#004DAA] text-[#004DAA] hover:bg-[#004DAA] hover:text-white"
                            style={{
                              borderColor: data?.buttonBgColor || undefined,
                              color: data?.buttonBgColor
                                ? data.buttonBgColor
                                : undefined,
                              // For hover, inline styles are tricky. But we can set a CSS variable or just rely on default if no color set.
                              // If color IS set, we might lose hover effect unless we handle it.
                              // However, keeping it simple: APPLY color to Text/Border.
                            }}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: feature.buttonText || "Know More",
                              }}
                            />
                          </Button>
                        </Link>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 z-20" />
              <CarouselNext className="hidden md:flex -right-4 z-20" />
            </Carousel>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
