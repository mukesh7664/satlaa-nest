"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FaHome,
    FaRegHospital,
    FaGraduationCap,
    FaHandsHelping
} from "react-icons/fa";

interface HelpCategory {
    title?: string;
    icon?: string;
    link?: string;
    color?: string;
}

interface SamajHelpProps {
  sectionIndex?: number;
    subtitle?: string;
    title?: string;
    categories?: HelpCategory[];
}

const getIcon = (iconName: string) => {
    switch (iconName) {
        case "bhawan": return <FaHome />;
        case "hostel": return <FaHome />; // Image shows a house for hostel too
        case "medical": return <FaRegHospital />;
        case "education": return <FaGraduationCap />;
        default: return <FaHandsHelping />;
    }
};

const getColorClasses = (color: string) => {
    switch (color) {
        case "orange": return "bg-[#E65C19]";
        case "yellow": return "bg-[#FFB74D]";
        case "teal": return "bg-[#008080]";
        case "blue": return "bg-[#0288D1]";
        default: return "bg-[#E65C19]";
    }
};

export default function SamajHelp({ data, sectionIndex }: { data: SamajHelpProps, sectionIndex?: number }) {
    const {
        subtitle = "",
        title = "",
        categories = [],
    } = data || {};

    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-20 px-4 md:px-8 bg-[#FDFBF7] relative overflow-hidden">
            {/* Background Image Overlay */}
            <div
                className="absolute inset-x-0 bottom-0 h-[400px] opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/community-bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                        <span className="text-[#C4302B] font-bold text-sm">
                            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                        </span>
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                </div>

                {/* Categories Grid */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center group"
                        >
                            <Link href={category.link || "#"} className="flex flex-col items-center">
                                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full ${getColorClasses(category.color || "orange")} flex items-center justify-center text-white text-5xl md:text-6xl mb-6 shadow-xl transition-transform duration-300 group-hover:scale-110 border-8 border-white`}>
                                    {getIcon(category.icon || "")}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#E65C19] transition-colors">
                                    <InlineEditable tag="span" value={category.title || ""} fieldPath={`categories.${index}.title`} sectionIndex={sectionIndex} />
                                </h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

