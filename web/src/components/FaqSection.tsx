"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { motion, Variants } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionData {
  title?: string;
  faqs?: FaqItem[];
  image?: string;
  // Background Options
  bgType?: "image" | "color" | "gradient";
  bgColor?: string;
  bgGradient?: string;
  backgroundImage?: string;
}

export interface FaqSectionProps {
  title?: string;
  faqs?: FaqItem[];
  image?: string;
  data?: FaqSectionData;
}

// Animation variants
const titleVariants: Variants = {
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

const imageVariants: Variants = {
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

const accordionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const accordionItemVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const contentVariants: Variants = {
  closed: { 
    opacity: 0,
    y: -10,
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function FaqSection({ title, faqs, image, data }: FaqSectionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const finalTitle = title || data?.title || "";
  const finalFaqs = faqs || data?.faqs || [];
  const finalImage = image || data?.image;

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
  } else {
    // Default fallback
    sectionStyle.backgroundColor = "white";
  }

  return (
    <section className="w-full py-4 lg:py-8 bg-cover bg-center" style={sectionStyle}>
      <motion.h2
        className="px-1 text-2xl font-semibold tracking-tighter text-center leading-10 lg:leading-14 text-slate-900 sm:text-4xl md:text-5xl"
        dangerouslySetInnerHTML={{ __html: finalTitle }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={titleVariants}
      />

      <div className="container-xl mx-auto px-4 sm:px-8 md:px-10 lg:px-20 grid grid-cols-1 items-start lg:grid-cols-2 gap-8 mt-8">
        {/* ====== LEFT COLUMN - IMAGE ====== */}
        {finalImage && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageVariants}
          >
            <Image src={finalImage} alt="FAQ" width={500} height={500} />
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
              type="single" 
              collapsible
              className="w-full"
              onValueChange={(val) => setOpenItems(val ? [val] : [])}
            >
              {finalFaqs.map((item, index) => (
                <motion.div
                  key={index}
                  variants={accordionItemVariants}
                  className="border-b border-slate-200"
                >
                  <AccordionItem value={`item-${index + 1}`}>
                    <AccordionTrigger className="py-4 text-left font-medium text-slate-800 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="overflow-hidden text-slate-600 pb-4">
                      {item.answer}
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