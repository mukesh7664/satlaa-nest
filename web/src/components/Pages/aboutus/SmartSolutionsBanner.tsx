"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface SmartSolutionsBannerProps {
  data?: {
    preTitle?: string;
    title?: string;
    highlightedText?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    mainImage?: string;
    subtitle?: string; // from Admin HeroEditor
    content?: string; // from Admin HeroEditor
    image?: string; // from Admin HeroEditor
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    buttonBgColor?: string;
  };
  sectionIndex?: number;
}

export function SmartSolutionsBanner({ data, sectionIndex }: SmartSolutionsBannerProps) {
  const router = useRouter();

  // Map defaults/fallbacks to match Admin's HeroEditor fields
  const preTitle = data?.subtitle || data?.preTitle || "know from us";
  const title = data?.title || "Smart Software Solutions For Your Success.";
  const highlightedText = data?.highlightedText || "For Your Success.";
  const description =
    data?.content ||
    data?.description ||
    "Your One-Stop Hub to Discover & Compare Business Software";
  const buttonText = data?.buttonText || "Get expert help";
  const buttonLink = data?.buttonLink || "/contact-us";
  const backgroundImage =
    data?.backgroundImage || "/images/pages/homepage/about_bg.png";
  const mainImage =
    data?.image || data?.mainImage || "/images/pages/homepage/about_us.png";

  const bgStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    bgStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    bgStyle.background = data.bgGradient;
  } else {
    bgStyle.backgroundImage = `url('${backgroundImage}')`;
  }

  return (
    <section
      className="w-full bg-cover bg-center relative"
      style={bgStyle}
    >
      <div className="container px-4 sm:px-6 md:px-8 lg:px-10 mx-auto grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-20">
        {/* Left Column - Text Content */}
        <div className="text-center lg:text-left p-10 order-2 lg:order-1">
          <p className="text-base font-medium text-slate-700 md:text-lg">
            <InlineEditable tag="span" value={preTitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-6xl">
            {title.includes(highlightedText) ? (
              title.split(highlightedText).map((part, index, arr) => (
                <React.Fragment key={index}>
                  {part}
                  {index < arr.length - 1 && (
                    <span className="text-[#004DAA]">{highlightedText}</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
            )}
          </h2>
          <p className="mt-6 text-base text-[#303745] md:text-xl">
            <InlineEditable tag="span" value={description} fieldPath="content" sectionIndex={sectionIndex} />
          </p>
          <div className="mt-8">
            <Button
              onClick={() => router.push(buttonLink)}
              size="xl"
              variant="BlueDark"
              style={
                data?.buttonBgColor
                  ? {
                      backgroundColor: data.buttonBgColor,
                      borderColor: data.buttonBgColor,
                    }
                  : undefined
              }
            >
              <InlineEditable tag="span" value={buttonText} fieldPath="buttonText" sectionIndex={sectionIndex} />
            </Button>
          </div>
        </div>

        {/* Right Column - Main Image */}
        <div className="flex items-center justify-center order-1 lg:order-2">
          <InlineImageEditable
            src={mainImage}
            alt="Woman working on laptop"
            width={500}
            height={500}
            fieldPath="image"
            sectionIndex={sectionIndex}
            className="h-auto w-full max-w-[650px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
