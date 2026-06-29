"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCheckCircle } from "react-icons/fa";
import Link from "next/link";

interface AccordionItem {
    title: string;
    description: string;
}

interface QuickAboutProps {
  sectionIndex?: number;
    data: {
        topTitle?: string;
        mainTitle?: string;
        subTitle?: string;
        image?: string;
        accordionItems?: AccordionItem[];
        buttonText?: string;
        buttonLink?: string;
    };
}

const QuickAbout: React.FC<QuickAboutProps> = ({ data, sectionIndex }) => {
    const {
        topTitle = "More about the Events",
        mainTitle = "अखिल भारतवर्षीय माहेश्वरी महासभा",
        subTitle = "माहेश्वरी महाकुंभ का आगाज़ 2026",
        image = "/images/placeholder.jpg",
        accordionItems = [
            {
                title: "कार्यक्रम की तिथि और स्थान",
                description: "हमें यह बताते हुए अत्यंत हर्ष हो रहा है कि माहेश्वरी ग्लोबल कन्वेंशन (MGC) 2026 का आयोजन दिनांक 9, 10 और 11 जनवरी 2026 को जोधपुर में होने जा रहा है!"
            },
            {
                title: "उद्घाटन सत्र एजेंडा",
                description: "इस भव्य आयोजन की आधिकारिक घोषणा आज जोधपुर में आयोजित अखिल भारतवर्षीय माहेश्वरी महासभा की पश्चिमांचल आंचलिक बैठक में की गई।"
            },
            {
                title: "महासभा की बैठक प्रारंभ",
                description: "समाज की एकता, उन्नति और संस्कृति के गौरवशाली आयोजन से जुड़ने के लिए तैयार हो जाइए!"
            }
        ],
        buttonText = "READ MORE",
        buttonLink = "#"
    } = data;

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-20">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 md:w-20 bg-red-600"></div>
                        <span className="text-red-600 font-medium text-sm md:text-base tracking-wide uppercase">
                            {topTitle}
                        </span>
                        <div className="h-[1px] w-12 md:w-20 bg-red-600"></div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a1a1a] mb-2 leading-tight">
                        {mainTitle}
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                    {/* Left Side: Image */}
                    <motion.div
                        className="w-full lg:w-1/2 relative group"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative aspect-[4/5] overflow-hidden ">
                            <InlineImageEditable
                                src={image}
                                alt={mainTitle}
                                fill
                                fieldPath="image"
                                sectionIndex={sectionIndex}
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Decorative element */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#e6a119] z-[-1] rounded-lg"></div>
                        </div>
                    </motion.div>

                    {/* Right Side: Accordion Content */}
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="text-4xl md:text-5xl font-bold text-red-600 mb-4">
                            {subTitle.split(' ').map((word, i) => (
                                <span key={i} className={word.match(/\d+/) ? "text-[#333]" : ""}>
                                    {word}{' '}
                                </span>
                            ))}
                        </h3>

                        <p className="text-[#333] text-xl md:text-2xl font-semibold mb-10 leading-relaxed">
                            {data?.subTitle || "अंतर्राष्ट्रीय माहेश्वरी महाधिवेशन का आयोजन 9, 10 और 11 जनवरी 2026 को जोधपुर में होने जा रहा है!"}
                        </p>

                        <div className="space-y-6 mb-12">
                            {accordionItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="border-b border-transparent"
                                >
                                    <button
                                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                        className="w-full flex items-start gap-4 text-left group transition-all"
                                    >
                                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded bg-[#e6a119] flex items-center justify-center text-white transition-all ${activeIndex === index ? 'scale-110 shadow-lg' : ''}`}>
                                            <FaCheckCircle className="text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-xl md:text-2xl font-bold transition-colors ${activeIndex === index ? 'text-red-600' : 'text-[#333] group-hover:text-red-600'}`}>
                                                    <InlineEditable tag="span" value={item.title || ""} fieldPath={`accordionItems.${index}.title`} sectionIndex={sectionIndex} />
                                                </h4>
                                                <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-red-600' : ''}`} />
                                            </div>

                                            <AnimatePresence>
                                                {activeIndex === index && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="pt-3 text-[#555] text-lg leading-relaxed font-medium">
                                                            <InlineEditable tag="span" value={item.description || ""} fieldPath={`accordionItems.${index}.description`} sectionIndex={sectionIndex} />
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <Link
                            href={buttonLink}
                            className="inline-block bg-[#e85a1a] text-white px-10 py-5 rounded-md font-bold text-lg tracking-wider transition-all hover:bg-[#d14d14] hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default QuickAbout;
