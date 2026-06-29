"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface AboutPlatformSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    descriptions?: string[];
    images?: {
      roundedBg?: string;
      video?: string;
      meetImage?: string;
    };
    statsCards?: Array<{
      value: string;
      label: string;
      sublabel?: string;
      bgColor?: string;
      bgImage?: string;
    }>;
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

export function AboutPlatformSection({ data, sectionIndex }: AboutPlatformSectionProps & { sectionIndex?: number }) {
  const router = useRouter();

  const title = data?.title || "About our platform";
  const subtitle =
    data?.subtitle ||
    "Helping business to discover & buy the best Technology and Software to grow their business.";
  const descriptions = data?.descriptions || [];
  const roundedBg =
    data?.images?.roundedBg || "/images/pages/aboutus/roundedbg.png";
  const video = data?.images?.video || "/images/pages/aboutus/meetvideo.mp4";
  const meetImage =
    data?.images?.meetImage || "/images/pages/aboutus/meetImage.jpg";
  const statsCards = data?.statsCards || [];
  const buttonText = data?.buttonText || "Explore our products";
  const buttonLink = data?.buttonLink || "/products";

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
      className="container px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-12"
      style={sectionStyle}
    >
      <div className="container-xl mx-auto grid grid-cols-1  xl:grid-cols-2 ">
        {/* ====== LEFT COLUMN: IMAGES & STATS GRID ====== */}
        <section className="w-full  mx-auto ">
          <div className="flex">
            <div className="w-[550px] h-[426px] ">
              <InlineImageEditable
                src={roundedBg}
                alt="bg-logo"
                width={450}
                height={450}
                fieldPath="images.roundedBg"
                sectionIndex={sectionIndex}
              />
            </div>
            <div className="w-[350px] h-[420px] rounded-tl-[195px] relative lg:right-20">
              <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center rounded-tl-[195px] rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div className="xl:w-[338px] 2xl:w-[438px] h-auto bg-[#FAFAFA] rounded-xl relative bottom-42  gap-4  p-4">
              <div className="grid grid-cols-2 gap-6 w-full">
                {statsCards.map((card, index) => {
                  const isImageBg = card.bgColor === "image" && card.bgImage;
                  const bgClass = isImageBg
                    ? ""
                    : card.bgColor === "yellow"
                    ? "bg-[#FFED79]"
                    : card.bgColor === "blue"
                    ? "bg-[#CAE6FF]"
                    : "bg-white";

                  return (
                    <div
                      key={index}
                      className={`relative rounded-xl ${
                        index === 1 || index === 2
                          ? "rounded-br-[80px]"
                          : index === 3
                          ? "rounded-tr-[80px]"
                          : ""
                      } overflow-hidden h-45 flex flex-col ${
                        isImageBg ? "text-white justify-end" : "justify-center"
                      } p-4 ${bgClass}`}
                      style={
                        isImageBg
                          ? {
                              backgroundImage: `url('${card.bgImage}')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : {}
                      }
                    >
                      {isImageBg && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                      )}
                      <div className={`${isImageBg ? "relative z-10" : ""}`}>
                        {card.sublabel && (
                          <p
                            className={`text-sm ${
                              isImageBg ? "text-white" : "text-[#181D27]"
                            }`}
                          >
                            {card.sublabel}
                          </p>
                        )}
                        <h2
                          className={`text-4xl font-semibold ${
                            isImageBg ? "text-white" : "text-[#181D27]"
                          } ${card.sublabel ? "mt-2" : ""}`}
                        >
                          {card.value}
                        </h2>
                        <p
                          className={`text-${isImageBg ? "sm" : "base"} ${
                            isImageBg
                              ? "text-white"
                              : "text-[#181D27] font-medium"
                          }`}
                        >
                          {card.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="w-[165px] h-[227px] justify-self-end hidden md:block relative xl:left-4 2xl:left-10 bottom-42">
              <InlineImageEditable
                src={meetImage}
                alt="meet-image"
                width={165}
                height={227}
                fieldPath="images.meetImage"
                sectionIndex={sectionIndex}
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* ====== RIGHT COLUMN: TEXT CONTENT ====== */}
        <div className="flex flex-col justify-center space-y-6 px-4 lg:px-8">
          <h2
            className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl"
          >
            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>

          <div
            className="text-lg text-slate-700 font-medium"
          >
            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
          </div>

          {descriptions.map((desc, index) => (
            <p key={index} className="text-base text-slate-600 leading-relaxed">
              <InlineEditable tag="span" value={desc || ""} fieldPath={`descriptions.${index}`} sectionIndex={sectionIndex} />
            </p>
          ))}

          <div className="pt-4">
            <Button
              onClick={() => router.push(buttonLink)}
              size="xl"
              variant="BlueDark"
              style={{
                backgroundColor: data?.buttonBgColor || undefined,
                borderColor: data?.buttonBgColor || undefined,
              }}
            >
              <InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
