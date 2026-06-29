"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface Banner2Props {
  data: {
    imageUrl?: string;
    linkUrl?: string; // Editor uses linkUrl
    link?: string; // Fallback or alternative
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  sectionIndex?: number;
}

export default function Banner2({ data, sectionIndex }: Banner2Props) {
  const { imageUrl, linkUrl, link } = data || {};
  const targetLink = linkUrl || link || "/";

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
  }

  // If no content (imageUrl) and no background, return null
  if (!imageUrl && !data?.bgType) return null;

  return (
    <section style={sectionStyle}>
      <div className="">
        {imageUrl ? (
          <Link
            href={targetLink}
            className="block relative w-full h-[120px] sm:h-[280px] md:h-[400px] lg:h-[500px]  overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-full h-full relative"
            >
              <InlineImageEditable
                src={imageUrl}
                alt="Promotional banner"
                fill
                fieldPath="imageUrl"
                sectionIndex={sectionIndex}
                className="object-cover object-center"
              />
            </motion.div>
          </Link>
        ) : (
          /* Render placeholder or just accessible space if only background is used? 
             Banner2 is height-based. If no image, maybe we shouldn't force height? 
             But if user wants a colored strip... 
             Let's use a div with height if no image but style exists. */
          <div className="w-full h-[120px] sm:h-[120px] md:h-[120px]" />
          // Defaulting to small strip if no imageContent.
        )}
      </div>
    </section>
  );
}
