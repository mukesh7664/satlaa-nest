"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

// --- Main Section Component ---
export interface FeedbackSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonBgColor?: string;
    highlightedText?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

// --- Main Section Component ---
export default function FeedbackSection({ data, sectionIndex }: FeedbackSectionProps) {
  if (data?.show === false) return null;

  const title = data?.title || "Wed love to hear your feedback!";
  const highlightedText = data?.highlightedText || "";
  const description =
    data?.description ||
    "We believe that the best insights come from real users like you. " +
      "By sharing your honest feedback, you not only help us improve but " +
      "also guide other professionals in choosing the right software for " +
      "their needs. Whether youve discovered a feature you love, found " +
      "areas for improvement, or have tips for getting the most out of " +
      "the tool, your review can make a difference.";

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
    sectionStyle.backgroundColor = "#ECF2FF";
  }

  // Safe Highlight Logic
  const getHighlightedTitle = () => {
    if (!data?.title) {
      // Default fallback structure if no custom title provided
      if (!highlightedText) {
        return (
          <>
            Wed love to hear your <br />
            <span className="text-blue-600">feedback!</span>
          </>
        );
      }
    }

    if (/<[a-z][\s\S]*>/i.test(title)) {
      return <span dangerouslySetInnerHTML={{ __html: title }} />;
    }

    if (!highlightedText) return title;

    // Case-insensitive regex escape
    const parts = title.split(new RegExp(`(${highlightedText})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightedText.toLowerCase() ? (
            <span key={i} className="text-[#004DAA]">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <section className="overflow-hidden" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto pt-16 ">
        <div className="grid grid-cols-1 lg:grid-cols-2  items-center">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="font-semibold text-4xl md:text-5xl leading-[60px] tracking-[0%] text-gray-900 "
            >
              {getHighlightedTitle()}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mt-6 text-base text-gray-600  mx-8 lg:mx-0"
            >
              <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Button
                size="lg"
                className="mt-12 px-8 py-6 text-base font-semibold"
                style={{
                  backgroundColor: data?.buttonBgColor || "#004DAA",
                  borderColor: data?.buttonBgColor || "#004DAA",
                }}
                asChild
              >
                <a href={data?.buttonLink || "#"}>
                  <InlineEditable tag="span" value={data?.buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Right Column: Image and Visuals */}
          <div className="flex justify-center items-center ">
            {/* Blue background shape */}

            {/* Main Image - ensure you have this image at public/woman-with-laptop.png */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className=""
            >
              <InlineImageEditable
                src={data?.image || "/images/pages/homepage/reviewsoftware.png"}
                alt="Woman giving feedback on her laptop"
                width={600}
                height={600}
                fieldPath="image"
                sectionIndex={sectionIndex}
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
