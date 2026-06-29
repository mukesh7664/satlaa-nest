"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface EventItem {
    image: string;
    title: string;
    description: string;
}

interface SamajEventSliderProps {
  sectionIndex?: number;
    data: {
        topTitle?: string;
        mainTitle?: string;
        subTitle?: string;
        events?: EventItem[];
    };
}

const SamajEventSlider: React.FC<SamajEventSliderProps> = ({ data, sectionIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const {
        topTitle = "All Events",
        mainTitle = "ABMM Event",
        subTitle = "Join us for a vibrant community event, fostering connections and celebrating shared interests and talents. Come together for unity, and memorable experiences!",
        events = [
            {
                image: "/images/event-1.jpg",
                title: "अखिल भारतीय माहेश्वरी महासभा की चतुर्थ कार्यसमिति बैठक",
                description: "दिनांक 10-11 अगस्त 2024, रिनपुर (राजस्थान)"
            },
            {
                image: "/images/event-2.jpg",
                title: "Maheshwari Global Expo 2026",
                description: "Vibrant Community Event, Fostering Connections"
            },
            {
                image: "/images/event-3.jpg",
                title: "अखिल भारतीय माहेश्वरी महासभा के 30वें सत्र की प्रथम कार्यसमिति बैठक",
                description: "दिनांक 23 मार्च 2023, रविवार, भायन्दर (महाराष्ट्र)"
            }
        ]
    } = data;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    return (
        <section className="py-20 bg-[#fdf5f5]">
            <div className="container mx-auto px-4 max-w-6xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[2px] w-12 bg-[#e6a119]" />
                        <span className="text-[#c52d2f] font-bold text-sm tracking-widest uppercase"><InlineEditable tag="span" value={topTitle} fieldPath="topTitle" sectionIndex={sectionIndex} /></span>
                        <div className="h-[2px] w-12 bg-[#e6a119]" />
                    </div>
                    <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6"><InlineEditable tag="span" value={mainTitle} fieldPath="mainTitle" sectionIndex={sectionIndex} /></h2>
                    <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        <InlineEditable tag="span" value={subTitle} fieldPath="subTitle" sectionIndex={sectionIndex} />
                    </p>
                </motion.div>

                <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        {events.map((event, index) => {
                            const offset = (index - currentIndex + events.length) % events.length;
                            const isCenter = offset === 0;
                            const isLeft = offset === events.length - 1;
                            const isRight = offset === 1;

                            if (!isCenter && !isLeft && !isRight && events.length > 3) return null;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: isCenter ? 1 : 0.6,
                                        scale: isCenter ? 1 : 0.85,
                                        x: isCenter ? 0 : isLeft ? -300 : isRight ? 300 : 0,
                                        zIndex: isCenter ? 30 : 10,
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`absolute w-[350px] md:w-[450px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl cursor-pointer`}
                                    onClick={() => {
                                        if (isLeft) handlePrev();
                                        if (isRight) handleNext();
                                    }}
                                >
                                    <InlineImageEditable
                                        src={event.image || "/images/placeholder.jpg"}
                                        alt={event.title}
                                        fill
                                        fieldPath={`events.${index}.image`}
                                        sectionIndex={sectionIndex}
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 text-left pointer-events-none z-[40]">
                                        <h3 className="text-white text-xl font-bold leading-tight mb-2 pointer-events-auto">
                                            <InlineEditable tag="span" value={event.title || ""} fieldPath={`events.${index}.title`} sectionIndex={sectionIndex} />
                                        </h3>
                                        <p className="text-white/80 text-sm pointer-events-auto">
                                            <InlineEditable tag="span" value={event.description || ""} fieldPath={`events.${index}.description`} sectionIndex={sectionIndex} />
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-20 z-40 w-12 h-12 rounded-full bg-[#e6a119] text-white flex items-center justify-center hover:bg-[#c52d2f] transition-all shadow-lg"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-20 z-40 w-12 h-12 rounded-full bg-[#e6a119] text-white flex items-center justify-center hover:bg-[#c52d2f] transition-all shadow-lg"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SamajEventSlider;
