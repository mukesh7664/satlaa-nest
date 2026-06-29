"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface FaqItem {
  question: string;
  answer: string;
}

interface BrandFAQProps {
  data: {
    title?: string;
    faqs?: FaqItem[];
    image?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  sectionIndex?: number;
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const accordionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const accordionItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
};

export default function BrandFAQ({ data, sectionIndex }: BrandFAQProps) {
  const { title = "", faqs = [], image } = data || {};
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // Don't render if no FAQs from API
  if (!faqs || faqs.length === 0) {
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
  }

  return (
    <section className="w-full py-4 lg:py-8" style={sectionStyle}>
      <motion.h2
        className="px-1 text-2xl font-semibold tracking-tighter text-center leading-10 lg:leading-14 text-slate-900 sm:text-4xl md:text-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={titleVariants}
      >
        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
      </motion.h2>

      <div className="container-xl mx-auto px-4 sm:px-8 md:px-10 lg:px-20 grid grid-cols-1 items-start lg:grid-cols-2 gap-8 mt-8">
        {/* ====== LEFT COLUMN - IMAGE ====== */}
        {image && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageVariants}
          >
            <InlineImageEditable 
              src={image} 
              alt="FAQ" 
              width={500} 
              height={500}
              fieldPath="image"
              sectionIndex={sectionIndex}
            />
          </motion.div>
        )}

        {/* ====== RIGHT COLUMN - FAQ ACCORDION ====== */}
        <div className="flex flex-col justify-center overflow-hidden">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={accordionContainerVariants}
          >
            <Accordion
              type="multiple"
              className="w-full"
              onValueChange={setOpenItems}
            >
              {faqs.map((item, index) => (
                <motion.div
                  key={index}
                  variants={accordionItemVariants}
                  className="border-b border-slate-200"
                >
                  <AccordionItem value={`item-${index + 1}`}>
                    <AccordionTrigger className="py-4 text-left font-medium text-slate-800 hover:no-underline">
                      <InlineEditable tag="span" value={item.question || ""} fieldPath={`faqs.${index}.question`} sectionIndex={sectionIndex} />
                    </AccordionTrigger>
                    <AccordionContent className="overflow-hidden">
                      <motion.div
                        initial="closed"
                        animate={
                          openItems.includes(`item-${index + 1}`)
                            ? "open"
                            : "closed"
                        }
                        variants={contentVariants}
                        className="pb-4 text-slate-600"
                      >
                        <InlineEditable tag="div" value={item.answer || ""} fieldPath={`faqs.${index}.answer`} sectionIndex={sectionIndex} />
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
