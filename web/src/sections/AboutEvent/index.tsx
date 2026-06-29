"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

interface Stat {
    metric: string;
    label: string;
}

interface AboutEventProps {
  sectionIndex?: number;
    topLabel?: string;
    title?: string;
    description?: string;
    linkText?: string;
    linkUrl?: string;
    backgroundImage?: string;
    statsTitle?: string;
    stats?: Stat[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

export default function AboutEvent({ data, sectionIndex }: { data: AboutEventProps, sectionIndex?: number }) {
    const {
        topLabel = "",
        title = "",
        description = "",
        linkText = "",
        linkUrl = "",
        backgroundImage,
        statsTitle = "",
        stats = [],
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "135deg", // bottom right
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
        patternDirection = "45deg",
    } = data || {};

    if (!title) return null;

    const bannerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: bannerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    const gradientStyle = {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`,
    };

    return (
        <section className="w-full bg-black text-white relative">
            {/* Main Gradient Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none bg-fixed"
                style={gradientStyle}
            />

            {/* Diagonal Line Pattern Overlay */}
            {patternEnabled && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: patternOpacity,
                        backgroundImage: `repeating-linear-gradient(${patternDirection}, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)`
                    }}
                />
            )}
            {/* Top Content */}
            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                        {/* Label */}
                        <div className="w-full md:w-auto">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                <InlineEditable tag="span" value={topLabel || ""} fieldPath="topLabel" sectionIndex={sectionIndex} />
                            </span>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                                <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                            </h2>
                            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl">
                                <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
                            </p>

                            <Link href={linkUrl} className="inline-flex items-center gap-2 text-white font-bold hover:text-gray-300 transition-colors group">
                                <InlineEditable tag="span" value={linkText || ""} fieldPath="linkText" sectionIndex={sectionIndex} />
                                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Banner */}
            <div
                ref={bannerRef}
                className="relative w-full min-h-[350px] md:min-h-[450px] h-auto flex items-end pb-12 pt-12 md:pt-0 overflow-hidden"
                style={{
                    backgroundColor: '#111'
                }}
            >
                {backgroundImage && (
                    <InlineImageEditable
                        src={backgroundImage}
                        alt={statsTitle || "About Event Banner"}
                        fill
                        fieldPath="backgroundImage"
                        sectionIndex={sectionIndex}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                )}
                {backgroundImage && <div className="absolute inset-0 bg-black/30 z-10" />}

                <div className="container mx-auto px-4 relative z-20 pointer-events-none w-full">
                    {statsTitle && (
                        <motion.h2
                            style={{ y }}
                            className="text-3xl md:text-5xl font-bold text-center mb-16 text-white pointer-events-auto"
                        >
                            <InlineEditable tag="span" value={statsTitle || ""} fieldPath="statsTitle" sectionIndex={sectionIndex} />
                        </motion.h2>
                    )}
                    <motion.div style={{ y }} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-start mx-auto w-fit pointer-events-auto">
                                <div className="text-5xl md:text-7xl font-bold mb-2 text-left">
                                    <InlineEditable tag="span" value={stat.metric || ""} fieldPath={`stats.${index}.metric`} sectionIndex={sectionIndex} />
                                </div>
                                <div className="text-lg font-medium text-gray-200 text-left leading-tight max-w-[250px]">
                                    <InlineEditable tag="span" value={stat.label || ""} fieldPath={`stats.${index}.label`} sectionIndex={sectionIndex} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
