"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface SamajHeroBannerProps {
  sectionIndex?: number;
    bgImage?: string;
    tagline?: string;
    title?: string;
    subtitle?: string;
    recentNewsLabel?: string;
    recentNewsText?: string;
}

export default function SamajHeroBanner({ data, sectionIndex }: { data: SamajHeroBannerProps, sectionIndex?: number }) {
    const {
        bgImage = "",
        tagline = "",
        title = "",
        subtitle = "",
        recentNewsLabel = "",
        recentNewsText = "",
    } = data || {};

    if (!title) return null;

    return (
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <InlineImageEditable
                    src={bgImage}
                    alt="Hero Background"
                    fill
                    fieldPath="bgImage"
                    sectionIndex={sectionIndex}
                    className="object-cover brightness-[0.4]"
                />
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-4 z-10 text-center text-white pb-32 pt-16 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="pointer-events-auto"
                >
                    {/* Five Star Decoration */}
                    <div className="flex justify-center gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-orange-500 text-xl">★</span>
                        ))}
                    </div>

                    <p className="text-sm md:text-base font-bold tracking-[0.2em] mb-4 uppercase">
                        <InlineEditable tag="span" value={tagline || ""} fieldPath="tagline" sectionIndex={sectionIndex} />
                    </p>

                    <h1 className="text-4xl md:text-7xl font-bold text-orange-500 mb-6 drop-shadow-lg leading-tight">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h1>

                    <p className="text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                        <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                    </p>
                </motion.div>
            </div>

            {/* News Ticker Bar */}
            <div className="absolute bottom-12 left-0 right-0 z-20 px-4 md:px-12 pointer-events-none">
                <div className="max-w-7xl mx-auto bg-white rounded-full overflow-hidden shadow-2xl flex items-center h-16 md:h-14 pointer-events-auto">
                    <div className="bg-orange-600 text-white h-full flex items-center px-6 md:px-10 font-bold whitespace-nowrap text-sm md:text-base italic">
                        <InlineEditable tag="span" value={recentNewsLabel || ""} fieldPath="recentNewsLabel" sectionIndex={sectionIndex} />
                    </div>
                    <div className="flex-1 overflow-hidden px-6">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: "-100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 25,
                                ease: "linear",
                            }}
                            className="whitespace-nowrap font-medium text-gray-800 text-sm md:text-base"
                        >
                            <InlineEditable tag="span" value={recentNewsText || ""} fieldPath="recentNewsText" sectionIndex={sectionIndex} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
